import { useEffect, useRef, useState } from 'react'
import { getNotebookColabUrl } from '../config.js'

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

  // Track active heading on scroll
  useEffect(() => {
    if (!notebook?.html || !contentRef.current) return

    const el = notebookContentRef.current
    if (!el) return

    const headings = el.querySelectorAll('h2, h3')
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id)
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
    return () => observer.disconnect()
  }, [notebook?.html])

  // Scroll to top when notebook changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
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

    const scrollerRect = scroller.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const distance = elRect.top - scrollerRect.top
    const targetScrollTop = scroller.scrollTop + distance

    scroller.scrollTo({
      top: Math.max(targetScrollTop - 24, 0),
      behavior: 'smooth',
    })
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.77 8.7C.63 9.82 0 11.32 0 12.93s.63 3.1 1.77 4.22L4.9 13.9c-.38-.5-.6-1.12-.6-1.78 0-.66.22-1.28.6-1.78L1.77 8.7z" fill="#F9AB00"/>
            <path d="M12 22.6c1.63 0 3.15-.62 4.28-1.74l-3.15-3.15a2.99 2.99 0 01-2.26.9 2.99 2.99 0 01-2.26-.9L5.46 20.86C6.59 21.98 8.1 22.6 9.74 22.6H12z" fill="#E8710A"/>
            <path d="M1.77 8.7L4.9 11.9c.37-.5.91-.85 1.54-1.01V6.34A5.76 5.76 0 002.48 8.7H1.77z" fill="#F9AB00"/>
            <path d="M12 1.4c-1.63 0-3.15.62-4.28 1.74l3.15 3.15c.57-.44 1.28-.7 2.02-.7.74 0 1.45.26 2.02.7l3.15-3.15C15.13 2.02 13.62 1.4 12 1.4z" fill="#E8710A"/>
            <path d="M12 22.6h2.26c1.64 0 3.15-.62 4.28-1.74l-3.13-3.13c-.57.44-1.28.7-2.02.7-.74 0-1.45-.26-2.02-.7l-3.15 3.15C8.85 21.98 10.37 22.6 12 22.6z" fill="#F9AB00"/>
            <path d="M17.68 14.9c.38.5.6 1.12.6 1.78 0 .66-.22 1.28-.6 1.78l3.15 3.15C21.97 20.5 22.6 19 22.6 17.38c0-1.61-.63-3.1-1.77-4.22l-3.15 3.14z" fill="#E8710A"/>
            <path d="M17.68 14.9l3.15-3.14a5.76 5.76 0 00-3.96-2.36v4.54c.63.16 1.17.51 1.54 1.01l.27-.05z" fill="#F9AB00"/>
            <path d="M17.68 9.1l3.15-3.14C19.7 4.83 18.19 4.21 16.55 4.21H12c1.63 0 3.15.62 4.28 1.74l1.4 3.15z" fill="#E8710A"/>
            <path d="M12 4.21c.74 0 1.45.26 2.02.7l1.4-3.15A5.76 5.76 0 0012 0c-1.63 0-3.15.62-4.28 1.74l1.4 3.15c.57-.44 1.28-.7 2.02-.7z" fill="#F9AB00"/>
            <path d="M6.44 10.89c-.63.16-1.17.51-1.54 1.01l-1.4-3.15a5.76 5.76 0 00-1.73 2.36l3.15 3.14 1.52-3.36z" fill="#E8710A"/>
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
