#!/usr/bin/env python3
"""
Convert Jupyter notebooks to JSON for the React web app.
Usage: python scripts/convert.py
"""

import ast
import hashlib
import json
import re
from pathlib import Path
import nbformat
from nbconvert import HTMLExporter

REPO = Path(__file__).resolve().parent.parent
NOTEBOOKS_DIR = REPO / "notebooks"
WEB_DIR = REPO / "web"
OUTPUT_DIR = WEB_DIR / "public" / "data" / "notebooks"

PARTS = [
    ("part1-foundation", "Foundation", "Represent text, position, and attention as executable systems."),
    ("part2-training", "Training Systems", "Architectures, data, optimization, adaptation, and alignment."),
    ("part3-inference", "Inference", "Decoding, serving constraints, cache design, and acceleration."),
    ("part4-frontiers", "Frontiers", "Long context, reasoning traces, and multimodal interfaces."),
    ("part5-production", "Evaluation & Deployment", "Evaluation, distillation, and production model behavior."),
]

# Clean display titles (overrides notebook content)
TITLE_MAP = {
    "01-tokenizer-basics": "Tokenizer 基础",
    "02-bpe-tokenizer": "BPE 分词器",
    "03-embedding-position": "Embedding 与位置编码",
    "04-mini-gpt": "Mini-GPT",
    "05-architecture-refinements": "架构改进",
    "06-moe": "MoE 混合专家",
    "07-bert-encoder": "BERT 编码器",
    "08-training-loss": "训练与 Loss",
    "09-scaling-laws": "Scaling Laws",
    "10-data-engineering": "数据工程",
    "11-lora": "LoRA",
    "12-midtraining-cpt": "Mid-Training & CPT",
    "13-rlhf-alignment": "RLHF 对齐",
    "13-generation": "生成策略",
    "14-inference-acceleration": "推理加速",
    "15-speculative-decoding": "投机解码",
    "16-long-context": "长上下文",
    "17-cot-thinking": "CoT 思维链",
    "18-vlm": "视觉语言模型",
    "19-evaluation": "模型评测",
    "20-distillation": "知识蒸馏",
    "21-opd": "On-Policy Distillation",
}


def clean_html(html):
    """Extract notebook content, remove scripts/styles, inject heading IDs."""
    html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL)
    html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
    html = re.sub(r'<link[^>]*>', '', html)
    html = re.sub(r'<!DOCTYPE[^>]*>', '', html, flags=re.IGNORECASE)
    html = re.sub(r'</?html[^>]*>', '', html, flags=re.IGNORECASE)
    html = re.sub(r'</?head[^>]*>', '', html, flags=re.IGNORECASE)
    html = re.sub(r'</?body[^>]*>', '', html, flags=re.IGNORECASE)
    html = re.sub(r'</?main[^>]*>', '', html, flags=re.IGNORECASE)

    # Ensure all h2/h3 have stable IDs for TOC linking
    heading_counter = {}

    def ensure_heading_id(m):
        tag = m.group(1)
        attrs = m.group(2) or ""
        inner = m.group(3)
        # Already has id (e.g. from nbconvert anchor-link) — keep it
        if re.search(r'\bid\s*=', attrs):
            return m.group(0)
        text = re.sub(r'<[^>]+>', '', inner).strip()
        base = hashlib.md5(text.encode('utf-8')).hexdigest()[:8]
        if base in heading_counter:
            heading_counter[base] += 1
            h_id = f"h-{base}-{heading_counter[base]}"
        else:
            heading_counter[base] = 0
            h_id = f"h-{base}"
        return f'<{tag} id="{h_id}"{attrs}>{inner}</{tag}>'

    html = re.sub(r'<(h[23])([^>]*)>(.*?)</\1>', ensure_heading_id, html, flags=re.DOTALL)

    match = re.search(r'<div[^>]*id=["\']notebook["\'][^>]*>(.*)</div>', html, re.DOTALL)
    if match:
        return match.group(1).strip()
    return html.strip()


