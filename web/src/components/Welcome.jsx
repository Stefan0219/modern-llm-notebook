import { useState } from 'react'
import { GITHUB_REPO_URL } from '../config.js'
import { Metric, NotebookButton, SegmentedControl } from './ui.jsx'

const NOTEBOOK_TITLES = {
  en: {
    '01-tokenizer-basics': 'Tokenizer Basics',
    '02-bpe-tokenizer': 'BPE Tokenizer',
    '03-embedding-position': 'Embeddings & Position',
    '04-transformer-block': 'Attention & Transformer Block',
    '05-mini-gpt': 'Build Your First GPT',
    '06-architecture-refinements': 'Architecture Refinements',
    '07-moe': 'Mixture of Experts',
    '08-bert-encoder': 'BERT Encoder',
    '09-training-loss': 'Training & Loss',
    '10-scaling-laws': 'Scaling Laws',
    '11-data-engineering': 'Data Engineering',
    '12-lora': 'LoRA',
    '13-midtraining-cpt': 'Mid-Training & CPT',
    '14-rlhf-alignment': 'RLHF Alignment',
    '15-generation': 'Generation',
    '16-inference-acceleration': 'Inference Acceleration',
    '17-speculative-decoding': 'Speculative Decoding',
    '18-long-context': 'Long Context',
    '19-cot-thinking': 'CoT & Thinking',
    '20-vlm': 'Vision-Language Models',
    '21-evaluation': 'Evaluation',
    '22-distillation': 'Distillation',
    '23-opd': 'On-Policy Distillation',
  },
}

const PART_TOUR_IDS = {
  Foundation: 'foundation',
  'Training Systems': 'training',
  Inference: 'inference',
  Frontiers: 'frontiers',
  'Evaluation & Deployment': 'production',
}

