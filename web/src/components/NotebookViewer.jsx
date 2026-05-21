import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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

function NotebookViewer({ notebook, meta, loading }) {
  const contentRef = useRef(null)
  const notebookContentRef = useRef(null)
  const revealFrameRef = useRef(null)
  const tocScrollFrameRef = useRef(null)
  const scrollSpyFrameRef = useRef(null)
  const [toc, setToc] = useState([])
  const [activeHeading, setActiveHeading] = useState(null)
  const [visibleNotebookId, setVisibleNotebookId] = useState(null)

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

    if (window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise([content]).catch((error) => {
        console.warn('MathJax typeset failed', error)
      })
    }

    updateActiveHeading()
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

  if (loading) {
    return (
      <div className="viewer" ref={contentRef}>
        <div className="loading">
          <div className="spinner" />
          <span>加载中...</span>
        </div>
      </div>
    )
  }

  if (!notebook) {
    return (
      <div className="viewer" ref={contentRef}>
        <div className="loading">
          <span>选择一个 Notebook 开始学习</span>
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
          dangerouslySetInnerHTML={{ __html: notebook.html }}
        />

        {toc.length > 0 && (
          <aside className={`toc${isVisible ? ' visible' : ''}`}>
            <div className="toc-sticky">
              <div className="toc-title">大纲</div>
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
