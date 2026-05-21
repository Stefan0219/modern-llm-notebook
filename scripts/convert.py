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
CODE_PREVIEW_LINES = 28

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
    "02-bpe-tokenizer": "BPE Tokenizer",
    "03-embedding-position": "Embedding 与位置编码",
    "04-transformer-block": "Attention 与 Transformer Block",
    "05-mini-gpt": "实现自己的第一个 GPT",
    "06-architecture-refinements": "架构改进",
    "07-moe": "MoE 混合专家",
    "08-bert-encoder": "BERT 编码器",
    "09-training-loss": "训练与 Loss",
    "10-scaling-laws": "Scaling Laws",
    "11-data-engineering": "数据工程",
    "12-lora": "LoRA",
    "13-midtraining-cpt": "Mid-Training & CPT",
    "14-rlhf-alignment": "RLHF 对齐",
    "15-generation": "生成策略",
    "16-inference-acceleration": "推理加速",
    "17-speculative-decoding": "投机解码",
    "18-long-context": "长上下文",
    "19-cot-thinking": "CoT 思维链",
    "20-vlm": "视觉语言模型",
    "21-evaluation": "模型评测",
    "22-distillation": "知识蒸馏",
    "23-opd": "On-Policy Distillation",
}


def clean_html(html):
    """Extract notebook content, remove scripts/styles, inject heading IDs."""
    html = re.sub(
        r'(?m)^.*UserWarning: Glyph .*missing from font\(s\).*\n(?:^\s+.*\n?)?',
        '',
        html,
    )
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
    html = add_code_folds(html)
    html = add_output_folds(html)

    match = re.search(r'<div[^>]*id=["\']notebook["\'][^>]*>(.*)</div>', html, re.DOTALL)
    if match:
        return match.group(1).strip()
    return html.strip()


def add_code_folds(html):
    """Wrap nbconvert code input blocks in default-closed disclosure elements."""
    input_start = '<div class="input">'
    search_from = 0
    chunks = []
    code_index = 0

    while True:
        start = html.find(input_start, search_from)
        if start == -1:
            chunks.append(html[search_from:])
            break

        chunks.append(html[search_from:start])
        input_end = find_matching_div_end(html, start)
        if input_end == -1:
            chunks.append(html[start:])
            break

        input_html = html[start:input_end]
        if 'class="code-header"' in input_html or 'class="input_area"' not in input_html:
            chunks.append(input_html)
        else:
            line_count, line_label = get_code_line_info(input_html)
            should_preview = line_count > CODE_PREVIEW_LINES
            toggle_id = f"code-expand-{code_index}"
            inner = input_html[len(input_start):-6]
            inner = re.sub(
                r'<div class="input_area">',
                '<div class="input_area code-preview">' if should_preview else '<div class="input_area">',
                inner,
                count=1,
            )
            input_class = 'input code-input-expandable' if should_preview else 'input'
            chunks.append(
                f'<div class="{input_class}">'
                + '<div class="code-header">'
                + '<span class="code-fold-title">代码</span>'
                + f'<span class="code-fold-meta">{line_label}</span>'
                + '</div>'
                + (
                    f'<input class="code-expand-toggle" id="{toggle_id}" type="checkbox" />'
                    if should_preview else ''
                )
                + inner
                + (
                    '<div class="code-expand-label">'
                    + f'<span class="code-expand-more">展开全部 {line_label}</span>'
                    + '<span class="code-expand-less">收起代码</span>'
                    + '</div>'
                    if should_preview else ''
                )
                + '</div>'
            )
            code_index += 1
        search_from = input_end

    return ''.join(chunks)


def add_output_folds(html):
    """Wrap long textual output blocks in independent preview expanders."""
    output_start = '<div class="output">'
    search_from = 0
    chunks = []
    output_index = 0

    while True:
        start = html.find(output_start, search_from)
        if start == -1:
            chunks.append(html[search_from:])
            break

        chunks.append(html[search_from:start])
        output_end = find_matching_div_end(html, start)
        if output_end == -1:
            chunks.append(html[start:])
            break

        output_html = html[start:output_end]
        line_count = count_output_lines(output_html)
        if 'class="output-expandable' in output_html or line_count <= CODE_PREVIEW_LINES:
            chunks.append(output_html)
        else:
            line_label = f"{line_count} 行"
            toggle_id = f"output-expand-{output_index}"
            inner = output_html[len(output_start):-6]
            chunks.append(
                '<div class="output output-expandable output-preview">'
                + f'<input class="output-expand-toggle" id="{toggle_id}" type="checkbox" />'
                + inner
                + '<div class="output-expand-label">'
                + f'<span class="output-expand-more">展开全部输出 {line_label}</span>'
                + '<span class="output-expand-less">收起输出</span>'
                + '</div>'
                + '</div>'
            )
            output_index += 1
        search_from = output_end

    return ''.join(chunks)


def find_matching_div_end(html, div_start):
    """Return the index just after the matching closing </div>."""
    tag_re = re.compile(r'</?div\b[^>]*>', re.IGNORECASE)
    depth = 0
    for match in tag_re.finditer(html, div_start):
        tag = match.group(0)
        if tag.startswith('</'):
            depth -= 1
            if depth == 0:
                return match.end()
        else:
            depth += 1
    return -1


def get_code_line_info(input_html):
    """Count source lines from a rendered code input block."""
    match = re.search(r'<pre>(.*?)</pre>', input_html, flags=re.DOTALL)
    if not match:
        return 0, "空代码块"

    source = re.sub(r'<[^>]+>', '', match.group(1))
    source = source.strip('\n')
    if not source:
        return 0, "空代码块"
    line_count = source.count('\n') + 1
    return line_count, f"{line_count} 行"


def count_output_lines(output_html):
    """Count lines in textual nbconvert output."""
    matches = re.findall(r'<pre[^>]*>(.*?)</pre>', output_html, flags=re.DOTALL)
    if not matches:
        return 0

    count = 0
    for match in matches:
        text = re.sub(r'<[^>]+>', '', match).strip('\n')
        if text:
            count += text.count('\n') + 1
    return count


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
