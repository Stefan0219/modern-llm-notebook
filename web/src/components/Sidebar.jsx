import { useState, useEffect, useRef } from 'react'
import {
  BookMarked,
  Code2,
  GitFork,
  Github,
  GraduationCap,
  History,
  X,
} from 'lucide-react'

const SECTION_KEYS = ['foundation', 'training', 'inference', 'frontiers', 'production']
const SECTION_LABELS = {
  foundation: { title: '基础', titleEn: 'FOUNDATION' },
  training: { title: '训练', titleEn: 'TRAINING' },
  inference: { title: '推理', titleEn: 'INFERENCE' },
  frontiers: { title: '前沿', titleEn: 'FRONTIERS' },
  production: { title: '评测与部署', titleEn: 'EVAL & DEPLOY' },
}

function getSectionKey(partDir) {
  return String(partDir || '').replace(/^part\d+-/, '')
}

function getLessonNumber(id) {
  return String(id || '').match(/^\d+/)?.[0] || ''
}

function buildSidebarSections(catalog) {
  const sections = new Map()
  for (const item of catalog) {
    const section = getSectionKey(item.partDir)
    if (!sections.has(section)) {
      sections.set(section, {
        ...(SECTION_LABELS[section] || { title: section, titleEn: section.toUpperCase() }),
        lessons: [],
      })
    }
    sections.get(section).lessons.push({
      id: item.id,
      num: getLessonNumber(item.id),
      title: item.title,
      section,
    })
  }
  return SECTION_KEYS
    .map(section => sections.get(section))
    .filter(Boolean)
}

