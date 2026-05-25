# Modern LLM Notebook

<p align="center">
  <strong>用 Notebook 从零实现现代 LLM 系统核心组件的教学型参考项目。</strong>
</p>

<p align="center">
  <a href="README.md"><strong>English</strong></a>
  ·
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
  <img alt="Notebooks" src="https://img.shields.io/badge/Notebooks-23-orange">
</p>

<p align="center">
  <a href="#项目概览">项目概览</a> ·
  <a href="#为什么做这个项目">为什么做这个项目</a> ·
  <a href="#包含什么">包含什么</a> ·
  <a href="#快速开始">快速开始</a> ·
  <a href="#课程路线">课程路线</a> ·
  <a href="#质量标准">质量标准</a> ·
  <a href="#贡献">贡献</a>
</p>

---

## 项目概览

Modern LLM Notebook 是一套以 Jupyter Notebook 为主线的现代大语言模型课程。它把 LLM
内部的核心机制拆成可以阅读、可以运行、可以检查的小步骤：Tokenizer、Embedding、Attention、
Transformer Block、训练循环、对齐、推理加速、长上下文、多模态、评测和蒸馏。

仓库现在同时维护中文与英文两套 Notebook。英文版位于 `notebooks-en/`，覆盖完整 23 章；
网页阅读器在首页和 Notebook 侧边栏都支持语言切换（也可以在 URL 里用 `?lang=en`），课程目录、Notebook 内容和运行输出都按语言展示。

这个项目的定位是**教学型参考实现**。它不是模型权重仓库，不是生产推理框架，也不是托管 API
的封装。它的目标是帮助工程师真正看懂 LLM 内部发生了什么，并且能从第一性原理解释关键设计。

每个 Notebook 都遵循同一个学习契约：

```text
直觉理解 -> 手算验证 -> 代码实现 -> 实验观察
```

这个契约很重要。读者不应该只知道“BPE 会合并高频字符对”或“KV Cache 会加速生成”，而应该能
追踪中间数字，写出最小代码，并解释为什么会出现这种行为。

## 为什么做这个项目

LLM 学习资料常见两个极端。

一类资料很严谨，但进入门槛高：公式和论文名先出现，读者还不知道这个概念到底在解决什么问题。
另一类资料很容易跑起来，但封装太重：关键过程藏在一个函数调用后面，读者很难建立真实的系统感。

Modern LLM Notebook 选择中间路线：把现代 LLM 当成一个可以拆解、测试、重建的系统。它不是要
替代论文或生产级框架，而是帮你建立足够扎实的心智模型，让你之后读论文、看源码、用框架时更有判断力。

这个项目适合你，如果你想：

- 从原始文本一路理解到 logits 的完整数据流。
- 不把 GPT 架构当黑盒，亲手搭一个小型 Decoder-only 模型。
- 看懂训练目标、数据质量、Scaling Laws 之间的关系。
- 理解为什么推理系统需要 KV Cache、批处理、显存规划和 Speculative Decoding。
- 把 MoE、长上下文、CoT、VLM、RLHF、DPO、蒸馏等新主题还原成可运行的小实验。

## 包含什么

| 领域 | 主题 | 参考实现 |
|:---|:---|:---|
| 基础组件 | Tokenization、BPE、Embedding、Position Encoding | `CharTokenizer`, `WordTokenizer`, `BPETokenizer`, `TokenEmbedding` |
| Transformer 核心 | Self-Attention、Multi-Head Attention、Transformer Block | `MultiHeadAttention`, `TransformerBlock`, `MiniGPT` |
| 架构优化 | RMSNorm、SwiGLU、RoPE、Pre-Norm、MoE | `RMSNorm`, `SwiGLU`, `RoPE`, `MoELayer` |
| 训练 | Loss、优化、Scaling Laws、数据工程 | 训练循环、梯度累积、MinHash 去重 |
| 适配与对齐 | LoRA、Reward Model、PPO、DPO | `LoraLinear`, Reward Model loss, PPO clip, DPO loss |
| 推理 | Sampling、Beam Search、KV Cache、Speculative Decoding | Top-k、Top-p、Beam Search、`AttentionWithKVCache` |
| 前沿能力 | 长上下文、推理链、Vision-Language Models | RoPE 外推、Self-Consistency、Cross-Attention |
| 生产概念 | 评测、蒸馏、On-Policy Distillation | 胜率矩阵、软标签、KL 估计器 |

## 这个项目不是什么

为了让学习路径保持清晰，这个仓库有意不做几件事：

- 它不是生产级 LLM 框架。
- 它不追求最大吞吐量或分布式训练性能。
- 它不提供预训练模型权重。
- 它不会用 `transformers` 跳过核心实现。
- 它不假设读者已经理解所有术语。

环境里可能会包含 `transformers`、`datasets` 等依赖，用于对照或辅助实验；但核心教学路径会尽量把
算法过程显式写出来。

## 快速开始

### Python Notebook

