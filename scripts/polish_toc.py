#!/usr/bin/env python3
"""Polish Chinese notebook titles and TOC to D2L style.

Three operations:
1. Rename H1 titles to concise concept-focused D2L format
2. Fix heading levels: notebooks 06+ use ### for main sections, should be ##
3. Remove emoji from section headings
"""

import json
import re
import sys
from pathlib import Path

NOTEBOOKS_DIR = Path("notebooks")

# ── Title map: old H1 → new H1 ───────────────────────────────────────────
TITLE_MAP = {
    "# Tokenizer 基础：文字怎么变数字":
    "# Tokenizer 基础",

    "# Token ID → 向量：Embedding + Position":
    "# Embedding 与位置编码",

    "# Attention 到 Transformer Block":
    "# Attention 机制与 Transformer Block",

    "# MoE — 一个模型里住着 8 个专家":
    "# 混合专家模型（MoE）",

    "# BERT — 能双向阅读的 Encoder-Only 模型":
    "# BERT：Encoder-Only 预训练",

    "# 训练循环与 Loss 构建":
    "# 训练循环与损失函数",

    "# 缩放定律 — 模型该多大？数据该多少？":
    "# 缩放定律",

    "# 数据工程 — LLM 的训练数据从哪来、怎么处理？":
    "# 数据工程",

    "# LoRA — 怎么用一张 4090 微调 70B 模型？":
    "# LoRA：低秩适配微调",

    "# Mid-Training、退火与持续预训练 — 预训练完了还不算完":
    "# Mid-Training、退火与持续预训练",

    "# RLHF 对齐 — 怎么让 LLM 从「能说话」变成「说人话」？":
    "# RLHF 对齐",

    "# LLM 推理加速 — 为什么 LLM 生成得这么慢？":
    "# LLM 推理加速",

    "# 投机解码 — 用小模型「猜」，大模型「验证」":
    "# 投机解码",

    "# 长上下文外推 — 让 LLM 突破训练窗口的限制":
    "# 长上下文外推",

    "# CoT + Thinking 模型 — 怎么让模型「先想再说」？":
    "# 思维链与 Thinking 模型",

    "# VLM — 让 LLM 看懂图片":
    "# 视觉语言模型（VLM）",

    "# LLM 评测 — 怎么用数据说话？":
    "# LLM 评测",

    "# LLM 蒸馏 — 怎么把大模型的能力「压缩」到小模型？":
    "# LLM 蒸馏",

    "# OPD — 为什么要让学生「自己写题」再让老师改？":
    "# 在线策略蒸馏（OPD）",
}

EMOJI_TO_STRIP = ["🎓", "🚀", "⭐"]


def _process_line(line):
    """Process a single text line. Returns (modified_line, changed)."""
    stripped = line.strip()
    modified = line
    changed = False

    # 1. Title rename (H1 only)
    if stripped in TITLE_MAP:
        modified = TITLE_MAP[stripped]
        print(f"  TITLE: {stripped} → {TITLE_MAP[stripped]}")
        changed = True

    # 2. Heading level fix: ### N.  → ## N.  (integer sections)
    if stripped.startswith("### ") and not stripped.startswith("#### "):
        m = re.match(r"^### (\d+)\.\s", stripped)
        if m:
            modified = "##" + modified[3:]
            print(f"  H3→H2: {stripped[:60]}...")
            changed = True

    # 3. Emoji removal from headings
    if stripped.startswith("#"):
        for emoji in EMOJI_TO_STRIP:
            if emoji in modified:
                modified = modified.replace(emoji, "").replace("  ", " ")
                print(f"  EMOJI: removed {emoji} from heading")
                changed = True

    return modified, changed


def _process_lines(lines):
    """Process a list of text lines. Returns (new_lines, change_count)."""
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
            # List of strings: each element may contain embedded \n
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
