import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Star, Trash2 } from 'lucide-react'
import { getNotebookLaunchLinks } from '../config.js'

function extractToc(html) {
  const temp = document.createElement('div')
  temp.innerHTML = html
  const headings = temp.querySelectorAll('h2, h3')
  const toc = []
  headings.forEach((h) => {
    const clone = h.cloneNode(true)
    clone.querySelectorAll('.anchor-link').forEach((link) => link.remove())
    const text = clone.textContent.trim()
    if (!text) return
    toc.push({ id: h.id, text, level: h.tagName === 'H2' ? 2 : 3 })
  })
  return toc
}

function NotebookViewer({ notebook, meta, loading, isBookmarked, toggleBookmark, notes, saveNote, deleteNote }) {
  const contentRef = useRef(null)
  const notebookContentRef = useRef(null)
  const revealFrameRef = useRef(null)
  const tocScrollFrameRef = useRef(null)
  const scrollSpyFrameRef = useRef(null)
  const [toc, setToc] = useState([])
  const [activeHeading, setActiveHeading] = useState(null)
  const [visibleNotebookId, setVisibleNotebookId] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [noteEditor, setNoteEditor] = useState(null)
  const lang = meta?.lang === 'en' ? 'en' : 'zh'

  const shouldReduceMotion = () => {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  }

  const updateActiveHeading = () => {
    const scroller = contentRef.current
    const content = notebookContentRef.current
    const headings = content ? [...content.querySelectorAll('h2, h3')] : []
    if (!scroller || headings.length === 0) return

    if (scroller.scrollTop < 24) {
      const firstId = headings[0]?.id || null
      const tocButtons = scroller.querySelectorAll('.toc-item')
      tocButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.tocId === firstId)
      })
      setActiveHeading((prev) => prev === firstId ? prev : firstId)
      return
    }

    const scrollerRect = scroller.getBoundingClientRect()
    const readingLine = scrollerRect.top + Math.min(scroller.clientHeight * 0.34, 240)
    let current = headings[0]

    for (const heading of headings) {
      if (heading.getBoundingClientRect().top <= readingLine) {
        current = heading
      } else {
        break
      }
    }

    const nextId = current?.id || null
    const tocButtons = scroller.querySelectorAll('.toc-item')
    tocButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.tocId === nextId)
    })
    setActiveHeading((prev) => prev === nextId ? prev : nextId)
  }

  const requestActiveHeadingUpdate = () => {
    if (scrollSpyFrameRef.current) return
    scrollSpyFrameRef.current = requestAnimationFrame(() => {
      scrollSpyFrameRef.current = null
      updateActiveHeading()
    })
  }

  // Extract TOC from notebook HTML
  useEffect(() => {
    if (!notebook?.html) {
      setToc([])
      return
    }
    const items = extractToc(notebook.html)
    setToc(items)
  }, [notebook?.html])

  useLayoutEffect(() => {
    const content = notebookContentRef.current
    if (!notebook?.html || !content) {
      return
    }

    const typesetMath = () => {
      if (!window.MathJax?.typesetPromise) return
      window.MathJax.typesetPromise([content]).catch((error) => {
        console.warn('MathJax typeset failed', error)
      })
    }

    if (window.MathJax?.startup?.promise) {
      window.MathJax.startup.promise.then(typesetMath).catch((error) => {
        console.warn('MathJax startup failed', error)
      })
    } else {
      typesetMath()
    }

    updateActiveHeading()
    content.querySelectorAll('.output_area img, .rendered_html img').forEach((img) => {
      img.setAttribute('tabindex', '0')
      img.setAttribute('role', 'button')
      img.setAttribute('title', lang === 'en' ? 'Click to zoom' : '点击放大')
    })
    const syncTimer = window.setInterval(updateActiveHeading, 120)
    window.addEventListener('resize', requestActiveHeadingUpdate)

    return () => {
      window.clearInterval(syncTimer)
      window.removeEventListener('resize', requestActiveHeadingUpdate)
      if (scrollSpyFrameRef.current) {
        cancelAnimationFrame(scrollSpyFrameRef.current)
        scrollSpyFrameRef.current = null
      }
    }
  }, [notebook?.id, notebook?.html, toc.length])

  // Inject note icons on h2/h3 headings
  useEffect(() => {
    const content = notebookContentRef.current
    if (!notebook?.id || !content) return

    const headings = content.querySelectorAll('h2, h3')
    headings.forEach((h) => {
      let btn = h.querySelector('.section-note-btn')
      if (!btn) {
        btn = document.createElement('button')
        btn.className = 'section-note-btn'
        btn.dataset.sectionId = h.id || ''
        btn.dataset.sectionTitle = h.textContent.replace(/[#\n\r]/g, '').trim()
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>'
        h.appendChild(btn)
      }

      // Always update: note key, tooltip, and class based on current state
      const noteKey = `${notebook.id}::${h.id || ''}`
      btn.dataset.noteKey = noteKey
      const hasNote = notes[noteKey]
      btn.setAttribute('aria-label', lang === 'en' ? (hasNote ? 'Edit note' : 'Add note') : (hasNote ? '编辑笔记' : '添加笔记'))
      btn.setAttribute('title', lang === 'en' ? (hasNote ? 'Edit note' : 'Add note') : (hasNote ? '编辑笔记' : '添加笔记'))
      if (hasNote) {
        btn.classList.add('has-note')
      } else {
        btn.classList.remove('has-note')
      }
    })
  }, [notebook?.id, notebook?.html, notes, lang])

  useEffect(() => {
    if (!imagePreview && !noteEditor) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (imagePreview) setImagePreview(null)
        if (noteEditor) setNoteEditor(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [imagePreview, noteEditor])

  // Reset scroll before paint, then fade the new notebook in.
  useLayoutEffect(() => {
    setVisibleNotebookId(null)
    const scroller = contentRef.current
    if (!scroller) return

    if (revealFrameRef.current) cancelAnimationFrame(revealFrameRef.current)
    if (tocScrollFrameRef.current) cancelAnimationFrame(tocScrollFrameRef.current)
    if (scrollSpyFrameRef.current) {
      cancelAnimationFrame(scrollSpyFrameRef.current)
      scrollSpyFrameRef.current = null
    }

    setActiveHeading(null)
    scroller.scrollTop = 0

    if (shouldReduceMotion()) {
      setVisibleNotebookId(notebook?.id || null)
      return
    }

    revealFrameRef.current = requestAnimationFrame(() => {
      revealFrameRef.current = requestAnimationFrame(() => {
        setVisibleNotebookId(notebook?.id || null)
      })
    })

    return () => {
      if (revealFrameRef.current) cancelAnimationFrame(revealFrameRef.current)
    }
  }, [notebook?.id])

  const handleTocClick = (id) => {
    const scroller = contentRef.current
    if (!scroller) return

    const safeId = typeof CSS !== 'undefined' && CSS.escape
      ? CSS.escape(id)
      : id.replace(/(["'\\!#$%&()*+,./:;<=>?@[\]^`{|}~])/g, '\\$1')
    const el = scroller.querySelector(`#${safeId}`)
    if (!el) return

    setActiveHeading(id)

    const scrollerRect = scroller.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const offset = elRect.top - scrollerRect.top
    const maxScroll = scroller.scrollHeight - scroller.clientHeight
    const target = Math.min(Math.max(scroller.scrollTop + offset - 32, 0), maxScroll)

    const start = scroller.scrollTop
    const delta = target - start
    if (Math.abs(delta) < 1) return

    if (tocScrollFrameRef.current) {
      cancelAnimationFrame(tocScrollFrameRef.current)
    }

    if (shouldReduceMotion()) {
      scroller.scrollTop = target
      return
    }

    const distance = Math.abs(delta)
    const duration = Math.min(Math.max(300 + distance * 0.055, 380), 960)

    let startTime = null
    const easeAppleOut = (t) => {
      return 1 - Math.pow(1 - t, 3)
    }

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeAppleOut(progress)
      scroller.scrollTop = start + delta * eased
      if (progress < 1) {
        tocScrollFrameRef.current = requestAnimationFrame(animate)
      } else {
        tocScrollFrameRef.current = null
      }
    }

    tocScrollFrameRef.current = requestAnimationFrame(animate)
  }

  const handleNotebookClick = (event) => {
    // Note button click
    const noteBtn = event.target.closest('.section-note-btn')
    if (noteBtn && notebookContentRef.current?.contains(noteBtn)) {
      event.preventDefault()
      event.stopPropagation()
      const sectionId = noteBtn.dataset.sectionId || ''
      const sectionTitle = noteBtn.dataset.sectionTitle || ''
      const noteKey = noteBtn.dataset.noteKey || ''
      const rect = noteBtn.getBoundingClientRect()
      setNoteEditor({
        sectionId,
        sectionTitle,
        noteKey,
        text: notes[noteKey]?.text || '',
        top: rect.bottom + 6,
        left: Math.min(rect.left, window.innerWidth - 340),
      })
      return
    }

    const image = event.target.closest('.output_area img, .rendered_html img')
    if (image && notebookContentRef.current?.contains(image)) {
      event.preventDefault()
      event.stopPropagation()
      setImagePreview({
        src: image.currentSrc || image.src,
        alt: image.alt || 'notebook output',
      })
      return
    }

    const copyButton = event.target.closest('.code-copy-button')
    if (copyButton && notebookContentRef.current?.contains(copyButton)) {
      event.preventDefault()
      event.stopPropagation()

      const codeCell = copyButton.closest('.code_cell')
      const pre = codeCell?.querySelector('.input_area pre')
      const code = pre?.innerText || ''
      if (!code) return

      const markCopied = () => {
        copyButton.classList.add('copied')
        copyButton.setAttribute('aria-label', 'Copied code')
        copyButton.setAttribute('title', 'Copied')
        window.setTimeout(() => {
          copyButton.classList.remove('copied')
          copyButton.setAttribute('aria-label', 'Copy code')
          copyButton.setAttribute('title', 'Copy code')
        }, 1200)
      }

      const fallbackCopy = () => {
        const textarea = document.createElement('textarea')
        textarea.value = code
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }

      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(code).then(markCopied).catch(() => {
          fallbackCopy()
          markCopied()
        })
      } else {
        fallbackCopy()
        markCopied()
      }
      return
    }

    const input = event.target.closest('.code-input-expandable')
    if (input && notebookContentRef.current?.contains(input)) {
      const selection = window.getSelection()
      if (selection && !selection.isCollapsed) return

      const toggle = input.querySelector('.code-expand-toggle')
      if (!toggle) return
      toggle.checked = !toggle.checked
      return
    }

    const output = event.target.closest('.output-expandable')
    if (!output || !notebookContentRef.current?.contains(output)) return

    const selection = window.getSelection()
    if (selection && !selection.isCollapsed) return

    const toggle = output.querySelector('.output-expand-toggle')
    if (!toggle) return
    toggle.checked = !toggle.checked
  }

  const handleNotebookKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return

    const image = event.target.closest?.('.output_area img, .rendered_html img')
    if (!image || !notebookContentRef.current?.contains(image)) return

    event.preventDefault()
    setImagePreview({
      src: image.currentSrc || image.src,
      alt: image.alt || 'notebook output',
    })
  }

  if (loading) {
    return (
      <div className="viewer" ref={contentRef}>
        <div className="loading">
          <div className="spinner" />
          <span>{lang === 'en' ? 'Loading...' : '加载中...'}</span>
        </div>
      </div>
    )
  }

  if (!notebook) {
    return (
      <div className="viewer" ref={contentRef}>
        <div className="loading">
          <span>{lang === 'en' ? 'Choose a notebook to start learning' : '选择一个 Notebook 开始学习'}</span>
        </div>
      </div>
    )
  }

  const isVisible = visibleNotebookId === notebook.id
  const launchLinks = getNotebookLaunchLinks(meta, notebook.id)

  return (
    <div className="viewer" ref={contentRef} onScroll={requestActiveHeadingUpdate}>
      <div className={`viewer-header${isVisible ? ' visible' : ''}`}>
        <div className="viewer-part">{meta?.part}</div>
        <h1 className="viewer-title">{meta?.title}</h1>
        {notebook?.id && (
          <button
            className={`bookmark-star ${isBookmarked?.(notebook.id) ? 'active' : ''}`}
            onClick={() => {
              toggleBookmark?.(notebook.id, meta?.title || '')
            }}
            title={isBookmarked?.(notebook.id)
              ? (lang === 'en' ? 'Remove bookmark' : '取消收藏')
              : (lang === 'en' ? 'Bookmark' : '收藏')}
          >
            <Star className="w-5 h-5" />
          </button>
        )}
        <div className="viewer-launches">
          {launchLinks.map((link) => {
            const content = (
              <>
              <span className="viewer-launch-icon" aria-hidden="true">
                {link.id === 'modelscope' && 'MS'}
                {link.id === 'baidu-xinghe' && '星'}
                {link.id === 'colab' && (
                  <svg width="18" height="11" viewBox="0.17 5.07 23.67 13.87" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.54,9.46,2.19,7.1a6.93,6.93,0,0,0,0,9.79l2.36-2.36A3.59,3.59,0,0,1,4.54,9.46Z" fill="#E8710A"/>
                    <path d="M2.19,7.1,4.54,9.46a3.59,3.59,0,0,1,5.08,0l1.71-2.93h0l-.1-.08h0A6.93,6.93,0,0,0,2.19,7.1Z" fill="#F9AB00"/>
                    <path d="M11.34,17.46h0L9.62,14.54a3.59,3.59,0,0,1-5.08,0L2.19,16.9a6.93,6.93,0,0,0,9,.65l.11-.09" fill="#F9AB00"/>
                    <path d="M12,7.1a6.93,6.93,0,0,0,0,9.79l2.36-2.36a3.59,3.59,0,1,1,5.08-5.08L21.81,7.1A6.93,6.93,0,0,0,12,7.1Z" fill="#F9AB00"/>
                    <path d="M21.81,7.1,19.46,9.46a3.59,3.59,0,0,1-5.08,5.08L12,16.9A6.93,6.93,0,0,0,21.81,7.1Z" fill="#E8710A"/>
                  </svg>
                )}
              </span>
              {link.label}
              </>
            )

            if (link.disabled) {
              return (
                <span
                  key={link.id}
                  className={`viewer-launch viewer-launch-${link.id} disabled`}
                  aria-disabled="true"
                  title="Coming soon"
                >
                  {content}
                </span>
              )
            }

            return (
              <a
                key={link.id}
                className={`viewer-launch viewer-launch-${link.id}`}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {content}
              </a>
            )
          })}
        </div>
      </div>

      <div className="viewer-body">
        <div
          key={notebook.id}
          className={`notebook-content${isVisible ? ' visible' : ''}`}
          ref={notebookContentRef}
          onClick={handleNotebookClick}
          onKeyDown={handleNotebookKeyDown}
          dangerouslySetInnerHTML={{ __html: notebook.html }}
        />

        {imagePreview && (
          <div
            className="image-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={lang === 'en' ? 'Image preview' : '图片预览'}
            onClick={() => setImagePreview(null)}
          >
            <button
              className="image-lightbox-close"
              type="button"
              aria-label={lang === 'en' ? 'Close image preview' : '关闭图片预览'}
              onClick={() => setImagePreview(null)}
            >
              ×
            </button>
            <div className="image-lightbox-scroll">
              <img
                src={imagePreview.src}
                alt={imagePreview.alt}
                onClick={(event) => event.stopPropagation()}
              />
            </div>
          </div>
        )}

        {noteEditor && (
          <div
            className="note-editor-backdrop"
            onClick={() => setNoteEditor(null)}
          >
            <div
              className="note-editor-popup"
              style={{ top: noteEditor.top, left: noteEditor.left }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="note-editor-header">
                <span className="note-editor-section">{noteEditor.sectionTitle}</span>
                <button
                  className="note-editor-close"
                  onClick={() => setNoteEditor(null)}
                >&times;</button>
              </div>
              <textarea
                className="note-editor-textarea"
                value={noteEditor.text}
                onChange={(e) => setNoteEditor({ ...noteEditor, text: e.target.value })}
                placeholder={lang === 'en' ? 'Write your note...' : '写下你的笔记...'}
                rows={5}
                autoFocus
              />
              <div className="note-editor-actions">
                {notes[noteEditor.noteKey] && (
                  <button
                    className="note-editor-btn note-editor-delete"
                    onClick={() => {
                      deleteNote?.(notebook.id, noteEditor.sectionId)
                      setNoteEditor(null)
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Delete' : '删除'}</span>
                  </button>
                )}
                <div className="note-editor-spacer" />
                <button
                  className="note-editor-btn note-editor-cancel"
                  onClick={() => setNoteEditor(null)}
                >
                  {lang === 'en' ? 'Cancel' : '取消'}
                </button>
                <button
                  className="note-editor-btn note-editor-save"
                  onClick={() => {
                    saveNote?.(notebook.id, noteEditor.sectionId, noteEditor.sectionTitle, noteEditor.text)
                    setNoteEditor(null)
                  }}
                  disabled={!noteEditor.text.trim() && !notes[noteEditor.noteKey]}
                >
                  {lang === 'en' ? 'Save' : '保存'}
                </button>
              </div>
            </div>
          </div>
        )}

        {toc.length > 0 && (
          <aside className={`toc${isVisible ? ' visible' : ''}`}>
            <div className="toc-sticky">
              <div className="toc-title">{lang === 'en' ? 'Outline' : '大纲'}</div>
              <nav className="toc-nav">
                {toc.map((item) => (
                  <button
                    key={item.id}
                    data-toc-id={item.id}
                    className={`toc-item ${activeHeading === item.id ? 'active' : ''} toc-level-${item.level}`}
                    onClick={() => handleTocClick(item.id)}
                  >
                    {item.text}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

export default NotebookViewer
