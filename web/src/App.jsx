import { useState, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { Menu } from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import NotebookViewer from './components/NotebookViewer.jsx'
import Welcome from './components/Welcome.jsx'
import GuidedTour from './components/GuidedTour.jsx'
import { getCatalog, getNotebook } from './data/notebooks.js'

const DEFAULT_LANG = 'zh'

const LEGACY_NOTEBOOK_IDS = {
  '04-mini-gpt': '05-mini-gpt',
  '05-architecture-refinements': '06-architecture-refinements',
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

function App() {
  const [lang, setLang] = useState(() => getInitialLang())
  const [catalog, setCatalog] = useState(() => getCatalog(lang))
  const [currentId, setCurrentId] = useState(() => getInitialNotebookId())
  const [loading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tourActive, setTourActive] = useState(false)
  const [tourStepIndex, setTourStepIndex] = useState(0)

  useEffect(() => {
    setCatalog(getCatalog(lang))
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN'
    window.localStorage.setItem('language', lang)
    writeLangToUrl(lang)
  }, [lang])

  useEffect(() => {
    const syncFromHash = () => {
      const nextId = getInitialNotebookId()
      setCurrentId(nextId)
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

  const currentMeta = catalog.find(n => n.id === currentId)
  const notebook = currentId ? getNotebook(currentId, lang) : null
  const tourNotebookId = catalog.find(n => n.id === '01-tokenizer-basics')?.id || catalog[0]?.id
  const tourCopy = {
    zh: [
      {
        target: '.hero',
        title: '先看课程目标',
        body: '这套课程不是 API 教程，而是从零重建 LLM 核心系统。你会沿着模型真正运转的顺序，理解文本如何变成 token、参数如何训练、模型如何生成答案。',
      },
      {
        target: '.stats',
        title: '5 个大章，23 篇 Notebook',
        body: '课程分成 5 个大章：基础表示、训练系统、推理系统、前沿方向、评测与部署。每篇都是可执行 Notebook，读完马上能改代码观察结果。',
      },
      {
        target: '[data-tour-part="foundation"]',
        title: '第一大章：Foundation',
        body: '这一章解决"模型怎么读懂文本"。你会从 Tokenizer、Embedding、位置编码一路搭到 Mini-GPT。产出是：能自己手写一个最小 GPT 骨架。',
      },
      {
        target: '[data-tour-part="training"]',
        title: '第二大章：Training Systems',
        body: '这一章解决"模型怎么被训练出来"。内容包括架构改进、MoE、BERT、Loss、Scaling Laws、数据工程、LoRA、RLHF。产出是：能看懂训练系统的关键组件和取舍。',
      },
      {
        target: '[data-tour-part="inference"]',
        title: '第三大章：Inference',
        body: '这一章解决"模型怎么生成答案并跑得更快"。内容包括生成策略、推理加速、投机解码。产出是：能自己实现基础解码，并理解 KV Cache、加速和吞吐约束。',
      },
      {
        target: '[data-tour-part="frontiers"]',
        title: '第四大章：Frontiers',
        body: '这一章看当代 LLM 的前沿能力：长上下文、CoT 思维链、VLM。产出是：知道这些能力的机制来源，以及它们和普通文本模型有什么不同。',
      },
      {
        target: '[data-tour-part="production"]',
        title: '第五大章：Evaluation & Deployment',
        body: '这一章解决"模型怎么可靠交付"。内容包括模型评测、知识蒸馏、On-Policy Distillation。产出是：能设计基础评测流程，并理解压缩和部署判断。',
      },
      {
        target: '.parts',
        title: '学完能做什么',
        body: '走完整套后，你应该能自己写出 Tokenizer、Embedding、Attention、Mini-GPT、训练循环、LoRA、解码策略和基础评测流程。',
        nextLabel: '进入 01',
        action: 'open-notebook',
      },
      {
        target: '.viewer-launches',
        title: '01 怎么学',
        body: '01 是入口：先理解为什么文本不能直接喂给模型，再手算字符级、词级 tokenizer，最后运行代码。顶部按钮可以把当前 Notebook 打开到 ModelScope、百度星河社区或 Colab。',
      },
      {
        target: '.toc',
        title: '按"直觉→手算→代码→观察"读',
        body: '右侧大纲对应每个学习环节。推荐顺序是先看直觉，再看具体数字怎么手算，然后运行代码，最后读输出里的关键观察。',
      },
      {
        target: '.code_cell',
        title: '代码和输出可展开',
        body: '每个核心算法都会落到代码。长代码和长输出默认保留前 28 行，点击对应区域可展开或收起，方便你边读边验证。',
      },
      {
        target: '.viewer-header',
        title: '快开始你的学习吧！',
        body: '学完整套后，你应该能自己手写 Tokenizer、Embedding、Attention、Mini-GPT、训练循环、LoRA、解码策略和基础评测流程。',
      },
    ],
    en: [
      {
        target: '.hero',
        title: 'Start With The Goal',
        body: 'This is not an API tutorial. It rebuilds the core LLM systems from scratch, following the path from text to tokens, training, and generation.',
      },
      {
        target: '.stats',
        title: '5 Parts, 23 Notebooks',
        body: 'The course covers foundations, training systems, inference, frontiers, and evaluation/deployment. Every notebook is runnable and editable.',
      },
      {
        target: '[data-tour-part="foundation"]',
        title: 'Part 1: Foundation',
        body: 'This part answers how models read text: Tokenizer, Embedding, position encoding, Attention, and a small Mini-GPT skeleton.',
      },
      {
        target: '[data-tour-part="training"]',
        title: 'Part 2: Training Systems',
        body: 'This part explains how models are trained: architecture refinements, MoE, BERT, loss, scaling laws, data, LoRA, and RLHF.',
      },
      {
        target: '[data-tour-part="inference"]',
        title: 'Part 3: Inference',
        body: 'This part shows how models generate answers and run faster, from decoding rules to KV Cache and speculative decoding.',
      },
      {
        target: '[data-tour-part="frontiers"]',
        title: 'Part 4: Frontiers',
        body: 'This part studies long context, CoT reasoning traces, and VLM data flow as small, understandable experiments.',
      },
      {
        target: '[data-tour-part="production"]',
        title: 'Part 5: Evaluation & Deployment',
        body: 'This part covers evaluation, distillation, and On-Policy Distillation so model behavior can be measured and delivered.',
      },
      {
        target: '.parts',
        title: 'What You Can Build',
        body: 'After the full path, you should be able to write a tokenizer, embeddings, attention, Mini-GPT, a training loop, LoRA, decoding, and basic evaluation.',
        nextLabel: 'Open 01',
        action: 'open-notebook',
      },
      {
        target: '.viewer-launches',
        title: 'How To Read 01',
        body: '01 starts with why raw text cannot go directly into a model, then hand-calculates tokenizer choices before running code.',
      },
      {
        target: '.toc',
        title: 'Read In The Intended Order',
        body: 'The outline follows intuition, hand calculation, code, and observation. Read the idea first, then inspect the numbers and outputs.',
      },
      {
        target: '.code_cell',
        title: 'Code And Outputs Expand',
        body: 'Core ideas end up in code. Long code and output blocks keep the first 28 lines visible and can be expanded.',
      },
      {
        target: '.viewer-header',
        title: 'You Are Ready',
        body: 'Start small, run cells often, and change one thing at a time so the model internals become concrete.',
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
    <div className="min-h-screen flex bg-slate-50/70 text-slate-800 font-sans select-none antialiased">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white/80 border border-slate-200/50 text-slate-600 hover:text-slate-800 shadow-sm backdrop-blur-md transition-colors"
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
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        {currentId ? (
          <NotebookViewer
            notebook={notebook}
            meta={currentMeta}
            loading={loading}
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
    </div>
  )
}

export default App