function Welcome({ catalog, onSelect, onStartTour }) {
  const [lang, setLang] = useState('zh')

  // Group by part
  const groups = {}
  for (const nb of catalog) {
    if (!groups[nb.part]) groups[nb.part] = []
    groups[nb.part].push(nb)
  }

  const copy = {
    en: {
      heroKicker: 'Build the core pieces yourself',
      seriesLabel: 'Notebook Series',
      subtitle: 'Twenty-three runnable notebooks for implementing Tokenizer, Embedding, Attention, Mini-GPT, training loops, LoRA, RLHF, decoding, KV Cache, evaluation, and distillation.',
      badges: ['Hand-calculate first', 'Implement in Python', 'Run every cell', 'Compare real outputs'],
      stats: ['Runnable notebooks', 'Implementation chapters', 'Core modules'],
      sectionKicker: 'Learning Path',
      sectionTitle: 'Each chapter builds one real component.',
      sectionText: 'The notebooks start from small numbers, then move to code. You see what the model receives, what it computes, and how the output changes when you edit the implementation.',
      notes: 'notes',
      parts: {
        "Foundation": {
          title: 'Tokenizer to Mini-GPT.',
          desc: 'Implement character and BPE tokenizers, token/position embeddings, Self-Attention, and a small decoder-only GPT.',
          eyebrow: 'Chapter 01',
          focus: 'Foundation',
        },
        "Training Systems": {
          title: 'Training, data, and adaptation.',
          desc: 'Build the loss calculation, training loop, data pipeline, MoE routing, LoRA update, CPT example, and RLHF-style preference objective.',
          eyebrow: 'Chapter 02',
          focus: 'Training',
        },
        "Inference": {
          title: 'Generation and inference speed.',
          desc: 'Compare greedy, sampling, top-k, and nucleus decoding, then inspect KV Cache, batching, quantization, and speculative decoding.',
          eyebrow: 'Chapter 03',
          focus: 'Inference',
        },
        "Frontiers": {
          title: 'Long context, CoT, and VLM.',
          desc: 'Run small experiments for RoPE scaling, chain-of-thought behavior, and a vision-language model pipeline.',
          eyebrow: 'Chapter 04',
          focus: 'Frontiers',
        },
        "Evaluation & Deployment": {
          title: 'Evaluation, distillation, OPD.',
          desc: 'Create evaluation cases, compare model behavior, compress a larger model into a smaller one, and study on-policy distillation.',
          eyebrow: 'Chapter 05',
          focus: 'Production',
        },
      },
      bridges: [
        { title: 'After Mini-GPT, train it.', desc: 'The next notebooks calculate Cross-Entropy by hand, build batches, and run small training experiments.' },
        { title: 'After training, generate text.', desc: 'The inference chapter shows how decoding rules and KV Cache change speed and output.' },
        { title: 'After basic inference, extend context and inputs.', desc: 'The frontier chapter adds RoPE scaling, CoT experiments, and a VLM walkthrough.' },
        { title: 'After capability, measure behavior.', desc: 'The final chapter builds evaluation examples, distillation demos, and OPD intuition.' },
      ],
    },
    zh: {
      heroKicker: '自己实现大模型的核心部件。',
      seriesLabel: 'Notebook 系列',
      subtitle: '23 篇可运行 Notebook，逐步实现 Tokenizer、Embedding、Attention、Mini-GPT、训练循环、LoRA、RLHF、解码、KV Cache、评测和蒸馏。',
      badges: ['先手算', '再实现', '跑输出', '改实验'],
      stats: ['可运行 Notebook', '章实现路径', '核心模块'],
      sectionKicker: '学习路径',
      sectionTitle: '每一章都实现一个真实部件。',
      sectionText: 'Notebook 会先用小数字讲清楚，再写成 Python 代码。你能看到模型吃进去什么、算出了什么，以及改一行代码后输出怎么变。',
      notes: '篇笔记',
      parts: {
        "Foundation": {
          title: '从 Tokenizer 到 Mini-GPT。',
          desc: '实现字符级和 BPE Tokenizer、Token/Position Embedding、Self-Attention，以及一个小型 decoder-only GPT。',
          eyebrow: '第 01 章',
          focus: '基础',
        },
        "Training Systems": {
          title: '训练、数据和适配。',
          desc: '实现 loss 计算、训练循环、数据处理、MoE 路由、LoRA 更新、CPT 示例和 RLHF 偏好目标。',
          eyebrow: '第 02 章',
          focus: '训练',
        },
        "Inference": {
          title: '生成和推理加速。',
          desc: '对比 greedy、sampling、top-k、nucleus decoding，再观察 KV Cache、batching、量化和投机解码。',
          eyebrow: '第 03 章',
          focus: '推理',
        },
        "Frontiers": {
          title: '长上下文、CoT 和 VLM。',
          desc: '用小实验理解 RoPE scaling、思维链行为，以及视觉语言模型的数据流。',
          eyebrow: '第 04 章',
          focus: '前沿',
        },
        "Evaluation & Deployment": {
          title: '评测、蒸馏和 OPD。',
          desc: '构造评测样例、比较模型行为、把大模型能力压到小模型里，并理解 on-policy distillation。',
          eyebrow: '第 05 章',
          focus: '生产',
        },
      },
      bridges: [
        { title: 'Mini-GPT 搭完后，开始训练。', desc: '下一组 Notebook 会手算 Cross-Entropy，构造 batch，并跑小型训练实验。' },
        { title: '训练理解后，进入生成。', desc: '推理部分会比较不同解码策略，并展示 KV Cache 如何影响速度和输出。' },
        { title: '基础推理后，扩展上下文和输入。', desc: '前沿部分会加入 RoPE scaling、CoT 实验和 VLM 流程。' },
        { title: '能力跑通后，开始评测。', desc: '最后会做评测样例、蒸馏 demo，以及 OPD 的直觉实验。' },
      ],
    },
  }

  const t = copy[lang]
  const titleFor = (nb) => lang === 'en' ? NOTEBOOK_TITLES.en[nb.id] || nb.title : nb.title

  return (
    <div className="viewer">
      <div className="welcome">
        {/* ─── Hero ──────────────────────────────────────── */}
        <section className="hero">
          <div className="hero-sheen" />
          <div className="hero-actions">
            <button className="hero-guide-button" onClick={onStartTour}>
              新手引导
            </button>
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
          <h1 className="hero-title">
            Modern LLM Notebook
          </h1>
          <p className="hero-maker">
            由 <a href="https://walkinglabs.github.io/homepage/" target="_blank" rel="noopener noreferrer">Walking Lab 开源实验室</a> 制作
          </p>
          <p className="hero-subtitle">
            {t.subtitle}
          </p>
          <div className="hero-badges">
            {t.badges.map((badge, index) => (
              <span key={badge} className="hero-badge-group">
                {index > 0 && <span className="hero-arrow">/</span>}
                <span className="hero-badge">{badge}</span>
              </span>
            ))}
          </div>
        </section>

        {/* ─── Stats ─────────────────────────────────────── */}
        <section className="stats">
          <Metric value="23" label={t.stats[0]} />
          <div className="stat-divider" />
          <Metric value="5" label={t.stats[1]} />
          <div className="stat-divider" />
          <Metric value="20+" label={t.stats[2]} />
        </section>

        {/* ─── Parts ─────────────────────────────────────── */}
        <section className="section-intro">
          <p className="section-kicker">{t.sectionKicker}</p>
          <h2>{t.sectionTitle}</h2>
          <p>
            {t.sectionText}
          </p>
        </section>
        <section className="parts">
          {Object.entries(groups).map(([partName, notebooks], idx) => (
            <div key={partName}>
              <section className="part-section" data-tour-part={PART_TOUR_IDS[partName] || partName}>
                <div className="part-section-copy">
                  <div className="part-eyebrow">
                    <span>{t.parts[partName]?.eyebrow || 'Layer'}</span>
                    <span>{t.parts[partName]?.focus || 'Systems'}</span>
                  </div>
                  <h2 className="part-name">{t.parts[partName]?.title || partName}</h2>
                  <p className="part-desc">{t.parts[partName]?.desc || ''}</p>
                </div>
                <div className="part-notebooks">
                  {notebooks.map((nb) => (
                    <NotebookButton
                      key={nb.id}
                      number={nb.id.split('-')[0]}
                      title={titleFor(nb)}
                      onClick={() => onSelect(nb.id)}
                    />
                  ))}
                </div>
                <div className="part-section-count">{notebooks.length} {t.notes}</div>
              </section>
              {t.bridges && idx < t.bridges.length && (
                <div className="part-bridge">
                  <h3 className="part-bridge-title">{t.bridges[idx].title}</h3>
                  <p className="part-bridge-desc">{t.bridges[idx].desc}</p>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* ─── Footer ────────────────────────────────────── */}
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
