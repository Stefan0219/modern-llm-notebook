import { useState, useCallback, useMemo } from 'react'

const BOOKMARKS_KEY = 'mln_bookmarks'
const NOTES_KEY = 'mln_notes'

function loadJSON(key, fallback = {}) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return fallback
    return parsed
  } catch {
    return fallback
  }
}

function saveJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable — silently fail
  }
}

function noteKey(notebookId, sectionId) {
  return `${notebookId}::${sectionId}`
}

export default function useNotesAndBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => loadJSON(BOOKMARKS_KEY))
  const [notes, setNotes] = useState(() => loadJSON(NOTES_KEY))

  const toggleBookmark = useCallback((id, title) => {
    setBookmarks((prev) => {
      const next = { ...prev }
      if (next[id]) {
        delete next[id]
      } else {
        next[id] = { title, addedAt: Date.now() }
      }
      saveJSON(BOOKMARKS_KEY, next)
      return next
    })
  }, [])

  const isBookmarked = useCallback((id) => {
    return !!bookmarks[id]
  }, [bookmarks])

  const saveNote = useCallback((notebookId, sectionId, sectionTitle, text) => {
    setNotes((prev) => {
      const next = { ...prev }
      const key = noteKey(notebookId, sectionId)
      if (text.trim()) {
        next[key] = { sectionTitle, text: text.trim(), updatedAt: Date.now() }
      } else {
        delete next[key]
      }
      saveJSON(NOTES_KEY, next)
      return next
    })
  }, [])

  const deleteNote = useCallback((notebookId, sectionId) => {
    setNotes((prev) => {
      const next = { ...prev }
      delete next[noteKey(notebookId, sectionId)]
      saveJSON(NOTES_KEY, next)
      return next
    })
  }, [])

  const getSectionNotes = useCallback((notebookId) => {
    const prefix = `${notebookId}::`
    const result = []
    for (const [key, note] of Object.entries(notes)) {
      if (key.startsWith(prefix)) {
        result.push({ sectionId: key.slice(prefix.length), ...note })
      }
    }
    result.sort((a, b) => b.updatedAt - a.updatedAt)
    return result
  }, [notes])

  const exportData = useCallback(() => {
    return JSON.stringify({ bookmarks, notes, exportedAt: new Date().toISOString() }, null, 2)
  }, [bookmarks, notes])

  const importData = useCallback((jsonString) => {
    try {
      const data = JSON.parse(jsonString)
      if (!data || typeof data !== 'object') throw new Error('Invalid format')
      const newBookmarks = data.bookmarks && typeof data.bookmarks === 'object' && !Array.isArray(data.bookmarks)
        ? data.bookmarks
        : {}
      const newNotes = data.notes && typeof data.notes === 'object' && !Array.isArray(data.notes)
        ? data.notes
        : {}
      setBookmarks(newBookmarks)
      setNotes(newNotes)
      saveJSON(BOOKMARKS_KEY, newBookmarks)
      saveJSON(NOTES_KEY, newNotes)
      return { ok: true, bookmarkCount: Object.keys(newBookmarks).length, noteCount: Object.keys(newNotes).length }
    } catch {
      return { ok: false, error: 'Invalid import file' }
    }
  }, [])

  const importFile = useCallback((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = importData(reader.result)
        resolve(result)
      }
      reader.onerror = () => {
        resolve({ ok: false, error: 'Failed to read file' })
      }
      reader.readAsText(file)
    })
  }, [importData])

  const bookmarkCount = useMemo(() => Object.keys(bookmarks).length, [bookmarks])
  const noteCount = useMemo(() => Object.keys(notes).length, [notes])

  return {
    bookmarks,
    notes,
    toggleBookmark,
    isBookmarked,
    saveNote,
    deleteNote,
    getSectionNotes,
    exportData,
    importData,
    importFile,
    bookmarkCount,
    noteCount,
  }
}