```bash
git clone https://github.com/walkinglabs/modern-llm-notebook.git
cd modern-llm-notebook
pip install -r requirements.txt
jupyter notebook notebooks/part1-foundation/01-tokenizer-basics.ipynb
```

语言说明：

- 中文版 Notebook：`notebooks/`
- 英文版 Notebook：`notebooks-en/`（23/23 全量覆盖）

推荐环境：

- Python 3.9+
- PyTorch 2.0+
- NumPy、Matplotlib、Jupyter
- 16GB RAM

大部分 Notebook 可以在 CPU 上运行。训练实验较重的章节建议使用 GPU。

### 网页阅读器

仓库里也包含一个 React / Vite 阅读器，可以用更接近课程网站的方式浏览 Notebook。

```bash
npm install
npm run dev
```

构建并预览静态网站：

```bash
npm run build
npm run preview
```

仅转换 Notebook：

```bash
npm run convert
```

### 在受限环境中批量执行 Notebook（英文版）

有些沙箱/CI 环境会禁止打开本地 socket，这会导致标准的 Jupyter kernel 协议（以及 `nbclient`、
`nbconvert --execute`）执行失败。为这种场景仓库提供了一个“无 kernel 执行器”，用纯 Python 顺序执行
code cells，并把输出写回到英文版 notebook 文件：

```bash
python scripts/execute_notebooks_en_no_kernel.py
```

## 课程路线

课程分为 5 个部分，共 23 个自包含 Notebook。

```text
Modern LLM Notebook
│
├── Part 1: Foundation
│   ├── Tokenizer basics
│   ├── BPE tokenizer
│   ├── Embedding and position encoding
│   ├── Attention and Transformer block
│   └── Mini-GPT
│
├── Part 2: Training
│   ├── Architecture refinements
│   ├── Mixture of Experts
│   ├── BERT encoder
│   ├── Training and loss
│   ├── Scaling laws
│   ├── Data engineering
│   ├── LoRA
│   ├── Mid-training and continued pretraining
│   └── RLHF alignment
│
├── Part 3: Inference
│   ├── Generation
│   ├── Inference acceleration
│   └── Speculative decoding
│
├── Part 4: Frontiers
│   ├── Long context
│   ├── CoT and thinking
│   └── Vision-language models
│
└── Part 5: Production
    ├── Evaluation
    ├── Distillation
    └── On-policy distillation
```

每个 Notebook 都尽量自包含。你可以顺序学习，也可以直接跳到感兴趣的主题，不依赖前面 Notebook
的运行时状态。

## Notebook 目录

### Part 1: Foundation

| # | Notebook | 核心问题 | 实现重点 |
|:---:|:---|:---|:---|
| 01 | [Tokenizer Basics](notebooks/part1-foundation/01-tokenizer-basics.ipynb) | 模型为什么需要 Tokenizer？ | 字符级和词级 Tokenizer |
| 02 | [BPE Tokenizer](notebooks/part1-foundation/02-bpe-tokenizer.ipynb) | BPE 如何从语料里学习词表？ | Merge rules、encode、decode |
| 03 | [Embedding & Position](notebooks/part1-foundation/03-embedding-position.ipynb) | Token ID 如何变成向量？ | Token Embedding、Position Encoding |
| 04 | [Attention & Transformer Block](notebooks/part1-foundation/04-transformer-block.ipynb) | Attention 如何搬运上下文信息？ | MHA、残差、归一化 |
| 05 | [Mini-GPT](notebooks/part1-foundation/05-mini-gpt.ipynb) | GPT 风格模型如何组装起来？ | Decoder-only 模型、LM head |

### Part 2: Training

| # | Notebook | 核心问题 | 实现重点 |
|:---:|:---|:---|:---|
| 06 | [Architecture Refinements](notebooks/part2-training/06-architecture-refinements.ipynb) | 从原始 Transformer 到 LLaMA 风格结构改了什么？ | RMSNorm、SwiGLU、RoPE |
| 07 | [Mixture of Experts](notebooks/part2-training/07-moe.ipynb) | 稀疏专家路由如何工作？ | Router gate、top-k experts |
| 08 | [BERT Encoder](notebooks/part2-training/08-bert-encoder.ipynb) | Encoder-only 模型为什么能双向读文本？ | MiniBERT、MLM head |
| 09 | [Training & Loss](notebooks/part2-training/09-training-loss.ipynb) | 语言模型如何从预测错误中学习？ | 训练循环、loss、梯度 |
| 10 | [Scaling Laws](notebooks/part2-training/10-scaling-laws.ipynb) | 模型大小、数据量和算力如何权衡？ | FLOPs 估算、Chinchilla 直觉 |
| 11 | [Data Engineering](notebooks/part2-training/11-data-engineering.ipynb) | 为什么数据质量会主导模型行为？ | 清洗、过滤、MinHash |
| 12 | [LoRA](notebooks/part2-training/12-lora.ipynb) | 低秩适配为什么有效？ | `LoraLinear`、merge 推理 |
| 13 | [Mid-Training & CPT](notebooks/part2-training/13-midtraining-cpt.ipynb) | 继续预训练如何让模型适配领域？ | 数据混合、loss 观察 |
| 14 | [RLHF Alignment](notebooks/part2-training/14-rlhf-alignment.ipynb) | 偏好信号如何变成优化目标？ | Reward Model、PPO、DPO |

