# Modern LLM Notebook — 从零实现大语言模型的完整教程

<p align="center">
  <strong>21 Jupyter Notebooks &middot; 手写核心算法 &middot; 从 Tokenizer 到 On-Policy Distillation</strong>
</p>

<p align="center">
  <a href="#learning-map">Learning Map</a> |
  <a href="#quick-start">Quick Start</a> |
  <a href="#notebook-index">Notebook Index</a> |
  <a href="#papers-covered">Papers Covered</a> |
  <a href="#real-world-models">Real-World Models</a>
</p>

---

> **"The missing textbook for modern LLMs."**
>
> 这不是另一份「调用 GPT API」的教程。这是一份**从零实现大模型核心组件**的实战指南。
> 每个 Part 遵循 **直觉理解 -> 手算验证 -> 代码实现 -> 实验观察** 的教学循环。
> 你会亲手写出 BPE Tokenizer、Multi-Head Attention、MoE Router、RLHF PPO、Speculative Decoding、VLM Cross-Attention。

*Last updated: 2026-05*

---

## Learning Map

```
                        Modern LLM Full Stack
                              │
    ┌─────────────────────────┼─────────────────────────┐
    │                         │                         │
    ▼                         ▼                         ▼
┌──────────┐          ┌──────────────┐          ┌──────────────┐
│ Part 1   │          │  Part 2       │          │  Part 3       │
│ Foundation│ ───────>│  Training     │ ───────>│  Inference    │
│ 01-04    │          │  05-12        │          │  13-15        │
└──────────┘          └──────────────┘          └──────────────┘
  Tokenizer                                          KV Cache
  BPE                     RMSNorm / SwiGLU           FlashAttention
  Embedding               MoE Router                 vLLM / PagedAttn
  Position Encoding       BERT / MLM                 Speculative Dec.
  Mini-GPT                Scaling Laws               Beam Search
                          Data Pipeline
                          LoRA / RLHF / DPO
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
             ┌──────────────┐   ┌──────────────┐
             │  Part 4       │   │  Part 5       │
             │  Frontiers    │   │  Production   │
             │  16-18        │   │  19-21        │
             └──────────────┘   └──────────────┘
               Long Context       Evaluation
               CoT / Thinking     Distillation
               VLM (Flamingo)     On-Policy Distillation
```

每个 Notebook 都是**自包含**的——可以按需跳转到任何 Part，不依赖前序 Notebook 的运行时状态。

---

## Quick Start

```bash
git clone https://github.com/sanbuphy/modern-llm-notebook.git
cd modern-llm-notebook
pip install -r requirements.txt
jupyter notebook notebooks/part1-foundation/01-tokenizer-basics.ipynb
```

**要求**: Python 3.9+, PyTorch 2.0+, 16GB RAM。大部分 Notebook 在 CPU 上即可运行，部分训练章节建议使用 GPU。

---

## Notebook Index

### Part 1: Foundation — 基础组件

从 Tokenizer 到 Mini-GPT，理解一个 GPT 模型从输入文本到输出 logits 的完整数据流。

| # | Notebook | 核心内容 | 手写实现 |
|:---:|:---|:---|:---|
| 01 | [Tokenizer Basics](notebooks/part1-foundation/01-tokenizer-basics.ipynb) | 为什么需要 Tokenizer？字符级/词级分词 | `CharTokenizer`, `WordTokenizer` |
| 02 | [BPE Tokenizer](notebooks/part1-foundation/02-bpe-tokenizer.ipynb) | BPE 训练/编码/解码，merge rules 可视化 | `BPETokenizer` 完整实现 |
| 03 | [Embedding & Position](notebooks/part1-foundation/03-embedding-position.ipynb) | Token Embedding + Sinusoidal Position Encoding | `TokenEmbedding`, t-SNE 可视化 |
| 04 | [Mini-GPT](notebooks/part1-foundation/04-mini-gpt.ipynb) | 从零组装一个 GPT 模型 | `MultiHeadAttention`, `TransformerBlock`, `MiniGPT` |

### Part 2: Training — 训练管线

从架构优化到人类对齐，掌握完整的训练管线。

