import { useState } from 'react'
import { GITHUB_REPO_URL } from '../config.js'
import { Metric, NotebookButton, SegmentedControl } from './ui.jsx'

const NOTEBOOK_TITLES = {
  en: {
    '01-tokenizer-basics': 'Tokenizer Basics',
    '02-bpe-tokenizer': 'BPE Tokenizer',
    '03-embedding-position': 'Embeddings & Position',
    '04-mini-gpt': 'Mini-GPT',
    '05-architecture-refinements': 'Architecture Refinements',
    '06-moe': 'Mixture of Experts',
    '07-bert-encoder': 'BERT Encoder',
    '08-training-loss': 'Training & Loss',
    '09-scaling-laws': 'Scaling Laws',
    '10-data-engineering': 'Data Engineering',
    '11-lora': 'LoRA',
    '12-midtraining-cpt': 'Mid-Training & CPT',
    '13-rlhf-alignment': 'RLHF Alignment',
    '13-generation': 'Generation',
    '14-inference-acceleration': 'Inference Acceleration',
    '15-speculative-decoding': 'Speculative Decoding',
    '16-long-context': 'Long Context',
    '17-cot-thinking': 'CoT & Thinking',
    '18-vlm': 'Vision-Language Models',
    '19-evaluation': 'Evaluation',
    '20-distillation': 'Distillation',
    '21-opd': 'On-Policy Distillation',
  },
}