def extract_symbols(source):
    """Parse Python source with AST.
    Returns (class_names, function_names, import_aliases).
    """
    try:
        tree = ast.parse(source)
    except SyntaxError:
        return set(), set(), set()

    classes = set()
    functions = set()
    aliases = set()

    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            classes.add(node.name)
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions.add(node.name)
        elif isinstance(node, ast.Import):
            for alias in node.names:
                name = alias.asname or alias.name.split('.')[0]
                aliases.add(name)
        elif isinstance(node, ast.ImportFrom):
            for alias in node.names:
                name = alias.asname or alias.name
                aliases.add(name)

    return classes, functions, aliases


def collect_notebook_symbols(nb):
    """Walk all code cells in a notebook, collect all user-defined symbols."""
    all_classes = set()
    all_functions = set()
    all_aliases = set()
    for cell in nb.cells:
        if cell.cell_type == "code":
            c, f, a = extract_symbols(cell.source)
            all_classes.update(c)
            all_functions.update(f)
            all_aliases.update(a)
    return all_classes, all_functions, all_aliases


def enrich_tokens(html, class_names, function_names, aliases):
    """Post-process Pygments HTML: tag user-defined classes/functions/import aliases."""
    if not class_names and not function_names and not aliases:
        return html

    def replace_token(m):
        raw_classes = m.group(1)
        text = m.group(2)
        cls_list = raw_classes.split()

        # Only act on generic Name tokens (.n) that Pygments could not classify
        if "n" not in cls_list:
            return m.group(0)

        if text in class_names and "user-class" not in cls_list:
            cls_list.append("user-class")
        elif text in function_names and "user-function" not in cls_list:
            cls_list.append("user-function")
        elif text in aliases and "user-alias" not in cls_list:
            cls_list.append("user-alias")

        return f'<span class="{" ".join(cls_list)}">{text}</span>'

    # Match Pygments spans: <span class="...">text</span> where text has no nested tags
    return re.sub(r'<span class="([^"]*)">([^<]+)</span>', replace_token, html)


def convert():
    if OUTPUT_DIR.exists():
        for old_file in OUTPUT_DIR.glob("*.json"):
            old_file.unlink()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    exporter = HTMLExporter(template_name="classic")
    exporter.exclude_input_prompt = True
    exporter.exclude_output_prompt = True

    catalog = []

    for part_dir, part_name, _ in PARTS:
        part_path = NOTEBOOKS_DIR / part_dir
        if not part_path.exists():
            continue

        nbs = sorted(part_path.glob("*.ipynb"))
        for nb_path in nbs:
            if ".ipynb_checkpoints" in str(nb_path):
                continue
            if nb_path.name.startswith("._"):
                continue

            print(f"  Converting {nb_path.name} ...")

            nb = nbformat.read(str(nb_path), as_version=4)
            title = TITLE_MAP.get(nb_path.stem, nb_path.stem)

            # AST analysis: collect all user-defined classes/functions/aliases across cells
            all_classes, all_functions, all_aliases = collect_notebook_symbols(nb)

            html, _ = exporter.from_notebook_node(nb)
            html = enrich_tokens(html, all_classes, all_functions, all_aliases)
            content = clean_html(html)

            nb_data = {
                "id": nb_path.stem,
                "title": title,
                "part": part_name,
                "partDir": part_dir,
                "html": content,
            }

            out_path = OUTPUT_DIR / f"{nb_path.stem}.json"
            out_path.write_text(json.dumps(nb_data, ensure_ascii=False), encoding="utf-8")

            catalog.append({
                "id": nb_path.stem,
                "title": title,
                "part": part_name,
                "partDir": part_dir,
            })

    index_path = OUTPUT_DIR / "index.json"
    index_path.write_text(json.dumps(catalog, ensure_ascii=False), encoding="utf-8")

    print(f"\nDone! {len(catalog)} notebooks converted to {OUTPUT_DIR}")


if __name__ == "__main__":
    convert()
