# Modern LLM Notebook

<p align="center">
  <strong>从零手写现代大语言模型核心组件的中文 Notebook 教程</strong>
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
  <a href="#-为什么做这个项目">为什么做这个项目</a> ·
  <a href="#-你会学到什么">你会学到什么</a> ·
  <a href="#-快速开始">快速开始</a> ·
  <a href="#-课程路线">课程路线</a> ·
  <a href="#-notebook-目录">Notebook 目录</a> ·
  <a href="#-贡献">贡献</a>
</p>

---

你是不是也有过这种感觉：

> Transformer、BPE、RoPE、MoE、RLHF、Speculative Decoding 到处都在讲，  
> 但很多资料要么只给公式，要么直接调库，真正“从数字算到代码”的教程很少。

**Modern LLM Notebook** 想解决的就是这个困惑。

这是一套面向中文读者的 Jupyter Notebook 教程。它不教你“如何调用 GPT API”，而是带你把
现代大语言模型的关键部件一层层拆开：先建立直觉，再手算一个小例子，然后用 PyTorch / NumPy
写出可运行代码，最后通过实验观察它为什么有效。

适合你，如果你：

- 有 Python 基础，想真正理解 LLM 内部原理
- 看过一些 Transformer 文章，但总觉得概念没有落地
- 想从 Tokenizer 一路学到 RLHF、长上下文、VLM 和蒸馏
- 不满足于 `from transformers import ...`，想亲手实现核心算法

## ✨ 为什么做这个项目

很多 LLM 教程有两个常见问题。

第一个问题是**太抽象**：一上来就是公式和论文名，读者还没知道这个概念要解决什么问题。

第二个问题是**太封装**：直接调用成熟库当然方便，但你很难看清 Token 是怎么变成向量的，
Self-Attention 为什么能“看见上下文”，KV Cache 又为什么能让生成变快。

所以这个项目坚持一个教学循环：

```text
直觉理解 -> 手算验证 -> 代码实现 -> 实验观察
```

例如讲 BPE Tokenizer 时，不会只告诉你“它会合并高频字符对”，而是会先拿一个小语料手动数频率：

```text
low, lower, newest, widest

第一次合并：('l', 'o') -> 'lo'
第二次合并：('lo', 'w') -> 'low'

你会亲眼看到：词不是凭空变成 Token 的，而是被统计规律一点点压缩出来的。
```

## 🧠 你会学到什么

这个项目覆盖一条相对完整的现代 LLM 学习路径：

