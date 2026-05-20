import { useEffect, useRef, useState } from 'react'
import { getNotebookColabUrl } from '../config.js'

function extractToc(html) {
  const temp = document.createElement('div')
  temp.innerHTML = html
  const headings = temp.querySelectorAll('h2, h3')
  const toc = []
  headings.forEach((h, i) => {
    const clone = h.cloneNode(true)
    clone.querySelectorAll('.anchor-link').forEach((link) => link.remove())
    const text = clone.textContent.trim()
    if (!text) return
    const id = `toc-${i}`
    toc.push({ id, text, level: h.tagName === 'H2' ? 2 : 3 })
  })
  return toc
}

function NotebookViewer({ notebook, meta, loading }) {
  const contentRef = useRef(null)
  const notebookContentRef = useRef(null)
  const [toc, setToc] = useState([])
  const [activeHeading, setActiveHeading] = useState(null)

  // Extract TOC from notebook HTML
  useEffect(() => {
    if (!notebook?.html) {
      setToc([])
      return
    }
    const items = extractToc(notebook.html)
    setToc(items)
  }, [notebook?.html])

  // Inject IDs into rendered headings and track scroll
  useEffect(() => {
    if (!notebook?.html || !contentRef.current) {
      console.log('TOC init skipped: no html or contentRef')
      return
    }

    const el = notebookContentRef.current
    if (!el) {
      console.log('TOC init: notebookContentRef.current is null')
      return
    }

    // Attach stable TOC targets inside the rendered notebook only.
    const headings = el.querySelectorAll('h2, h3')
    console.log(`TOC init: found ${headings.length} headings in notebook HTML`)
    headings.forEach((h, i) => {
      h.dataset.tocId = `toc-${i}`
    })

    // Track active heading on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.dataset.tocId)
          }
        })
      },
      {
        root: contentRef.current,
        rootMargin: '-18% 0px -72% 0px',
        threshold: 0,
      }
    )

    headings.forEach((h) => observer.observe(h))
    return () => {
      console.log('TOC disconnect')
      observer.disconnect()
    }
  }, [notebook?.html])

  // Scroll to top when notebook changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [notebook?.id])

  const handleTocClick = (id) => {
    console.log('handleTocClick called with id:', id)
    const scroller = contentRef.current
    const content = notebookContentRef.current
    console.log('scroller:', scroller)
    console.log('content:', content)
    
    if (!content) {
      console.log('Error: content is null')
      return
    }
    if (!scroller) {
      console.log('Error: scroller is null')
      return
    }

    const el = content.querySelector(`[data-toc-id="${id}"]`)
    console.log('Found element:', el)
    if (!el) {
      // Let's print all data-toc-id attributes in the content to see what exists
      const allWithIds = content.querySelectorAll('[data-toc-id]')
      console.log(`Available elements with data-toc-id:`, Array.from(allWithIds).map(x => `${x.tagName}: ${x.dataset.tocId} (${x.textContent.substring(0, 20)})`))
      return
    }

    const scrollerRect = scroller.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    console.log('scrollerRect:', scrollerRect)
    console.log('elRect:', elRect)

    const distance = elRect.top - scrollerRect.top
    const targetScrollTop = scroller.scrollTop + distance
    console.log('distance:', distance, 'scroller.scrollTop:', scroller.scrollTop, 'targetScrollTop:', targetScrollTop)

    scroller.scrollTo({
      top: Math.max(targetScrollTop - 24, 0),
      behavior: 'smooth',
    })
    console.log('scroller.scrollTop after scrollTo command (might be async due to smooth scroll):', scroller.scrollTop)
    setActiveHeading(id)
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

  return (
    <div className="viewer" ref={contentRef}>
      <div className="viewer-header">
        <div className="viewer-part">{meta?.part}</div>
        <h1 className="viewer-title">{meta?.title}</h1>
        <a
          className="viewer-colab"
          href={getNotebookColabUrl(meta, notebook.id)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.4 4.2c-.2 0-.4.1-.6.2L8.6 8.1c-.3.2-.6.5-.6.9v6c0 .4.3.7.6.9l7.3 3.7c.2.1.4.2.6.2.5 0 .9-.4.9-.9V5.1c-.1-.5-.5-.9-1-.9zm-.9 9.6l-5.8-2.9V9.7l5.8-2.9v7zM24 12c0 6.6-5.4 12-12 12S0 18.6 0 12 5.4 0 12 0s12 5.4 12 12zm-1 0c0-6.1-4.9-11-11-11S1 5.9 1 12s4.9 11 11 11 11-4.9 11-11z"/>
          </svg>
          在 Colab 中打开
        </a>
      </div>

      <div className="viewer-body">
        <div
          className="notebook-content"
          ref={notebookContentRef}
          dangerouslySetInnerHTML={{ __html: notebook.html }}
        />

        {toc.length > 0 && (
          <aside className="toc">
            <div className="toc-sticky">
              <div className="toc-title">大纲</div>
              <nav className="toc-nav">
                {toc.map((item) => (
                  <button
                    key={item.id}
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
