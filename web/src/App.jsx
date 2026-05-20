import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import NotebookViewer from './components/NotebookViewer.jsx'
import Welcome from './components/Welcome.jsx'

function App() {
  const [catalog, setCatalog] = useState([])
  const [currentId, setCurrentId] = useState(null)
  const [notebook, setNotebook] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Load catalog
  useEffect(() => {
    fetch('./data/notebooks/index.json')
      .then(r => r.json())
      .then(data => setCatalog(data))
      .catch(console.error)
  }, [])

  // Load notebook when selected
  useEffect(() => {
    if (!currentId) {
      setNotebook(null)
      return
    }
    setLoading(true)
    fetch(`./data/notebooks/${currentId}.json`)
      .then(r => r.json())
      .then(data => {
        setNotebook(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [currentId])

  const handleSelect = useCallback((id) => {
    setCurrentId(id)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  const handleHome = useCallback(() => {
    setCurrentId(null)
    setNotebook(null)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  const currentMeta = catalog.find(n => n.id === currentId)

  return (
    <div className="app">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(v => !v)}
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <Sidebar
        catalog={catalog}
        currentId={currentId}
        onSelect={handleSelect}
        onHome={handleHome}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main">
        {currentId ? (
          <NotebookViewer
            notebook={notebook}
            meta={currentMeta}
            loading={loading}
          />
        ) : (
          <Welcome catalog={catalog} onSelect={handleSelect} />
        )}
      </main>
    </div>
  )
}

export default App
