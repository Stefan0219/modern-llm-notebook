#!/usr/bin/env python3
"""Validate the English notebook edition."""

import ast
import json
import re
import sys
from pathlib import Path


REPO = Path(__file__).resolve().parent.parent
ZH_DIR = REPO / "notebooks"
EN_DIR = REPO / "notebooks-en"

def cell_source(cell):
    source = cell.get("source", "")
    if isinstance(source, list):
        return "".join(source)
    return source


def output_text(output):
    if output.get("output_type") == "stream":
        text = output.get("text", "")
        return "".join(text) if isinstance(text, list) else text

    data = output.get("data", {})
    text_chunks = []
    for key in ("text/plain", "text/html"):
        value = data.get(key)
        if value is None:
            continue
        text_chunks.append("".join(value) if isinstance(value, list) else value)
    return "\n".join(text_chunks)


def notebook_errors(path):
    rel = path.relative_to(EN_DIR)
    zh_path = ZH_DIR / rel
    errors = []

    if not zh_path.exists():
        errors.append(f"{rel}: missing Chinese source pair")
        return errors

    en_nb = json.loads(path.read_text(encoding="utf-8"))
    zh_nb = json.loads(zh_path.read_text(encoding="utf-8"))

    if len(en_nb.get("cells", [])) != len(zh_nb.get("cells", [])):
        errors.append(
            f"{rel}: cell count {len(en_nb.get('cells', []))} != "
            f"{len(zh_nb.get('cells', []))}"
        )

    en_types = [cell.get("cell_type") for cell in en_nb.get("cells", [])]
    zh_types = [cell.get("cell_type") for cell in zh_nb.get("cells", [])]
    if en_types != zh_types:
        errors.append(f"{rel}: cell type sequence differs from Chinese source")

    full_source = "\n".join(cell_source(cell) for cell in en_nb.get("cells", []))
    if re.search(r"[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]", full_source):
        errors.append(f"{rel}: CJK characters remain in cell sources")

    for index, cell in enumerate(en_nb.get("cells", [])):
        if cell.get("cell_type") != "code":
            continue
        source = cell_source(cell)
        try:
            ast.parse(source, filename=f"{rel}:cell-{index}")
        except SyntaxError as exc:
            errors.append(f"{rel}: code cell {index} syntax error: {exc.msg}")

        output_source = "\n".join(output_text(output) for output in cell.get("outputs", []))
        if re.search(r"[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]", output_source):
            errors.append(f"{rel}: code cell {index} output still contains CJK characters")

        for output in cell.get("outputs", []):
            if output.get("output_type") == "error":
                errors.append(f"{rel}: code cell {index} has error output")

    return errors


def main():
    paths = sorted(EN_DIR.glob("**/*.ipynb"))
    errors = []
    for path in paths:
        errors.extend(notebook_errors(path))

    if errors:
        print("English notebook check failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"English notebook check passed: {len(paths)} notebooks")
    return 0


if __name__ == "__main__":
    sys.exit(main())