export default function Sidebar({ catalog, currentId, lang, onLanguageChange, onSelect, onHome, onStartTour, onOpenNotes, bookmarks = {}, notes = {}, isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState('all') // 'all' | 'bookmarked' | 'noted'
  const listRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      const section = e.detail?.section
      if (!section || !listRef.current) return
      const idx = SECTION_KEYS.indexOf(section)
      if (idx < 0) return
      const sectionEls = listRef.current.querySelectorAll('[data-section-key]')
      const target = sectionEls[idx]
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        target.classList.remove('sidebar-section-highlight')
        void target.offsetWidth
        target.classList.add('sidebar-section-highlight')
      }
    }
    window.addEventListener('sidebar-scroll-to', handler)
    return () => window.removeEventListener('sidebar-scroll-to', handler)
  }, [])

  const sidebarSections = buildSidebarSections(catalog)
  const filteredSections = sidebarSections.map(section => ({
    ...section,
    lessons: section.lessons.filter(lesson => {
      if (filterMode === 'bookmarked') return !!bookmarks[lesson.id]
      if (filterMode === 'noted') return Object.keys(notes).some(k => k.startsWith(lesson.id + '::'))
      if (!searchQuery) return true
      return lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.num.includes(searchQuery)
    }),
  })).filter(section => section.lessons.length > 0)

  const inFilterMode = filterMode !== 'all'

  const hasBookmarks = Object.keys(bookmarks).length > 0
  const hasNotes = Object.keys(notes).length > 0

  return (
    <aside className={`w-64 h-screen max-h-screen border-r flex flex-col justify-between shrink-0 md:sticky md:top-0 z-30 transition-transform duration-300 ${
      isOpen ? 'translate-x-0 fixed inset-y-0 left-0' : '-translate-x-full md:translate-x-0 absolute'
    } bg-white border-slate-100`}>

      {/* Header */}
      <div className="p-6 border-b shrink-0 flex flex-col gap-4 z-10 select-none border-slate-100">
        <div className="flex items-center justify-between">
          <button onClick={onHome} className="brand-button" aria-label="Modern LLM Notebook">
            <span className="brand-logo" aria-hidden="true">
              <GitFork className="brand-logo-fork" />
              <Code2 className="brand-logo-code" />
            </span>
            <span className="brand-copy">
              <span className="brand-line brand-line-main">Modern LLM</span>
              <span className="brand-line brand-line-sub">Notebook</span>
            </span>
          </button>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language toggle */}
        <div className="bg-slate-50 p-1 rounded-full flex items-center w-36 border border-slate-200/50 select-none">
          <button
            onClick={() => onLanguageChange('zh')}
            className={`flex-1 py-1 rounded-full text-xs font-bold transition-all ${
              lang === 'zh'
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200/20'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            中文
          </button>
          <button
            onClick={() => onLanguageChange('en')}
            className={`flex-1 py-1 rounded-full text-xs font-bold transition-all ${
              lang === 'en'
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200/20'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 pt-4 pb-0 flex items-center gap-1.5 select-none">
        <button
          onClick={() => setFilterMode('all')}
          className={`sidebar-filter-tab ${filterMode === 'all' ? 'active' : ''}`}
        >{lang === 'zh' ? '全部' : 'All'}</button>
        <button
          onClick={() => setFilterMode('bookmarked')}
          className={`sidebar-filter-tab ${filterMode === 'bookmarked' ? 'active' : ''}`}
          disabled={!hasBookmarks}
        >{lang === 'zh' ? '已收藏' : 'Saved'}</button>
        <button
          onClick={() => setFilterMode('noted')}
          className={`sidebar-filter-tab ${filterMode === 'noted' ? 'active' : ''}`}
          disabled={!hasNotes}
        >{lang === 'zh' ? '有笔记' : 'Noted'}</button>
      </div>

      {/* Lessons list */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-6 select-none">
        {filteredSections.length === 0 ? (
          <div className="text-xs text-slate-400 text-center py-8">
            {inFilterMode
              ? (lang === 'zh' ? '没有匹配的章节' : 'No matching chapters')
              : (lang === 'zh' ? '未找到相关章节' : 'No chapters found')}
          </div>
        ) : (
          filteredSections.map((section, idx) => (
            <div key={idx} data-section-key={section.lessons[0]?.section} className="space-y-4 transition-all duration-500">
              <div className="flex items-center gap-1.5 px-2">
                <span className="text-xs font-bold text-slate-700">
                  {lang === 'zh' ? section.title : section.titleEn}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-350 tracking-wider">
                  {section.titleEn}
                </span>
              </div>

              <div className="space-y-3">
                {section.lessons.map((lesson) => {
                  const isSelected = currentId === lesson.id
                  const isBm = !!bookmarks[lesson.id]
                  const hasNote = Object.keys(notes).some(k => k.startsWith(lesson.id + '::'))
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onSelect(lesson.id)}
                      className={`group w-full text-left flex items-center justify-between px-2 py-1 rounded-lg text-xs leading-normal transition-all duration-150 cursor-pointer ${
                        isSelected ? 'bg-slate-100/70 font-semibold' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full min-w-0">
                        <div className={`w-8 h-5 rounded flex items-center justify-center font-mono text-[10px] font-medium shrink-0 ${
                          isSelected ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {lesson.num}
                        </div>
                        <span className={`truncate font-medium text-xs ${
                          isSelected ? 'text-slate-800 font-bold' : 'text-slate-500 group-hover:text-slate-800'
                        }`}>
                          {lesson.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        {isBm && <span className="sidebar-item-star" title={lang === 'zh' ? '已收藏' : 'Bookmarked'}>&#9733;</span>}
                        {hasNote && <span className="sidebar-item-note-dot" title={lang === 'zh' ? '有笔记' : 'Has notes'}>&#183;</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 shrink-0 border-t flex flex-col gap-2.5 border-slate-100 bg-slate-50/40">
        <div className="space-y-1">
          <button
            onClick={() => { onStartTour?.() }}
            className="w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'zh' ? '新手指导' : 'Guided Tour'}</span>
          </button>
          <button
            onClick={() => onOpenNotes?.()}
            className="w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 transition-colors"
          >
            <BookMarked className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'zh' ? '笔记与收藏' : 'Notes & Saved'}</span>
          </button>
          <button
            onClick={() => alert(lang === 'zh' ? '当前版本: v1.0.5' : 'Current version: v1.0.5')}
            className="w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'zh' ? '更新日志' : 'Changelog'}</span>
          </button>
        </div>

        <div className="border-t border-slate-200/60 my-1"></div>

        <div className="flex items-center justify-between px-1">
          <a href="https://github.com/walkinglabs/modern-llm-notebook" target="_blank" rel="noreferrer"
            className="text-slate-400 hover:text-slate-700 transition-colors p-1">
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </aside>
  )
}
