#!/usr/bin/env python3
"""Deep polish of section headings (H2/H3) to match notebook 02's clean D2L style.

Notebook 02 style:
  ## 1. BPE 的目标          — short noun phrase, states the topic
  ## 2. 训练 BPE             — clean, no "— subtitle", no question marks
  ### 起点：字符              — sub-sections are very brief

What we remove:
  - Questions (？) and question-word openings (为什么, 怎么, 什么时候)
  - "— subtitle" explanatory tags
  - Casual/verbose framing ("先搞懂", "先看一眼", "核心问题", "关键问题")
  - Non-standard 小结 names ("XX 支线小结", "XX 小结" → "小结")
"""

import json
import sys
from pathlib import Path

NOTEBOOKS_DIR = Path("notebooks")

# ── Heading map: (old_stripped_line → new_stripped_line) ──────────────────
# Only include headings that need changing. Exact match on stripped line.
HEADING_MAP = {
    # ── 小结 standardization ────────────────────────────────────────────
    "## 从 GPT-2 到现代模型小结": "## 小结",
    "## MoE 支线小结": "## 小结",
    "## 第五部分小结": "## 小结",
    "## 缩放定律小结": "## 小结",
    "## 数据工程小结": "## 小结",
    "## RLHF 对齐小结": "## 小结",
    "## 第六部分小结 + 全课程复习": "## 小结",
    "## 推理加速支线小结": "## 小结",
    "## 投机解码支线小结": "## 小结",
    "## 长上下文外推支线小结": "## 小结",
    "## CoT + Thinking 模型小结": "## 小结",
    "## VLM 支线小结": "## 小结",
    "## LLM 蒸馏小结": "## 小结",
    "## OPD 支线小结": "## 小结",
    "## 小结：LLM 评测完整全景图": "## 小结",
    "## 上半场：缩放定律": "## 上半场：缩放定律",  # keep - structural divider
    "## 下半场：资源估算": "## 下半场：资源估算",  # keep - structural divider

    # ── 06: 从 GPT-2 到现代模型 ─────────────────────────────────────────
    "## 0. 先回顾：Part 4 的 Block 长什么样？在这里动手改": "## 0. 回顾 Transformer Block",
    "## 5. 拼起来！现代 LLaMA-style Block": "## 5. 现代 LLaMA-style Block",
    "## 7. 改进五：MHA → GQA — Attention 的 KV 太贵了": "## 7. 改进五：MHA → GQA",
    "## 8. 改进六：QK-Norm — 防止 Attention 退化": "## 8. 改进六：QK-Norm",
    "## 9. 改进七：MHA → GQA → MLA — KV Cache 的终极压缩": "## 9. 改进七：MHA → GQA → MLA",

    # ── 07: MoE ─────────────────────────────────────────────────────────
    "## 1. 回顾：普通 Transformer 的 FFN 层": "## 1. 普通 Transformer 的 FFN 层",
    "## 2. MoE 的核心思想：多个专家 + 路由器": "## 2. MoE 的核心思想",

    # ── 08: BERT ────────────────────────────────────────────────────────
    "## 1. Encoder vs Decoder：先搞清楚架构上的本质区别": "## 1. Encoder 与 Decoder",
    "## 2. BERT 的输入表示：Token + Segment + Position 三合一": "## 2. BERT 的输入表示",
    "## 3. BERT 的核心：MLM（遮词填空）预训练": "## 3. MLM 预训练",
    "## 4. 完整演示：MLM 是怎么训练的": "## 4. MLM 训练演示",
    "## 5. BERT 的微调范式：不同下游任务怎么接？": "## 5. BERT 的微调范式",
    "## 6. 真实 BERT 加载演示（transformers 库）": "## 6. 真实 BERT 加载演示",
    "## 7. BERT vs GPT：一张表说清本质区别": "## 7. BERT 与 GPT 对比",

    # ── 09: 训练循环 ────────────────────────────────────────────────────
    "## 1. 先从一个超级简单的例子开始": "## 1. 最简单的训练例子",
    "## 2. 训练数据和标签：一次 forward 算出所有位置的 loss": "## 2. 训练数据与标签",
    "## 3. Loss 怎么算？— Cross-Entropy Loss": "## 3. Cross-Entropy Loss",
    "## 4. 回答核心问题：是 Token 级别训练还是句子级别？": "## 4. Token 级别还是句子级别",
    "## 5. 一个 batch 里面多句话的训练": "## 5. 一个 Batch 多句话的训练",
    "## 7. 核心回顾：一张图终结所有疑惑": "## 7. 核心回顾",
    "## 8. 一个常见的混淆点：训练 vs 推理的区别": "## 8. 训练与推理的区别",
    "## 9. 梯度视角：loss 算完之后发生了什么？": "## 9. 梯度视角",
    "## 10. 从对话到 Token：你的 JSONL 数据到底喂给了模型什么？": "## 10. 从对话到 Token",
    "## 11. 训练稳定性三件套：Gradient Clipping、Accumulation、Warmup": "## 11. 训练稳定性",

    # ── 10: 缩放定律 ────────────────────────────────────────────────────
    "## 1. 什么是幂律？— 用存钱利息来理解": "## 1. 幂律分布",
    "## 5. µP（Maximal Update Parameterization）— 怎么在小模型上调参？": "## 5. µP：最大更新参数化",
    "## 6. FLOPs 估算 — 训练需要多少算力？": "## 6. FLOPs 估算",
    "## 7. 显存估算 — 训练需要多少张 GPU？": "## 7. 显存估算",

    # ── 11: 数据工程 ────────────────────────────────────────────────────
    "## 0. 总览：数据 Pipeline 全貌": "## 0. 数据 Pipeline 总览",
    "## 2. 质量过滤 — 怎么判断一篇文章值不值得学？": "## 2. 质量过滤",
    "## 3. 去重 — 同一句话不能让模型学 100 遍": "## 3. 去重",
    "## 4. 数据混合 — 不同来源怎么「配菜」？": "## 4. 数据混合",
    "## 7. Tokenize 之后：数据怎么变成训练流？": "## 7. 从 Tokenize 到训练流",

    # ── 12: LoRA ────────────────────────────────────────────────────────
    "## 1. 全量微调贵在哪？— 一张表说清楚": "## 1. 全量微调的成本",
    "## 2. 核心直觉：为什么权重更新是「低秩」的？": "## 2. 低秩权重更新",
    "## 3. 手算拆解：LoRA 的前向传播到底在算什么？": "## 3. LoRA 的前向传播",
    "## 4. 代码实现：LoraLinear — 包装 nn.Linear": "## 4. LoraLinear 实现",
    "## 5. 玩具验证：LoRA 能学到和全量微调差不多的解吗？": "## 5. LoRA 的验证",
    "## 8. 推理时：合并权重，零额外开销": "## 8. 推理时合并权重",
    "## 10. QLoRA — 再省 4 倍显存": "## 10. QLoRA",

    # ── 13: Mid-Training ────────────────────────────────────────────────
    "## 1. 一个问题引出整个 Part": "## 1. 问题引入",
    "## 3. 退火（Annealing）：为什么最后 10% 的训练最关键？": "## 3. 退火（Annealing）",
    "## 4. Mid-Training 数据策略：退火阶段该喂什么？": "## 4. Mid-Training 数据策略",
    "## 5. 持续预训练（CPT）：把通用模型变成领域专家": "## 5. 持续预训练（CPT）",

    # ── 14: RLHF ────────────────────────────────────────────────────────
    "## 1. 为什么需要对齐？— 用两个回答感受一下": "## 1. 为什么需要对齐",
    "## 3. Stage 1 — SFT：教会模型「对话」": "## 3. Stage 1：SFT",
    "## 4. Stage 2 — Reward Model：教会模型「什么是好」": "## 4. Stage 2：Reward Model",
    "## 5. Stage 3 — PPO：用 RM 的分数来优化 LLM": "## 5. Stage 3：PPO",
    "## 6. DPO — 跳过 RM 和 PPO，直接优化偏好": "## 6. DPO",
    "## 8. 一个完整的对齐流程（LLaMA 2 的做法）": "## 8. LLaMA 2 的完整对齐流程",

    # ── 15: 推理生成 ────────────────────────────────────────────────────
    "## 2. 最简单的生成：Greedy Decoding（贪心解码）": "## 2. Greedy Decoding",
    "## 3. 先找一个简单的训练场景，训一个能跑的模型": "## 3. 训练一个可复现的模型",
    "## 4. 生成验证：模型是否学会了序列模式": "## 4. 生成验证",
    "## 7. 带 Temperature 和 Top-K 的生成函数": "## 7. Temperature 与 Top-K 采样",
    "## 9. 完整 pipeline：从文本到文本": "## 9. 完整生成 Pipeline",
    "## 10. Top-p (Nucleus Sampling)：比 top-k 更聪明的截断": "## 10. Top-p 采样",
    "## 11. Beam Search：同时走多条路，选总分最高的": "## 11. Beam Search",
    "## 12. Repetition Penalty：别让模型变成复读机": "## 12. Repetition Penalty",
    "## 13. Stopping Criteria：什么时候该停下来？": "## 13. Stopping Criteria",
    "### Part 6 小结": "### Part 6 小结",  # keep
    "### 全课程总复习": "### 全课程总复习",  # keep
    "### 接下来你可以做什么？": "### 接下来你可以做什么",  # remove ？

    # ── 16: 推理加速 ────────────────────────────────────────────────────
    "## 1. 推理慢的根源：重复计算": "## 1. 推理慢的根源",
    "## 2. 解决方案一：KV Cache — 把算过的存起来": "## 2. KV Cache",
    "## 4. vLLM 的核心创新：PagedAttention": "## 4. PagedAttention",

    # ── 17: 投机解码 ────────────────────────────────────────────────────
    "## 3. 关键问题：怎么判断「接受」还是「拒绝」？": "## 3. 接受与拒绝的判定",
    "## 4. 投机解码为什么能加速？": "## 4. 投机解码的加速原理",
    "## 7. 投机解码 vs 普通解码：一张图总结": "## 7. 投机解码与普通解码对比",

    # ── 18: 长上下文外推 ────────────────────────────────────────────────
    "## 1. 先说清楚：「外推」到底是什么意思？": "## 1. 什么是外推",
    "## 2. 先回忆：为什么需要「位置编码」？": "## 2. 位置编码回顾",
    "## 3. 三种位置编码，三种「外推」命运": "## 3. 三种位置编码的外推能力",
    "## 4. RoPE 的直觉：位置 = 时钟指针转过的角度": "## 4. RoPE 的直觉",
    "## 5. 一步步看 RoPE 是怎么算的": "## 5. RoPE 的计算过程",
    "## 6. 直接外推为什么失败？": "## 6. 直接外推的失败原因",
    "## 7. 核心思想：把「没见过的大角度」映射回「见过的小角度」": "## 7. 核心思想：角度映射",
    "## 8. 方法一：Position Interpolation (PI) — 最简单的办法": "## 8. 方法一：Position Interpolation",
    "## 9. 方法二：NTK-aware — 「快指针不用管，慢指针才要调」": "## 9. 方法二：NTK-aware",
    "## 10. 方法三：YaRN — 在 NTK 基础上再加一个巧思": "## 10. 方法三：YaRN",
    "## 12. 怎么验证模型真的「学会」了长上下文？—— 探针测试": "## 12. 长上下文的验证方法",
    "## 14. 实战：把 4K 模型扩展到 32K 的四步操作": "## 14. 实战：4K 扩展到 32K",
    "## 15. 实战：用 ModelScope 获取 Qwen + NTK 扩展其上下文": "## 15. 实战：ModelScope + NTK 扩展",

    # ── 19: CoT + Thinking ──────────────────────────────────────────────
    "## 1. 问题：为什么 LLM 做数学题这么烂？": "## 1. LLM 的推理缺陷",
    "## 2. CoT（Chain-of-Thought）：让模型把思考过程写出来": "## 2. Chain-of-Thought（CoT）",
    "## 3. 从 CoT 到 Thinking 模型：把思考过程「藏起来」": "## 3. 从 CoT 到 Thinking 模型",
    "## 4. Thinking 模型是怎么训练的？": "## 4. Thinking 模型的训练方法",
    "## 5. 怎么训练你自己的 Thinking 模型？": "## 5. 训练自己的 Thinking 模型",
    "## 9. 实操：如何在实际中启动和切换 Thinking 模式": "## 9. 实操：启动与切换 Thinking 模式",
    "## 10. 自己训练一个 Thinking 模型（完整实操版）": "## 10. 实战：训练 Thinking 模型",

    # ── 20: VLM ─────────────────────────────────────────────────────────
    "## 1. 核心问题：图片和文字是两种完全不同的东西": "## 1. 图片与文本的差异",
    "## 2. 第一步：把图片切成小块（Patchify）": "## 2. Patchify：图片切块",
    "## 3. 第二步：Patch Embedding — 把每个小块变成向量": "## 3. Patch Embedding",
    "## 4. 第三步：视觉 token + 文本 token → 一起喂给 LLM": "## 4. 视觉 Token 与文本 Token 的融合",
    "## 6. 三种主流 VLM 架构（详解）": "## 6. 三种主流 VLM 架构",
    "## 7. 为什么图片要占这么多 token？": "## 7. 图片的 Token 开销",
    "## 8. VLM 的训练与冻结策略": "## 8. 训练与冻结策略",
    "## 9. 一个极简 VLM 的 PyTorch 实现": "## 9. 极简 VLM 实现",
    "## VLM 支线小结": "## 小结",  # second occurrence guard

    # ── 21: 评测 ────────────────────────────────────────────────────────
    "## 1. 评测全景图：论文和工业界到底在评什么？": "## 1. 评测全景",
    "## 5. 评测结果：怎么汇总、怎么对比、怎么展示": "## 5. 评测结果的汇总与对比",
    "## 11. 实战：用 AlpacaEval 跑完整的 LLM-as-Judge 评测": "## 11. AlpacaEval 实战",
    "## 10. 按系统类型的专项评测": "## 10. 专项评测",
    "## 9. LLM-as-Judge 偏差 & 一致性评测": "## 9. LLM-as-Judge 的偏差与一致性",
    "## 6. 深入：现代评测指标体系详解": "## 6. 评测指标体系",
    "## 8. 实战速查：最常用命令": "## 8. 实战速查",

    # ── 22: 蒸馏 ────────────────────────────────────────────────────────
    "## 1. 蒸馏的本质：学「怎么想」而不只是「答案是什么」": "## 1. 蒸馏的本质",
    "## 5. 实战：从 GPT-4 蒸馏一个 7B 模型": "## 5. 实战：蒸馏 7B 模型",
    "## 6. 蒸馏 vs OPD：什么时候用哪个？": "## 6. 蒸馏与 OPD 对比",

    # ── 23: OPD ─────────────────────────────────────────────────────────
    "## 1. 先搞懂基础：知识蒸馏是什么？": "## 1. 知识蒸馏回顾",
    "## 2. 先看一眼全局：四种训练方式到底差在哪？": "## 2. 四种训练方式对比",
    "## 10. 为什么 OPD 今年才火？工程基础设施成熟了": "## 10. OPD 为什么现在才火",
    "## 14. 工业落地：谁在用 OPD？（2024-2026）": "## 14. OPD 的工业落地",

    # ── H3 subsections that are too verbose ──────────────────────────────
    # 07
    "### 4.1 MoE 训练最佳实践：先监控路由，再调参数": "### 4.1 MoE 训练最佳实践",
    # 12
    "### 7. 训练演示：用 LoRA 做 SFT": "### 7. 用 LoRA 做 SFT",
    # 20
    "### 7.5 视觉注入的工程细节：Projector、位置编码、特殊 Token": "### 7.5 视觉注入的工程细节",
    # 21
    "### 9.1 LLM-as-Judge 的已知偏差（非常重要！）": "### 9.1 LLM-as-Judge 的已知偏差",
}

