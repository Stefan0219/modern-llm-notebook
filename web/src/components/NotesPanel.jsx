import { useRef } from 'react'
import { Download, Upload, Star, StickyNote, ExternalLink, Trash2 } from 'lucide-react'

export default function NotesPanel({
  catalog, bookmarks, notes, getSectionNotes, exportData, importFile, onSelect, lang,
}) {
  const fileInputRef = useRef(null)

  const bookmarkList = Object.entries(bookmarks).sort((a, b) => b[1].addedAt - a[1].addedAt)
  const notebooksWithNotes = new Set()
  const allNotes = []
  for (const [key, note] of Object.entries(notes)) {
    const sepIdx = key.indexOf('::')
    const notebookId = key.slice(0, sepIdx)
    const sectionId = key.slice(sepIdx + 2)
    notebooksWithNotes.add(notebookId)
    allNotes.push({ notebookId, sectionId, ...note })
  }
  allNotes.sort((a, b) => b.updatedAt - a.updatedAt)

  const findMeta = (id) => catalog.find((n) => n.id === id)

  const handleExport = () => {
    const json = exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mln-notes-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await importFile(file)
    if (result.ok) {
      alert(lang === 'zh'
        ? `导入成功：${result.bookmarkCount} 个收藏，${result.noteCount} 条笔记`
        : `Imported: ${result.bookmarkCount} bookmarks, ${result.noteCount} notes`)
    } else {
      alert(lang === 'zh' ? `导入失败：${result.error}` : `Import failed: ${result.error}`)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const t = (zh, en) => lang === 'en' ? en : zh

  return (
    <div className="viewer">
      <div className="viewer-header visible">
        <h1 className="viewer-title">{t('笔记与收藏', 'Notes & Bookmarks')}</h1>
        <div className="viewer-launches" style={{ gap: 10 }}>
          <button onClick={handleExport} className="notes-action-btn"
            title={t('导出数据', 'Export data')}>
            <Download className="w-3.5 h-3.5" />
            <span>{t('导出', 'Export')}</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="notes-action-btn"
            title={t('导入数据', 'Import data')}>
            <Upload className="w-3.5 h-3.5" />
            <span>{t('导入', 'Import')}</span>
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport}
            style={{ display: 'none' }} />
        </div>
      </div>

      <div className="viewer-body">
        <div className="notes-panel">
          {/* Bookmarks section */}
          <section className="notes-section">
            <h2 className="notes-section-title">
              <Star className="w-4 h-4" style={{ fill: '#f59e0b', stroke: '#f59e0b' }} />
              {t('收藏', 'Bookmarks')}
              <span className="notes-count">{bookmarkList.length}</span>
            </h2>
            {bookmarkList.length === 0 ? (
              <p className="notes-empty">{t('还没有收藏任何 Notebook。阅读时点击标题旁的星标即可收藏。', 'No bookmarks yet. Click the star next to a notebook title while reading.')}</p>
            ) : (
              <div className="notes-grid">
                {bookmarkList.map(([id, bm]) => {
                  const meta = findMeta(id)
                  return (
                    <button key={id} className="notes-card" onClick={() => onSelect(id)}>
                      <div className="notes-card-header">
                        <span className="notes-card-num">{id.match(/^\d+/)?.[0] || ''}</span>
                        <span className="notes-card-title">{bm.title}</span>
                      </div>
                      {meta && <div className="notes-card-part">{meta.part}</div>}
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Notes section */}
          <section className="notes-section">
            <h2 className="notes-section-title">
              <StickyNote className="w-4 h-4" />
              {t('笔记', 'Notes')}
              <span className="notes-count">{allNotes.length}</span>
            </h2>
            {allNotes.length === 0 ? (
              <p className="notes-empty">{t('还没有笔记。阅读时点击任意节标题旁的笔记图标即可添加。', 'No notes yet. Click the note icon next to any section heading while reading.')}</p>
            ) : (
              <div className="notes-list">
                {allNotes.map((n) => {
                  const meta = findMeta(n.notebookId)
                  return (
                    <button key={`${n.notebookId}::${n.sectionId}`}
                      className="notes-card notes-card-row"
                      onClick={() => onSelect(n.notebookId)}>
                      <div className="notes-card-main">
                        <span className="notes-card-section">{n.sectionTitle}</span>
                        <span className="notes-card-preview">{n.text.slice(0, 120)}{n.text.length > 120 ? '…' : ''}</span>
                      </div>
                      <div className="notes-card-meta">
                        <span className="notes-card-notebook">{meta?.title || n.notebookId}</span>
                        <span className="notes-card-date">
                          {new Date(n.updatedAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN')}
                        </span>
                        <ExternalLink className="w-3 h-3 notes-card-icon" />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