### Part 3: Inference

| # | Notebook | 核心问题 | 实现重点 |
|:---:|:---|:---|:---|
| 15 | [Generation](notebooks/part3-inference/15-generation.ipynb) | 解码策略如何改变模型行为？ | Greedy、top-k、top-p、Beam Search |
| 16 | [Inference Acceleration](notebooks/part3-inference/16-inference-acceleration.ipynb) | 生成为什么常常受显存访问限制？ | KV Cache、FlashAttention、PagedAttention |
| 17 | [Speculative Decoding](notebooks/part3-inference/17-speculative-decoding.ipynb) | 小模型如何加速大模型？ | Draft-then-verify 接受率 |

### Part 4: Frontiers

| # | Notebook | 核心问题 | 实现重点 |
|:---:|:---|:---|:---|
| 18 | [Long Context](notebooks/part4-frontiers/18-long-context.ipynb) | 模型如何扩展到训练长度之外？ | RoPE 外推、YaRN 直觉 |
| 19 | [CoT & Thinking](notebooks/part4-frontiers/19-cot-thinking.ipynb) | 推理链为什么能改善答案？ | Self-Consistency、reward 设计 |
| 20 | [Vision-Language Models](notebooks/part4-frontiers/20-vlm.ipynb) | 图像信息如何进入语言模型？ | Patch Embedding、Cross-Attention |

### Part 5: Production

| # | Notebook | 核心问题 | 实现重点 |
|:---:|:---|:---|:---|
| 21 | [Evaluation](notebooks/part5-production/21-evaluation.ipynb) | 如何判断一个模型真的更好？ | 胜率矩阵、RAGAS、Judge 指标 |
| 22 | [Distillation](notebooks/part5-production/22-distillation.ipynb) | 小模型如何学习大模型？ | 软标签、temperature、logit distillation |
| 23 | [On-Policy Distillation](notebooks/part5-production/23-opd.ipynb) | 蒸馏如何减少 exposure bias？ | OPSD、KL 估计器分类 |

## 质量标准

这个仓库遵循一组简单标准，确保 Notebook 真正适合作为学习材料：

- 概念先讲动机，再进入符号和公式。
- 新术语先定义，再大量使用。
- 核心算法至少包含一个具体手算例子或 toy example。
- 代码 cell 尽量短小，运行后能看到关键观察。
- 随机实验在合适位置固定 seed。
- 每个 Notebook 自包含，不依赖其他 Notebook 的变量状态。
- Markdown 面向有耐心的初学者，代码仍然贴近真实算法结构。

## 论文与系统

课程会把这些论文和系统中的关键设计拆成可运行的小实验：

| 论文或系统 | 覆盖概念 |
|:---|:---|
| Attention Is All You Need | Multi-Head Attention、Position Encoding |
| BERT | Encoder-only、Masked Language Modeling |
| LLaMA | RMSNorm、SwiGLU、RoPE、Pre-Norm |
| Scaling Laws / Chinchilla | 参数、数据、算力权衡 |
| LoRA | Low-Rank Adaptation |
| RLHF / PPO / DPO | 偏好对齐 |
| FlashAttention / vLLM | 推理加速与显存管理 |
| Speculative Decoding | Draft-then-verify 生成 |
| RoPE / YaRN | 长上下文外推 |
| Chain-of-Thought | 推理链与 Self-Consistency |
| Flamingo / LLaVA | Vision-Language Models |
| Knowledge Distillation / OPD | 压缩与蒸馏 |

## 项目结构

```text
modern-llm-notebook/
├── notebooks/           # 中文源 Notebook
│   ├── part1-foundation/
│   ├── part2-training/
│   ├── part3-inference/
│   ├── part4-frontiers/
│   └── part5-production/
├── notebooks-en/        # 英文镜像 Notebook
│   ├── part1-foundation/
│   ├── part2-training/
│   ├── part3-inference/
│   ├── part4-frontiers/
│   └── part5-production/
├── web/                 # React / Vite 网页阅读器
├── docs/                # 静态网站构建产物
├── scripts/             # Notebook 转换脚本
├── requirements.txt
├── package.json
├── README.md
└── README-CN.md
```

## 贡献

欢迎贡献，尤其是能提升清晰度、正确性或覆盖面的改动。

适合贡献的内容包括：

- 修复解释错误、损坏的 cell 或过时 API。
- 改进手算过程和可视化。
- 增加带 assert 的小练习。
- 改进中英文文档。
- 为重要模型结构或训练方法提出新的 Notebook。

提交 PR 前请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## Star History

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

## 许可证

本项目采用
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](LICENSE)
协议发布。

---

<p align="center">
  <sub>
    为想从内部理解 LLM 系统的工程师而构建。
    <br>
    由 <a href="https://github.com/walkinglabs">walkinglabs</a> 维护。
  </sub>
</p>