function Welcome({ catalog, onSelect }) {
  const [lang, setLang] = useState('zh')

  const groups = {}
  for (const nb of catalog) {
    if (!groups[nb.part]) groups[nb.part] = []
    groups[nb.part].push(nb)
  }

  const copy = {
    en: {
      heroKicker: 'Executable field notes for modern language models',
      seriesLabel: 'Modern Notebook Series',
      subtitle:
        'A rigorous path through the systems ideas behind contemporary LLMs: representation, training, inference, evaluation, and deployment.',
      badges: ['Mechanistic intuition', 'Minimal code', 'Paper-grounded', 'Observable behavior'],
      stats: ['Executable notebooks', 'System chapters', 'Research anchors'],
      sectionKicker: 'Curriculum',
      sectionTitle: 'Build the stack in the order the model experiences it.',
      sectionText:
        'Each chapter isolates one system layer, then reconnects it to the full model. Notebooks are designed to be read, run, modified, and verified.',
      notes: 'notes',
      parts: {
        'Foundation': {
          title: 'Representation Learning',
          desc: 'From raw text through tokens, embeddings, and positional encoding to self-attention — assemble the first complete decoder-only transformer that turns characters into coherent next-token predictions.',
          number: '01',
          focus: 'Representation',
        },
        'Training Systems': {
          title: 'Training Systems',
          desc: 'Architecture improvements, mixture-of-experts routing, BERT-style encoding, loss landscapes, scaling laws, data engineering, LoRA fine-tuning, mid-training recipes, and RLHF alignment — the full engineering stack behind modern pretraining and adaptation.',
          number: '02',
          focus: 'Optimization & Alignment',
        },
        'Inference': {
          title: 'Inference Systems',
          desc: 'When a model leaves the training loop and becomes an interactive system: decoding strategies, KV-cache design, serving constraints, quantization, and speculative decoding for low-latency generation.',
          number: '03',
          focus: 'Generation & Serving',
        },
        'Frontiers': {
          title: 'Research Frontiers',
          desc: 'Long-context extrapolation, chain-of-thought reasoning traces, and vision-language multimodal interfaces — how the boundaries of language model capability are being extended at the research edge.',
          number: '04',
          focus: 'Research Edge',
        },
        'Evaluation & Deployment': {
          title: 'Evaluation & Production',
          desc: 'How capability is rigorously measured, how large models are compressed through distillation, and how behavior is monitored and shipped to production with on-policy alignment.',
          number: '05',
          focus: 'Production Judgment',
        },
      },
    },
    zh: {
      heroKicker: '面向现代语言模型的可执行研究笔记',
      seriesLabel: 'Modern Notebook 系列',
      subtitle:
        '从表示、训练、推理、评测到部署，沿着模型系统真正运转的顺序，拆解当代 LLM 的核心机制。',
      badges: ['机制直觉', '最小实现', '论文锚点', '行为观察'],
      stats: ['可执行笔记', '系统章节', '研究锚点'],
      sectionKicker: '课程结构',
      sectionTitle: '按模型经历信息的顺序，重建整套技术栈。',
      sectionText:
        '每一章先隔离一个系统层，再把它接回完整模型。Notebook 既可以阅读，也可以运行、修改和验证。',
      notes: '篇笔记',
      parts: {
        'Foundation': {
          title: '表示学习',
          desc: '从文本切片开始，经过 token 化、embedding 向量、位置编码，到 self-attention 机制——组装出第一个完整的 decoder-only 模型，把字符序列变成连贯的下一个 token 预测。',
          number: '01',
          focus: '基础表示',
        },
        'Training Systems': {
          title: '训练系统',
          desc: '架构改进、MoE 混合专家路由、BERT 编码器设计、loss 函数与训练技巧、scaling laws 缩放规律、数据工程实践、LoRA 高效微调、mid-training 持续训练、RLHF 对齐——覆盖从预训练到适配的完整工程链路。',
          number: '02',
          focus: '优化与对齐',
        },
        'Inference': {
          title: '推理系统',
          desc: '当模型离开训练循环、成为交互式系统之后：解码策略选择、KV-cache 缓存设计、推理加速技术、模型量化，以及投机解码——在不过度牺牲质量的前提下压低延迟。',
          number: '03',
          focus: '生成与服务',
        },
        'Frontiers': {
          title: '前沿方向',
          desc: '长上下文外推方法、chain-of-thought 思维链推理、视觉-语言多模态接口——语言模型的能力边界如何在研究前沿被不断扩展。',
          number: '04',
          focus: '研究前沿',
        },
        'Evaluation & Deployment': {
          title: '评测与部署',
          desc: '如何严谨地衡量模型能力，如何通过知识蒸馏压缩大模型，如何在生产环境中监控模型行为，以及 on-policy distillation 如何把对齐带入部署流程。',
          number: '05',
          focus: '生产判断',
        },
      },
    },
  }

  const t = copy[lang]
  const titleFor = (nb) =>
    lang === 'en' ? NOTEBOOK_TITLES.en[nb.id] || nb.title : nb.title

  return (
    <div className="viewer">
      <div className="welcome">
        {/* Hero */}
        <section className="hero">
          <div className="hero-sheen" />
          <div className="language-switch">
            <SegmentedControl
              value={lang}
              ariaLabel="Language"
              onChange={setLang}
              options={[
                { value: 'en', label: 'EN' },
                { value: 'zh', label: '中文' },
              ]}
            />
          </div>
          <div className="hero-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <p className="hero-kicker">{t.heroKicker}</p>
          <p className="hero-series">{t.seriesLabel}</p>
          <h1 className="hero-title">Modern LLM Notebook</h1>
          <p className="hero-subtitle">{t.subtitle}</p>
          <div className="hero-badges">
            {t.badges.map((badge, index) => (
              <span key={badge} className="hero-badge-group">
                {index > 0 && <span className="hero-arrow">/</span>}
                <span className="hero-badge">{badge}</span>
              </span>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="stats">
          <Metric value="22" label={t.stats[0]} />
          <div className="stat-divider" />
          <Metric value="5" label={t.stats[1]} />
          <div className="stat-divider" />
          <Metric value="20+" label={t.stats[2]} />
        </section>

        {/* Curriculum */}
        <section className="section-intro">
          <p className="section-kicker">{t.sectionKicker}</p>
          <h2>{t.sectionTitle}</h2>
          <p>{t.sectionText}</p>
        </section>

        <section className="chapters">
          {Object.entries(groups).map(([partName, notebooks]) => {
            const p = t.parts[partName] || {}
            return (
              <section key={partName} className="chapter-card">
                <div className="chapter-header">
                  <div className="chapter-header-top">
                    <span className="chapter-number">{p.number || '--'}</span>
                    <span className="chapter-focus">{p.focus || partName}</span>
                  </div>
                  <h3 className="chapter-title">{p.title || partName}</h3>
                  <p className="chapter-desc">{p.desc || ''}</p>
                  <div className="chapter-meta">
                    <span>{notebooks.length} {t.notes}</span>
                  </div>
                </div>
                <div className="chapter-notebooks">
                  {notebooks.map((nb) => (
                    <NotebookButton
                      key={nb.id}
                      number={nb.id.split('-')[0]}
                      title={titleFor(nb)}
                      onClick={() => onSelect(nb.id)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </section>

        {/* Footer */}
        <footer className="welcome-footer">
          <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
          <span className="welcome-footer-dot">·</span>
          <span>CC BY-NC-SA 4.0</span>
        </footer>
      </div>
    </div>
  )
}

export default Welcome
