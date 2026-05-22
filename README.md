# Modern LLM Notebook

<p align="center">
  <strong>A hands-on notebook course for building modern LLM components from scratch</strong>
</p>

<p align="center">
  <a href="README-CN.md"><strong>中文文档</strong></a>
</p>

<p align="center">
  <a href="https://github.com/walkinglabs/modern-llm-notebook/stargazers">
    <img alt="GitHub stars" src="https://img.shields.io/github/stars/walkinglabs/modern-llm-notebook?style=social">
  </a>
  <a href="https://github.com/walkinglabs/modern-llm-notebook/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-blue">
  </a>
  <img alt="Python" src="https://img.shields.io/badge/Python-3.9%2B-3776AB">
  <img alt="PyTorch" src="https://img.shields.io/badge/PyTorch-2.0%2B-EE4C2C">
  <img alt="Notebooks" src="https://img.shields.io/badge/Notebook-23-orange">
</p>

<p align="center">
  <a href="#-why-this-project-exists">Why</a> ·
  <a href="#-what-you-will-learn">What You Will Learn</a> ·
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-learning-map">Learning Map</a> ·
  <a href="#-notebook-index">Notebook Index</a> ·
  <a href="#-contributing">Contributing</a>
</p>

---

Have you ever felt this while learning LLMs?

> Everyone talks about Transformer, BPE, RoPE, MoE, RLHF, and Speculative Decoding,  
> but many resources either jump straight into equations or hide everything behind libraries.

**Modern LLM Notebook** is built for the missing middle.

This is a Jupyter Notebook course that takes modern large language models apart piece by piece.
For each core idea, you first build intuition, then verify it with small hand calculations, then
implement it with PyTorch / NumPy, and finally run experiments to see what actually happens.

This project is for you if you:

- Know basic Python and want to understand what happens inside an LLM
- Have read Transformer explanations but still feel the concepts are floating
- Want a path from Tokenizer to RLHF, long context, VLMs, and distillation
- Prefer implementing the core algorithm over calling `from transformers import ...`

## ✨ Why This Project Exists

Many LLM tutorials have two common problems.

The first problem is **too much abstraction**. They start with formulas and paper names before
explaining what problem a concept is trying to solve.

The second problem is **too much encapsulation**. Libraries are useful, but if everything is one
function call, it is hard to see how text becomes tokens, how tokens become vectors, why
Self-Attention can read context, or why KV Cache makes generation faster.

So this course follows a simple teaching loop:

```text
Intuition -> Hand Calculation -> Code -> Experiment
```

For example, when introducing BPE Tokenizer, we do not just say "merge frequent pairs." We start
with a tiny corpus and count the pairs by hand:

```text
low, lower, newest, widest

First merge:  ('l', 'o') -> 'lo'
Second merge: ('lo', 'w') -> 'low'

Now you can see that tokens are not magic. They are compression patterns learned from text.
```

## 🧠 What You Will Learn

The course covers a practical modern LLM learning path:

| Module | Question you will answer | What you will implement |
|:---|:---|:---|
| Tokenizer | Why can't models read raw text directly? | Character, word, and BPE tokenizers |
| Embedding | How does a token ID become a vector? | Token Embedding, Position Encoding |
| Transformer | What does Attention actually attend to? | Multi-Head Attention, Transformer Block |
| GPT / BERT | How are decoder-only and encoder-only models different? | Mini-GPT, MiniBERT, MLM |
| Training | How do loss, gradients, and data quality shape a model? | Training loop, Scaling Laws, data filtering |
| Efficient architectures | Why are LLaMA and MoE designed this way? | RMSNorm, SwiGLU, RoPE, MoE Router |
| Alignment | What do RLHF and DPO optimize? | Reward Model, PPO Clip, DPO Loss |
| Inference | Why is generation slow, and how can it be faster? | KV Cache, Top-p, Beam Search, Speculative Decoding |
| Frontiers | How do long context, reasoning, and VLMs fit in? | RoPE extrapolation, CoT sampling, Cross-Attention |
| Production | How do we evaluate, compress, and distill models? | LLM-as-Judge, distillation, On-Policy Distillation |

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/walkinglabs/modern-llm-notebook.git
cd modern-llm-notebook
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Open the first notebook

```bash
jupyter notebook notebooks/part1-foundation/01-tokenizer-basics.ipynb
```

Recommended environment:

- Python 3.9+
- PyTorch 2.0+
- NumPy / Matplotlib / Jupyter
- 16GB RAM

Most notebooks run on CPU. Heavier training experiments are better with a GPU.

## 🌐 Web Viewer

If you prefer reading the notebooks in a course-like web interface, start the built-in
React / Vite viewer:

```bash
npm install
npm run dev
```

Build and preview the static site:

```bash
npm run build
npm run preview
```

Convert notebooks only:

