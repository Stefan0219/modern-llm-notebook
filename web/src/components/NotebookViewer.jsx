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
          <svg width="18" height="11" viewBox="0.17 5.07 23.67 13.87" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.54,9.46,2.19,7.1a6.93,6.93,0,0,0,0,9.79l2.36-2.36A3.59,3.59,0,0,1,4.54,9.46Z" fill="#E8710A"/>
            <path d="M2.19,7.1,4.54,9.46a3.59,3.59,0,0,1,5.08,0l1.71-2.93h0l-.1-.08h0A6.93,6.93,0,0,0,2.19,7.1Z" fill="#F9AB00"/>
            <path d="M11.34,17.46h0L9.62,14.54a3.59,3.59,0,0,1-5.08,0L2.19,16.9a6.93,6.93,0,0,0,9,.65l.11-.09" fill="#F9AB00"/>
            <path d="M12,7.1a6.93,6.93,0,0,0,0,9.79l2.36-2.36a3.59,3.59,0,1,1,5.08-5.08L21.81,7.1A6.93,6.93,0,0,0,12,7.1Z" fill="#F9AB00"/>
            <path d="M21.81,7.1,19.46,9.46a3.59,3.59,0,0,1-5.08,5.08L12,16.9A6.93,6.93,0,0,0,21.81,7.1Z" fill="#E8710A"/>
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