# ── Clean trailing ？ from any H2/H3 that wasn't explicitly mapped ───────
# This handles missed question marks without needing explicit entries.


def _process_line(line):
    """Process a single text line. Returns (modified_line, changed)."""
    stripped = line.strip()
    modified = line
    changed = False

    # 1. Exact heading match
    if stripped in HEADING_MAP:
        modified = HEADING_MAP[stripped]
        print(f"  HEADING: {stripped[:70]} → {HEADING_MAP[stripped][:70]}")
        return modified, True

    # 2. Strip trailing ？ from any heading not explicitly mapped
    if (stripped.startswith("## ") or stripped.startswith("### ")):
        if stripped.rstrip().endswith("？"):
            # Remove trailing ？, preserve the rest of the line structure
            idx = stripped.rfind("？")
            modified = stripped[:idx] + stripped[idx+1:]
            print(f"  STRIP-?: {stripped[:70]}")
            return modified, True

    return modified, changed


def _process_lines(lines):
    new_lines = []
    count = 0
    for line in lines:
        new_line, changed = _process_line(line)
        new_lines.append(new_line)
        if changed:
            count += 1
    return new_lines, count


def process_notebook(nb_path):
    with open(nb_path) as f:
        nb = json.load(f)

    changes = 0
    for cell in nb["cells"]:
        if cell["cell_type"] != "markdown":
            continue

        src = cell["source"]
        if isinstance(src, str):
            lines = src.split("\n")
            new_lines, n = _process_lines(lines)
            cell["source"] = "\n".join(new_lines)
            changes += n
        else:
            new_elems = []
            for elem in src:
                if "\n" in elem:
                    sub_lines = elem.split("\n")
                    new_sub, n = _process_lines(sub_lines)
                    new_elems.append("\n".join(new_sub))
                    changes += n
                else:
                    new_line, n = _process_line(elem)
                    new_elems.append(new_line)
                    if n:
                        changes += 1
            cell["source"] = new_elems

    if changes:
        with open(nb_path, "w") as f:
            json.dump(nb, f, ensure_ascii=False, indent=1)
        print(f"  → {changes} changes saved to {nb_path.name}")
    else:
        print(f"  → no changes needed")

    return changes


def main():
    nb_files = sorted(NOTEBOOKS_DIR.glob("**/*.ipynb"))
    total = 0
    for nb_path in nb_files:
        print(f"\n{'='*60}")
        print(f"Processing: {nb_path.name}")
        total += process_notebook(nb_path)

    print(f"\n{'='*60}")
    print(f"Total changes across all notebooks: {total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