| # | Notebook | 核心内容 | 手写实现 |
|:---:|:---|:---|:---|
| 05 | [Architecture Refinements](notebooks/part2-training/05-architecture-refinements.ipynb) | LLaMA 的改进: RMSNorm, SwiGLU, RoPE, Pre-Norm | `RMSNorm`, `FeedForward_SwiGLU`, `LLaMABlock` |
| 06 | [Mixture of Experts](notebooks/part2-training/06-moe.ipynb) | MoE 路由机制、top-k 选择、负载均衡 | `MoELayer`, Router Gate |
| 07 | [BERT Encoder](notebooks/part2-training/07-bert-encoder.ipynb) | Encoder-only 架构、双向注意力、MLM | `MiniBERT`, 分类头 |
| 08 | [Training & Loss](notebooks/part2-training/08-training-loss.ipynb) | 训练循环、loss 曲线、梯度累积 | 完整训练循环 |
| 09 | [Scaling Laws](notebooks/part2-training/09-scaling-laws.ipynb) | Kaplan -> Chinchilla -> 过度训练, FLOPs 估算 | C~6PD, M~20P |
| 10 | [Data Engineering](notebooks/part2-training/10-data-engineering.ipynb) | HTML 清洗、质量过滤、MinHash 去重、数据混合 | SHA256/MinHash 去重 |
| 11 | [LoRA](notebooks/part2-training/11-lora.ipynb) | 低秩适应、A*B 分解、merge 推理 | `LoraLinear`, `apply_lora_to_attention` |
| 12 | [RLHF Alignment](notebooks/part2-training/12-rlhf-alignment.ipynb) | Reward Model、PPO Clip、DPO | Bradley-Terry loss, PPO clip, DPO loss |

### Part 3: Inference — 推理优化

掌握 LLM 推理加速的全部核心技术。

| # | Notebook | 核心内容 | 手写实现 |
|:---:|:---|:---|:---|
| 13 | [Generation](notebooks/part3-inference/13-generation.ipynb) | Greedy, Temperature, Top-K, Top-P, Beam Search | `generate_greedy`, `top_p_filter`, `beam_search` |
| 14 | [Inference Acceleration](notebooks/part3-inference/14-inference-acceleration.ipynb) | KV Cache, FlashAttention, vLLM/PagedAttention | `AttentionWithKVCache` |
| 15 | [Speculative Decoding](notebooks/part3-inference/15-speculative-decoding.ipynb) | Draft Model -> Target Model 验证, Medusa | `speculative_accept` |

### Part 4: Frontiers — 前沿技术

2024-2025 年 LLM 的前沿方向。

| # | Notebook | 核心内容 | 手写实现 |
|:---:|:---|:---|:---|
| 16 | [Long Context](notebooks/part4-frontiers/16-long-context.ipynb) | RoPE 频率分析、PI、NTK、YaRN | `ExtrapolatableRoPE`, Needle-in-Haystack |
| 17 | [CoT & Thinking](notebooks/part4-frontiers/17-cot-thinking.ipynb) | Chain-of-Thought, Self-Consistency, 思维链训练 | `generate_coldstart_data`, RL reward function |
| 18 | [Vision-Language Models](notebooks/part4-frontiers/18-vlm.ipynb) | Patch Embedding, Cross-Attention, Flamingo Gating | `PatchEmbedding`, `FlamingoGatedCrossAttnBlock` |

### Part 5: Production — 工程落地

评测、压缩、部署——把模型推向生产。

| # | Notebook | 核心内容 | 手写实现 |
|:---:|:---|:---|:---|
| 19 | [Evaluation](notebooks/part5-production/19-evaluation.ipynb) | lm-eval, LLM-as-Judge, 5 种复合评分方法 | 雷达图、胜率矩阵、RAGAS |
| 20 | [Distillation](notebooks/part5-production/20-distillation.ipynb) | Logit 蒸馏、数据蒸馏、特征蒸馏 | 温度对软标签的影响 |
| 21 | [On-Policy Distillation](notebooks/part5-production/21-opd.ipynb) | Exposure Bias, Forward/Reverse KL, k1/k2/k3 估计器 | OPSD, 21 篇论文分类法 |

---

## Papers Covered

本教程直接对应以下论文的核心算法，每个都手写了实现或模拟：