| 模块 | 你会真正弄懂的问题 | 会手写的东西 |
|:---|:---|:---|
| Tokenizer | 文本为什么不能直接喂给模型？ | 字符级、词级、BPE Tokenizer |
| Embedding | Token ID 怎么变成向量？ | Token Embedding、Position Encoding |
| Transformer | Attention 到底在“注意”什么？ | Multi-Head Attention、Transformer Block |
| GPT / BERT | Decoder-only 和 Encoder-only 差在哪？ | Mini-GPT、MiniBERT、MLM |
| 训练 | Loss、梯度、数据质量如何影响模型？ | 训练循环、Scaling Laws、数据过滤 |
| 高效架构 | LLaMA、MoE 为什么这样设计？ | RMSNorm、SwiGLU、RoPE、MoE Router |
| 对齐 | RLHF / DPO 在优化什么？ | Reward Model、PPO Clip、DPO Loss |
| 推理 | 生成为什么慢？如何加速？ | KV Cache、Top-p、Beam Search、Speculative Decoding |
| 前沿 | 长上下文、CoT、VLM 怎么接进来？ | RoPE 外推、思维链采样、Cross-Attention |
| 生产 | 如何评测、压缩、蒸馏模型？ | LLM-as-Judge、蒸馏、On-Policy Distillation |

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/walkinglabs/modern-llm-notebook.git
cd modern-llm-notebook
```

### 2. 安装 Python 依赖

```bash
pip install -r requirements.txt
```

### 3. 打开第一个 Notebook

```bash
jupyter notebook notebooks/part1-foundation/01-tokenizer-basics.ipynb
```

推荐环境：

- Python 3.9+
- PyTorch 2.0+
- NumPy / Matplotlib / Jupyter
- 16GB RAM

大部分 Notebook 可以在 CPU 上运行；训练和实验较重的章节建议使用 GPU。

## 🌐 网页端阅读器

如果你更喜欢像课程网站一样阅读 Notebook，可以启动内置的 React / Vite 阅读器：

```bash
npm install
npm run dev
```

构建静态网站：

```bash
npm run build
npm run preview
```

只转换 Notebook：

```bash
npm run convert
```

## 🗺 课程路线

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
│   ├── LLaMA 架构优化
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

每个 Notebook 都尽量自包含：你可以按顺序学习，也可以直接跳到你关心的主题。

## 📚 Notebook 目录

### Part 1：Foundation · 基础组件

从一句文本开始，走完整个 GPT 数据流：文本 -> Token -> 向量 -> Attention -> logits。

| # | Notebook | 核心问题 | 手写实现 |
|:---:|:---|:---|:---|
| 01 | [Tokenizer Basics](notebooks/part1-foundation/01-tokenizer-basics.ipynb) | 为什么需要 Tokenizer？ | `CharTokenizer`, `WordTokenizer` |
| 02 | [BPE Tokenizer](notebooks/part1-foundation/02-bpe-tokenizer.ipynb) | BPE 如何从语料里学词表？ | `BPETokenizer` |
| 03 | [Embedding & Position](notebooks/part1-foundation/03-embedding-position.ipynb) | Token ID 如何变成向量？ | `TokenEmbedding`, Position Encoding |
| 04 | [Attention & Transformer Block](notebooks/part1-foundation/04-transformer-block.ipynb) | Self-Attention 如何聚合上下文？ | `MultiHeadAttention`, `TransformerBlock` |
| 05 | [Mini-GPT](notebooks/part1-foundation/05-mini-gpt.ipynb) | GPT 骨架如何组装起来？ | `MiniGPT`, `lm_head` |

### Part 2：Training · 训练管线

从模型结构优化到数据、训练、微调和人类偏好对齐。

| # | Notebook | 核心问题 | 手写实现 |
|:---:|:---|:---|:---|
| 06 | [Architecture Refinements](notebooks/part2-training/06-architecture-refinements.ipynb) | LLaMA 做了哪些结构改进？ | `RMSNorm`, `SwiGLU`, `RoPE` |
| 07 | [Mixture of Experts](notebooks/part2-training/07-moe.ipynb) | MoE Router 如何选择专家？ | `MoELayer`, Router Gate |
| 08 | [BERT Encoder](notebooks/part2-training/08-bert-encoder.ipynb) | BERT 为什么能双向理解文本？ | `MiniBERT`, MLM Head |
| 09 | [Training & Loss](notebooks/part2-training/09-training-loss.ipynb) | 模型如何通过 loss 学会预测？ | 训练循环、梯度累积 |
| 10 | [Scaling Laws](notebooks/part2-training/10-scaling-laws.ipynb) | 参数、数据、算力如何权衡？ | FLOPs 估算、Chinchilla 直觉 |
| 11 | [Data Engineering](notebooks/part2-training/11-data-engineering.ipynb) | 好数据为什么比大数据更重要？ | 清洗、过滤、MinHash 去重 |
| 12 | [LoRA](notebooks/part2-training/12-lora.ipynb) | 低秩微调为什么省显存？ | `LoraLinear`, merge 推理 |
| 13 | [Mid-Training & CPT](notebooks/part2-training/13-midtraining-cpt.ipynb) | 继续预训练如何做领域适配？ | 数据混合、loss 观察 |
| 14 | [RLHF Alignment](notebooks/part2-training/14-rlhf-alignment.ipynb) | 偏好数据如何变成优化目标？ | Reward Model、PPO、DPO |

### Part 3：Inference · 推理优化

从“模型会生成”到“模型生成得更快、更可控”。

| # | Notebook | 核心问题 | 手写实现 |
|:---:|:---|:---|:---|
| 15 | [Generation](notebooks/part3-inference/15-generation.ipynb) | Greedy、Top-p、Beam Search 差在哪？ | `generate_greedy`, `top_p_filter`, `beam_search` |
| 16 | [Inference Acceleration](notebooks/part3-inference/16-inference-acceleration.ipynb) | KV Cache 为什么能加速生成？ | `AttentionWithKVCache` |
| 17 | [Speculative Decoding](notebooks/part3-inference/17-speculative-decoding.ipynb) | 小模型如何帮大模型提速？ | `speculative_accept` |

### Part 4：Frontiers · 前沿方向

把现代模型的热门能力拆成可以理解、可以实验的小模块。

| # | Notebook | 核心问题 | 手写实现 |
|:---:|:---|:---|:---|
| 18 | [Long Context](notebooks/part4-frontiers/18-long-context.ipynb) | RoPE 如何扩展到长上下文？ | `ExtrapolatableRoPE` |
| 19 | [CoT & Thinking](notebooks/part4-frontiers/19-cot-thinking.ipynb) | 思维链为什么能提升推理？ | Self-Consistency、reward function |
| 20 | [Vision-Language Models](notebooks/part4-frontiers/20-vlm.ipynb) | 图像信息如何接入语言模型？ | `PatchEmbedding`, Cross-Attention |

### Part 5：Production · 工程落地

理解模型走向真实产品前，还需要哪些评测、压缩和蒸馏技术。

| # | Notebook | 核心问题 | 手写实现 |
|:---:|:---|:---|:---|
| 21 | [Evaluation](notebooks/part5-production/21-evaluation.ipynb) | 如何判断一个模型真的更好？ | 雷达图、胜率矩阵、RAGAS |
| 22 | [Distillation](notebooks/part5-production/22-distillation.ipynb) | 大模型知识如何迁移给小模型？ | 温度软标签、logit distillation |
| 23 | [On-Policy Distillation](notebooks/part5-production/23-opd.ipynb) | 蒸馏如何减少 exposure bias？ | OPSD、KL 估计器分类 |

## 🧪 教学特色

**先定义，再展开。** 第一次出现 Token、Embedding、Self-Attention 这类词时，会先给中文定义，
再给具体例子，最后才进入公式。

**手算优先。** 核心算法会先用小数字算一遍，让你知道每个中间量代表什么。

**代码直白。** 教学代码不追求复杂工程抽象，优先让变量名、注释和 `print()` 输出解释清楚。

**实验可复现。** 随机实验会设置 `np.random.seed(42)` 或 `torch.manual_seed(42)`，避免你每次运行看到不同结果。

**不依赖黑盒库。** 核心实现只使用 PyTorch、NumPy、Matplotlib 和标准库，不用 `transformers` 替代手写过程。

## 📄 覆盖的经典论文

本教程会把这些论文中的关键想法拆成可运行的小实验：

| 论文 / 技术 | 对应主题 |
|:---|:---|
| Attention Is All You Need | Multi-Head Attention、Position Encoding |
| BERT | Encoder-only、Masked Language Modeling |
| LLaMA | RMSNorm、SwiGLU、RoPE、Pre-Norm |
| Scaling Laws / Chinchilla | 参数、数据、算力的权衡 |
| LoRA | Low-Rank Adaptation |
| RLHF / PPO / DPO | 人类偏好对齐 |
| FlashAttention / vLLM | 推理加速与显存管理 |
| Speculative Decoding | Draft-then-verify 生成加速 |
| RoPE / YaRN | 长上下文外推 |
| Chain-of-Thought | 推理路径与 Self-Consistency |
| Flamingo / LLaVA | Vision-Language Model |
| Knowledge Distillation / OPD | 模型压缩与蒸馏 |

## 🧩 项目结构

```text
modern-llm-notebook/
├── notebooks/
│   ├── part1-foundation/
│   ├── part2-training/
│   ├── part3-inference/
│   ├── part4-frontiers/
│   └── part5-production/
├── web/                 # React / Vite 网页端阅读器
├── docs/                # 静态网站构建产物
├── scripts/             # Notebook 转换等脚本
├── requirements.txt
├── package.json
└── README.md
```

## 🤝 贡献

欢迎贡献。尤其欢迎这几类改进：

- 修复 Notebook 中的错误、过时 API 或运行问题
- 改进解释、补充更清晰的手算过程
- 增加可视化、练习题或实验观察
- 补充新主题，例如 Mamba、Jamba、Agent、RAG、推理服务部署
- 改进网页端阅读体验

开始前建议先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

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

如果这个项目帮你把 LLM 的某个概念真正想明白了，欢迎点一个 Star。
它会帮助更多正在入门现代大模型的中文开发者看到这套教程。

## 📜 License

本项目采用
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](LICENSE)
协议发布。

---

<p align="center">
  <sub>
    Built with patience for people who want to understand LLMs from the inside.
    <br>
    Maintained by <a href="https://github.com/walkinglabs">walkinglabs</a>.
  </sub>
</p>
