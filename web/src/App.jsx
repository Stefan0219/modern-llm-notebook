import { useState, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { Menu } from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import NotebookViewer from './components/NotebookViewer.jsx'
import NotesPanel from './components/NotesPanel.jsx'
import Welcome from './components/Welcome.jsx'
import GuidedTour from './components/GuidedTour.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import ChangelogModal from './components/ChangelogModal.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import useSettings from './hooks/useSettings.js'
import useTheme from './hooks/useTheme.js'
import useNotesAndBookmarks from './hooks/useNotesAndBookmarks.js'
import { getCatalog, getNotebook } from './data/notebooks.js'

const NOTES_SENTINEL = '__notes__'

const DEFAULT_LANG = 'zh'

const LEGACY_NOTEBOOK_IDS = {
  '04-mini-gpt': '05-mini-gpt',
  '05-architecture-refinements': '06-gpt2-to-modern-models',
  '06-architecture-refinements': '06-gpt2-to-modern-models',
  '06-llama-architecture-upgrades': '06-gpt2-to-modern-models',
  '06-moe': '07-moe',
  '07-bert-encoder': '08-bert-encoder',
  '08-training-loss': '09-training-loss',
  '09-scaling-laws': '10-scaling-laws',
  '10-data-engineering': '11-data-engineering',
  '11-lora': '12-lora',
  '12-midtraining-cpt': '13-midtraining-cpt',
  '13-rlhf-alignment': '14-rlhf-alignment',
  '13-generation': '15-generation',
  '14-inference-acceleration': '16-inference-acceleration',
  '15-speculative-decoding': '17-speculative-decoding',
  '16-long-context': '18-long-context',
  '17-cot-thinking': '19-cot-thinking',
  '18-vlm': '20-vlm',
  '19-evaluation': '21-evaluation',
  '20-distillation': '22-distillation',
  '21-opd': '23-opd',
}

// 从构建时注入的 git log 数据中读取
const CHANGELOG_COMMITS = typeof __CHANGELOG_COMMITS__ !== 'undefined' ? __CHANGELOG_COMMITS__ : []

function normalizeNotebookId(id) {
  return LEGACY_NOTEBOOK_IDS[id] || id
}

function normalizeLang(lang) {
  return lang === 'en' ? 'en' : DEFAULT_LANG
}

function getInitialLang() {
  const params = new URLSearchParams(window.location.search)
  return normalizeLang(params.get('lang') || window.localStorage.getItem('language'))
}

function writeLangToUrl(lang) {
  const params = new URLSearchParams(window.location.search)
  if (lang === DEFAULT_LANG) {
    params.delete('lang')
  } else {
    params.set('lang', lang)
  }
  const query = params.toString()
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
  window.history.replaceState(null, '', nextUrl)
}

function replaceUrlWithHash(id, lang = DEFAULT_LANG) {
  const params = new URLSearchParams(window.location.search)
  if (lang === DEFAULT_LANG) {
    params.delete('lang')
  } else {
    params.set('lang', lang)
  }
  const query = params.toString()
  const hash = id ? `#${id}` : ''
  window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${hash}`)
}

function getInitialNotebookId() {
  const hash = window.location.hash.replace(/^#\/?/, '')
  return hash ? normalizeNotebookId(hash) : null
}

function AppContent() {
  const [lang, setLang] = useState(() => getInitialLang())
  const [catalog, setCatalog] = useState(() => getCatalog(lang))
  const [currentId, setCurrentId] = useState(() => getInitialNotebookId())
  const [loading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tourActive, setTourActive] = useState(false)
  const [tourStepIndex, setTourStepIndex] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [changelogOpen, setChangelogOpen] = useState(false)

  const { settings, updateSettings } = useSettings()
  const { resolvedTheme, toggleTheme } = useTheme(settings.theme)
  const nbm = useNotesAndBookmarks()

  // 同步字号到 CSS 变量
  useEffect(() => {
    const sizeMap = { small: '14.5px', default: '16.5px', large: '18.5px' }
    document.documentElement.style.setProperty('--font-size-notebook', sizeMap[settings.fontSize] || '16.5px')
  }, [settings.fontSize])

  useEffect(() => {
    setCatalog(getCatalog(lang))
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN'
    window.localStorage.setItem('language', lang)
    writeLangToUrl(lang)
  }, [lang])

  useEffect(() => {
    const syncFromHash = () => {
      const nextId = getInitialNotebookId()
      if (nextId === NOTES_SENTINEL) return
      setCurrentId((prev) => {
        if (prev === NOTES_SENTINEL) return prev
        return nextId
      })
      if (nextId && window.location.hash !== `#${nextId}`) {
        replaceUrlWithHash(nextId, lang)
      }
    }

    window.addEventListener('hashchange', syncFromHash)
    window.addEventListener('popstate', syncFromHash)
    syncFromHash()
    return () => {
      window.removeEventListener('hashchange', syncFromHash)
      window.removeEventListener('popstate', syncFromHash)
    }
  }, [lang])

  const handleSelect = useCallback((id) => {
    flushSync(() => setCurrentId(id))
    replaceUrlWithHash(id, lang)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [lang])

  const handleLanguageChange = useCallback((nextLang) => {
    setLang(normalizeLang(nextLang))
  }, [])

  const handleHome = useCallback(() => {
    flushSync(() => setCurrentId(null))
    replaceUrlWithHash(null, lang)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [lang])

  const handleOpenNotes = useCallback(() => {
    flushSync(() => setCurrentId(NOTES_SENTINEL))
    replaceUrlWithHash(null, lang)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [lang])

  const currentMeta = catalog.find(n => n.id === currentId)
  const notebook = currentId ? getNotebook(currentId, lang) : null
  const tourNotebookId = catalog.find(n => n.id === '01-tokenizer-basics')?.id || catalog[0]?.id
  const tourCopy = {
    zh: [
      {
        target: '.hero',
        title: '欢迎来到 Modern LLM Notebook',
        body: '这不是 API 调用教程，而是从零重建 LLM 核心系统的交互式课程。你会沿着模型真正运转的顺序，理解文本如何变成 token、参数如何训练、模型如何生成答案。',
      },
      {
        target: '.stats',
        title: '课程规模',
        body: '23 篇可运行 Notebook，覆盖 5 大学习路径、20+ 核心模块。每篇都是可执行代码，读完马上能改代码观察结果。',
      },
      {
        target: '[data-tour="features"]',
        title: '课程特色',
        body: '浏览器内直接渲染 Notebook，无需配置环境。中英双语支持，代码级图解帮助你直观理解模型结构。',
      },
      {
        target: '.parts',
        title: '5 大学习路径',
        body: '这里是整套课程的地图：基础、训练、推理、前沿、评测与部署。每张卡片概括一个阶段要解决的问题，点击后会定位到对应学习路径，方便你从全局选择下一步。',
      },
      {
        target: '[data-tour="notebooks"]',
        title: '精选可运行 Notebook',
        body: '这里展示了 10 篇推荐 Notebook，每篇都有独特的可视化封面。点击即可进入阅读，支持一键打开到 ModelScope、百度星河社区或 Colab 运行。',
        nextLabel: '进入 01',
        action: 'open-notebook',
      },
      {
        target: '.viewer-launches',
        title: '一键运行',
        body: '顶部按钮可以把当前 Notebook 打开到 ModelScope、百度星河社区或 Colab，在线运行代码，无需本地配置。',
      },
      {
        target: '.toc',
        title: '右侧大纲导航',
        body: '右侧大纲对应每个学习环节，点击可快速跳转。推荐阅读顺序：先看直觉理解，再看手算验证，然后运行代码，最后观察输出。',
      },
      {
        target: '.code_cell',
        title: '代码和输出可展开',
        body: '每个核心算法都会落到代码。长代码和长输出默认折叠，点击可展开查看完整内容。右上角按钮可以复制代码。',
      },
      {
        target: '.viewer-header',
        title: '开始你的学习旅程',
        body: '从 01 Tokenizer 开始，一步步搭建你的 LLM 知识体系。每篇 Notebook 都是自包含的，可以按任意顺序阅读。',
      },
    ],
    en: [
      {
        target: '.hero',
        title: 'Welcome to Modern LLM Notebook',
        body: 'This is not an API tutorial. It rebuilds core LLM systems from scratch via interactive notebooks, following the path from text to tokens, training, and generation.',
      },
      {
        target: '.stats',
        title: 'Course Overview',
        body: '23 runnable notebooks across 5 learning paths and 20+ core modules. Every notebook is executable — read, modify, and observe results immediately.',
      },
      {
        target: '[data-tour="features"]',
        title: 'What Makes It Different',
        body: 'Notebooks render directly in your browser with zero setup. Bilingual support and code-level diagrams help you understand model internals intuitively.',
      },
      {
        target: '.parts',
        title: '5 Learning Paths',
        body: 'This is the course map: Foundation, Training, Inference, Frontiers, and Eval & Deploy. Each card summarizes one stage, and clicking a card takes you to that learning path so you can choose the next step from the full curriculum.',
      },
      {
        target: '[data-tour="notebooks"]',
        title: 'Runnable Notebooks',
        body: '10 recommended notebooks with unique visual covers. Click to start reading, or open in ModelScope, Baidu Xinghe, or Google Colab to run code online.',
        nextLabel: 'Open 01',
        action: 'open-notebook',
      },
      {
        target: '.viewer-launches',
        title: 'One-Click Run',
        body: 'The top buttons open the current notebook in ModelScope, Baidu Xinghe, or Google Colab. Run code online without any local setup.',
      },
      {
        target: '.toc',
        title: 'Table of Contents',
        body: 'The right sidebar outlines each section. Click to jump. Recommended order: read the intuition first, then hand calculation, then run code, then observe outputs.',
      },
      {
        target: '.code_cell',
        title: 'Expandable Code & Output',
        body: 'Core algorithms land in code. Long code and output blocks are collapsed by default — click to expand. Use the copy button in the top-right corner.',
      },
      {
        target: '.viewer-header',
        title: 'Start Your Journey',
        body: 'Begin with 01 Tokenizer and build your LLM knowledge step by step. Each notebook is self-contained — read in any order.',
      },
    ],
  }
  const tourSteps = tourCopy[lang]

  const startTour = useCallback(() => {
    flushSync(() => {
      setCurrentId(null)
      setSidebarOpen(true)
      setTourStepIndex(0)
      setTourActive(true)
    })
    replaceUrlWithHash(null, lang)
  }, [lang])

  const stopTour = useCallback(() => {
    setTourActive(false)
  }, [])

  const handleTourNext = useCallback(() => {
    const step = tourSteps[tourStepIndex]
    if (step?.action === 'open-notebook' && tourNotebookId) {
      flushSync(() => {
        setCurrentId(tourNotebookId)
        setSidebarOpen(true)
      })
      replaceUrlWithHash(tourNotebookId, lang)
    }

    if (tourStepIndex >= tourSteps.length - 1) {
      setTourActive(false)
      return
    }
    setTourStepIndex(i => i + 1)
  }, [lang, tourNotebookId, tourStepIndex, tourSteps])

  const handleTourPrev = useCallback(() => {
    setTourStepIndex(i => Math.max(0, i - 1))
  }, [])

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--bg-app)] text-[var(--text-body)] font-sans antialiased">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-[var(--bg-sidebar)]/80 border border-[var(--border-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-sm backdrop-blur-md transition-colors select-none"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black/20 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        catalog={catalog}
        currentId={currentId}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        onSelect={handleSelect}
        onHome={handleHome}
        onStartTour={startTour}
        onOpenNotes={handleOpenNotes}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenChangelog={() => setChangelogOpen(true)}
        bookmarks={nbm.bookmarks}
        notes={nbm.notes}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-y-auto">
        {currentId === NOTES_SENTINEL ? (
          <NotesPanel
            catalog={catalog}
            bookmarks={nbm.bookmarks}
            notes={nbm.notes}
            getSectionNotes={nbm.getSectionNotes}
            exportData={nbm.exportData}
            importFile={nbm.importFile}
            onSelect={handleSelect}
            lang={lang}
          />
        ) : currentId ? (
          <NotebookViewer
            notebook={notebook}
            meta={currentMeta}
            loading={loading}
            isBookmarked={nbm.isBookmarked}
            toggleBookmark={nbm.toggleBookmark}
            notes={nbm.notes}
            saveNote={nbm.saveNote}
            deleteNote={nbm.deleteNote}
          />
        ) : (
          <Welcome
            catalog={catalog}
            lang={lang}
            onLanguageChange={handleLanguageChange}
            onSelect={handleSelect}
            onStartTour={startTour}
          />
        )}
      </main>

      <GuidedTour
        active={tourActive}
        step={tourSteps[tourStepIndex]}
        stepIndex={tourStepIndex}
        totalSteps={tourSteps.length}
        lang={lang}
        onNext={handleTourNext}
        onPrev={handleTourPrev}
        onClose={stopTour}
      />

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        lang={lang}
      />

      <ChangelogModal
        isOpen={changelogOpen}
        onClose={() => setChangelogOpen(false)}
        lang={lang}
        commits={CHANGELOG_COMMITS}
      />
    </div>
  )
}

export default function App() {
  const { settings, updateSettings } = useSettings()
  const { resolvedTheme, toggleTheme } = useTheme(settings.theme)

  return (
    <SettingsProvider settings={settings} updateSettings={updateSettings} resolvedTheme={resolvedTheme} toggleTheme={toggleTheme}>
      <AppContent />
    </SettingsProvider>
  )
}