| 论文 | Notebook | 实现内容 |
|:---|:---:|:---|
| **Attention Is All You Need** (Vaswani et al., 2017) | 04 | Multi-Head Attention, Sinusoidal PE |
| **BERT** (Devlin et al., 2019) | 07 | Masked LM, Next Sentence Prediction |
| **LLaMA** (Touvron et al., 2023) | 05 | RMSNorm, SwiGLU, RoPE, Pre-Norm |
| **Scaling Laws** (Kaplan et al., 2020) | 09 | C ~ 6PD, compute-optimal training |
| **Chinchilla** (Hoffmann et al., 2022) | 09 | Data-optimal scaling, over-training |
| **LoRA** (Hu et al., 2022) | 11 | Low-Rank Adaptation, A*B decomposition |
| **RLHF / PPO** (Ouyang et al., 2022) | 12 | Reward Model, PPO clip, KL penalty |
| **DPO** (Rafailov et al., 2023) | 12 | Direct Preference Optimization loss |
| **FlashAttention** (Dao et al., 2022) | 14 | Tiling, SRAM-aware computation |
| **vLLM** (Kwon et al., 2023) | 14 | PagedAttention, memory sharing |
| **Speculative Decoding** (Leviathan et al., 2023) | 15 | Draft-then-verify, acceptance ratio |
| **RoPE** (Su et al., 2023) | 16 | Rotary Position Embedding, frequency analysis |
| **YaRN** (Peng et al., 2023) | 16 | NTK-aware + temperature tuning |
| **Chain-of-Thought** (Wei et al., 2022) | 17 | Few-shot CoT, Self-Consistency |
| **DeepSeek-R1** (DeepSeek, 2025) | 17 | Thinking model training, RL for reasoning |
| **Flamingo** (Alayrac et al., 2022) | 18 | Cross-attention with tanh gating |
| **LLaVA** (Liu et al., 2023) | 18 | Vision projector, freeze strategy |
| **RAGAS** (Es et al., 2023) | 19 | Faithfulness, relevance metrics |
| **LLM-as-Judge** (Zheng et al., 2023) | 19 | MT-Bench, win rate evaluation |
| **Knowledge Distillation** (Hinton et al., 2015) | 20 | Logit distillation, temperature, dark knowledge |
| **On-Policy Distillation** (2024-2025) | 21 | Exposure bias, OPSD, KL estimation taxonomy |

每个 Notebook 内部还引用了更多相关论文。

---

## Real-World Models

教程中的实现直接对应以下真实模型的设计决策：

| 模型 | 关联技术 | Notebook |
|:---|:---|:---:|
| **GPT-4 / GPT-4o** | Decoder-only, RLHF, Speculative Decoding | 04, 12, 15 |
| **LLaMA 3** | RMSNorm, SwiGLU, RoPE, Pre-Norm | 05 |
| **Mixtral** | Sparse MoE, Top-2 Routing | 06 |
| **DeepSeek-V3 / R1** | MoE, Multi-Head Latent Attention, Thinking Models | 06, 17 |
| **Qwen2.5** | GQA, Long Context (YaRN), Data Pipeline | 10, 16 |
| **Gemini** | VLM, Multi-modal fusion | 18 |
| **Claude** | RLHF, Constitutional AI, Thinking | 12, 17 |
| **Phi-3** | Data Quality, Distillation | 10, 20 |

---

## 教学特色

**手算验证。** 每个核心算法先用具体数字手动计算一遍，确保理解每一步的数学含义，再用代码实现。

```
# 示例 — 来自 06-moe:
Input x = [1.0, 0.5]
Router weights = [[0.8, 0.2], [0.3, 0.7]]
Gate logits = x @ Router = [0.9, 1.7]
Top-2 mask -> Expert 0 and Expert 1 activated
-> 你理解了 Router 到底做了什么，不只是调了个 API。
```

**从零实现。** 所有实现仅依赖 PyTorch (`torch.nn` + `torch.nn.functional`)，不使用 `transformers` 等封装库。

**实验驱动。** 每个模块都有实验环节——改变温度看分布变化、增加专家数看路由模式、调整 RoPE 频率看外推效果。

---

## Contributing

欢迎贡献！详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

- 修复 Bug 或过时的 API 调用
- 改进解释、增加图示
- 英文翻译
- 新 Notebook（Mamba, Jamba, Liquid Models 等）

---

## License

[MIT License](LICENSE)

---

<p align="center">
  <sub>Maintained by <a href="https://github.com/sanbuphy">sanbuphy</a> &middot; If this helps you learn LLMs, consider giving it a star.</sub>
</p>