```bash
npm run convert
```

## 🗺 Learning Map

```text
Modern LLM Notebook
│
├── Part 1 · Foundation
│   ├── Tokenizer
│   ├── BPE
│   ├── Embedding / Position Encoding
│   ├── Attention / Transformer Block
│   └── Mini-GPT
│
├── Part 2 · Training
│   ├── LLaMA architecture refinements
│   ├── MoE
│   ├── BERT / MLM
│   ├── Training Loop / Loss
│   ├── Scaling Laws
│   ├── Data Engineering
│   ├── LoRA
│   ├── Mid-Training / CPT
│   └── RLHF / DPO
│
├── Part 3 · Inference
│   ├── Generation
│   ├── KV Cache / FlashAttention / vLLM
│   └── Speculative Decoding
│
├── Part 4 · Frontiers
│   ├── Long Context
│   ├── CoT / Thinking
│   └── Vision-Language Models
│
└── Part 5 · Production
    ├── Evaluation
    ├── Distillation
    └── On-Policy Distillation
```

Each notebook is designed to be self-contained. You can follow the full path or jump directly to
the topic you care about.

## 📚 Notebook Index

### Part 1: Foundation

Start with a single sentence and follow the full GPT data flow: text -> tokens -> vectors ->
attention -> logits.

| # | Notebook | Core question | Implementation |
|:---:|:---|:---|:---|
| 01 | [Tokenizer Basics](notebooks/part1-foundation/01-tokenizer-basics.ipynb) | Why do we need a tokenizer? | `CharTokenizer`, `WordTokenizer` |
| 02 | [BPE Tokenizer](notebooks/part1-foundation/02-bpe-tokenizer.ipynb) | How does BPE learn a vocabulary? | `BPETokenizer` |
| 03 | [Embedding & Position](notebooks/part1-foundation/03-embedding-position.ipynb) | How does a token ID become a vector? | `TokenEmbedding`, Position Encoding |
| 04 | [Attention & Transformer Block](notebooks/part1-foundation/04-transformer-block.ipynb) | How does Self-Attention aggregate context? | `MultiHeadAttention`, `TransformerBlock` |
| 05 | [Mini-GPT](notebooks/part1-foundation/05-mini-gpt.ipynb) | How is a GPT-style model assembled? | `MiniGPT`, `lm_head` |

### Part 2: Training

Move from architecture refinements to data, training, fine-tuning, and preference alignment.

| # | Notebook | Core question | Implementation |
|:---:|:---|:---|:---|
| 06 | [Architecture Refinements](notebooks/part2-training/06-architecture-refinements.ipynb) | What did LLaMA change architecturally? | `RMSNorm`, `SwiGLU`, `RoPE` |
| 07 | [Mixture of Experts](notebooks/part2-training/07-moe.ipynb) | How does an MoE router choose experts? | `MoELayer`, Router Gate |
| 08 | [BERT Encoder](notebooks/part2-training/08-bert-encoder.ipynb) | Why can BERT read bidirectionally? | `MiniBERT`, MLM Head |
| 09 | [Training & Loss](notebooks/part2-training/09-training-loss.ipynb) | How does a model learn from loss? | Training loop, gradient accumulation |
| 10 | [Scaling Laws](notebooks/part2-training/10-scaling-laws.ipynb) | How do parameters, data, and compute trade off? | FLOPs estimates, Chinchilla intuition |
| 11 | [Data Engineering](notebooks/part2-training/11-data-engineering.ipynb) | Why is good data more important than just more data? | Cleaning, filtering, MinHash deduplication |
| 12 | [LoRA](notebooks/part2-training/12-lora.ipynb) | Why does low-rank fine-tuning save memory? | `LoraLinear`, merge for inference |
| 13 | [Mid-Training & CPT](notebooks/part2-training/13-midtraining-cpt.ipynb) | How does continued pretraining adapt a model? | Data mixing, loss observation |
| 14 | [RLHF Alignment](notebooks/part2-training/14-rlhf-alignment.ipynb) | How do preferences become an objective? | Reward Model, PPO, DPO |

### Part 3: Inference

Go from "the model can generate" to "the model generates faster and more controllably."

| # | Notebook | Core question | Implementation |
|:---:|:---|:---|:---|
| 15 | [Generation](notebooks/part3-inference/15-generation.ipynb) | How are Greedy, Top-p, and Beam Search different? | `generate_greedy`, `top_p_filter`, `beam_search` |
| 16 | [Inference Acceleration](notebooks/part3-inference/16-inference-acceleration.ipynb) | Why does KV Cache speed up generation? | `AttentionWithKVCache` |
| 17 | [Speculative Decoding](notebooks/part3-inference/17-speculative-decoding.ipynb) | How can a small model speed up a large model? | `speculative_accept` |

### Part 4: Frontiers

Break modern model capabilities into small pieces you can reason about and experiment with.

| # | Notebook | Core question | Implementation |
|:---:|:---|:---|:---|
| 18 | [Long Context](notebooks/part4-frontiers/18-long-context.ipynb) | How can RoPE extend to long context? | `ExtrapolatableRoPE` |
| 19 | [CoT & Thinking](notebooks/part4-frontiers/19-cot-thinking.ipynb) | Why can reasoning traces improve answers? | Self-Consistency, reward function |
| 20 | [Vision-Language Models](notebooks/part4-frontiers/20-vlm.ipynb) | How does visual information enter an LLM? | `PatchEmbedding`, Cross-Attention |

### Part 5: Production

Understand the evaluation, compression, and distillation work needed before models become products.

| # | Notebook | Core question | Implementation |
|:---:|:---|:---|:---|
| 21 | [Evaluation](notebooks/part5-production/21-evaluation.ipynb) | How do we tell whether a model is actually better? | Radar charts, win-rate matrices, RAGAS |
| 22 | [Distillation](notebooks/part5-production/22-distillation.ipynb) | How does a small model learn from a large model? | Soft labels, logit distillation |
| 23 | [On-Policy Distillation](notebooks/part5-production/23-opd.ipynb) | How can distillation reduce exposure bias? | OPSD, KL estimator taxonomy |

## 🧪 Teaching Style

**Define first, then expand.** When terms like Token, Embedding, or Self-Attention appear for the
first time, the notebook gives a plain definition, a concrete example, and only then the formula.

**Hand calculations first.** Core algorithms are verified with small numbers before the code.

**Readable teaching code.** The code favors direct variable names, short cells, Chinese comments in
the notebooks, and `print()` output that explains the key observation.

**Reproducible experiments.** Random experiments use `np.random.seed(42)` or `torch.manual_seed(42)`
so results stay stable across runs.

**No black-box shortcuts.** Core implementations use PyTorch, NumPy, Matplotlib, and the standard
library. The course does not replace core learning steps with `transformers`.

## 📄 Papers and Ideas Covered

The course turns ideas from these papers and systems into runnable mini-experiments:

| Paper / idea | Topic |
|:---|:---|
| Attention Is All You Need | Multi-Head Attention, Position Encoding |
| BERT | Encoder-only models, Masked Language Modeling |
| LLaMA | RMSNorm, SwiGLU, RoPE, Pre-Norm |
| Scaling Laws / Chinchilla | Parameter, data, and compute trade-offs |
| LoRA | Low-Rank Adaptation |
| RLHF / PPO / DPO | Preference alignment |
| FlashAttention / vLLM | Inference acceleration and memory management |
| Speculative Decoding | Draft-then-verify generation |
| RoPE / YaRN | Long-context extrapolation |
| Chain-of-Thought | Reasoning traces and Self-Consistency |
| Flamingo / LLaVA | Vision-Language Models |
| Knowledge Distillation / OPD | Model compression and distillation |

## 🧩 Repository Structure

```text
modern-llm-notebook/
├── notebooks/
│   ├── part1-foundation/
│   ├── part2-training/
│   ├── part3-inference/
│   ├── part4-frontiers/
│   └── part5-production/
├── web/                 # React / Vite web viewer
├── docs/                # Static site build output
├── scripts/             # Notebook conversion scripts
├── requirements.txt
├── package.json
├── README.md
└── README-CN.md
```

## 🤝 Contributing

Contributions are welcome. Good first contributions include:

- Fixing notebook bugs, stale APIs, or reproducibility issues
- Improving explanations and hand-calculation sections
- Adding visualizations, exercises, or experimental observations
- Adding new topics such as Mamba, Jamba, Agents, RAG, or inference serving
- Improving the web reading experience

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before getting started.

## ⭐ Star History

<a href="https://www.star-history.com/#walkinglabs/modern-llm-notebook&Date">
  <picture>
    <source
      media="(prefers-color-scheme: dark)"
      srcset="https://api.star-history.com/svg?repos=walkinglabs/modern-llm-notebook&type=Date&theme=dark"
    >
    <source
      media="(prefers-color-scheme: light)"
      srcset="https://api.star-history.com/svg?repos=walkinglabs/modern-llm-notebook&type=Date"
    >
    <img
      alt="Star history chart"
      src="https://api.star-history.com/svg?repos=walkinglabs/modern-llm-notebook&type=Date"
    >
  </picture>
</a>

If this project helps you finally understand an LLM concept from the inside, consider giving it a
star. It helps more learners discover the course.

## 📜 License

This project is released under the
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](LICENSE).

---

<p align="center">
  <sub>
    Built with patience for people who want to understand LLMs from the inside.
    <br>
    Maintained by <a href="https://github.com/walkinglabs">walkinglabs</a>.
  </sub>
</p>
