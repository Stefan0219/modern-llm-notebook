#!/usr/bin/env python3
"""
Audit notebook translation quality for `notebooks-en/` against `notebooks/`.

This script is intentionally simple and "mechanical":
- Detect placeholder translation artifacts (common failure mode).
- Verify 1:1 structural mapping (cell count + cell type sequence).
- Verify code *logic* parity by comparing a normalized form of code cells
  (strings/comments removed). This catches accidental logic drift while still
  allowing legitimate translation of comments and user-facing text.

Usage:
  python3 scripts/audit_en_translation.py
"""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path


CN_ROOT = Path("notebooks")
EN_ROOT = Path("notebooks-en")

PLACEHOLDER_PATTERNS = [
    re.compile(r"Teaching note: follow this line", re.I),
    re.compile(
        r"Read the values printed above and connect them to the concept in this cell",
        re.I,
    ),
]


TRIPLE_STR_RE = re.compile(r"('''.*?'''|\"\"\".*?\"\"\")", re.S)
COMMENT_RE = re.compile(r"#.*")
# Rough string-literal matcher (good enough for parity checks; not a parser).
STRING_RE = re.compile(r"(?P<prefix>r?f?b?)(?P<quote>'([^'\\]|\\.)*'|\"([^\"\\]|\\.)*\")")


def _sha(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()[:16]


def normalize_code(src: str) -> str:
    s = src
    s = TRIPLE_STR_RE.sub("''", s)
    s = COMMENT_RE.sub("", s)
    s = STRING_RE.sub("''", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def cell_text(cell) -> str:
    return "".join(cell.get("source", []))


def count_placeholders(nb) -> int:
    text = ""
    for cell in nb.get("cells", []):
        text += cell_text(cell)
        text += "\n"
    return sum(len(p.findall(text)) for p in PLACEHOLDER_PATTERNS)


def audit_pair(rel: Path):
    cn_p = CN_ROOT / rel
    en_p = EN_ROOT / rel

    cn = json.loads(cn_p.read_text(encoding="utf-8"))
    en = json.loads(en_p.read_text(encoding="utf-8"))

    issues: list[str] = []

    if len(cn.get("cells", [])) != len(en.get("cells", [])):
        issues.append(
            f"cell_count_mismatch cn={len(cn.get('cells', []))} en={len(en.get('cells', []))}"
        )

    cn_types = [c.get("cell_type") for c in cn.get("cells", [])]
    en_types = [c.get("cell_type") for c in en.get("cells", [])]
    if cn_types != en_types:
        issues.append("cell_type_sequence_mismatch")

    ph = count_placeholders(en)
    if ph:
        issues.append(f"placeholder_hits={ph}")

    # Code logic parity check (normalized)
    mism = []
    n = min(len(cn.get("cells", [])), len(en.get("cells", [])))
    for i in range(n):
        c1 = cn["cells"][i]
        c2 = en["cells"][i]
        if c1.get("cell_type") != "code" or c2.get("cell_type") != "code":
            continue
        a = normalize_code(cell_text(c1))
        b = normalize_code(cell_text(c2))
        if a != b:
            mism.append((i, _sha(a), _sha(b), len(a), len(b)))
    if mism:
        issues.append(f"code_logic_mismatch_cells={len(mism)}")

    return issues, mism


def main() -> int:
    if not CN_ROOT.exists() or not EN_ROOT.exists():
        raise SystemExit("Expected `notebooks/` and `notebooks-en/` to exist.")

    cn_rels = sorted([p.relative_to(CN_ROOT) for p in CN_ROOT.rglob("*.ipynb")])
    en_rels = sorted([p.relative_to(EN_ROOT) for p in EN_ROOT.rglob("*.ipynb")])

    if set(cn_rels) != set(en_rels):
        missing_en = sorted(set(cn_rels) - set(en_rels))
        missing_cn = sorted(set(en_rels) - set(cn_rels))
        print("ERROR: CN/EN notebook sets differ.")
        if missing_en:
            print("Missing EN notebooks:")
            for p in missing_en:
                print("  -", p)
        if missing_cn:
            print("Missing CN notebooks:")
            for p in missing_cn:
                print("  -", p)
        return 2

    bad = []
    for rel in cn_rels:
        issues, mism = audit_pair(rel)
        if issues:
            bad.append((rel, issues, mism))

    print(f"Pairs checked: {len(cn_rels)}")
    print(f"Pairs with issues: {len(bad)}")
    print()

    # Show the worst offenders first (by placeholder hits, then by code mismatches)
    def score(entry):
        rel, issues, mism = entry
        ph = 0
        cm = 0
        for it in issues:
            if it.startswith("placeholder_hits="):
                ph = int(it.split("=", 1)[1])
            if it.startswith("code_logic_mismatch_cells="):
                cm = int(it.split("=", 1)[1])
        return (ph, cm)

    for rel, issues, mism in sorted(bad, key=score, reverse=True):
        print(rel)
        for it in issues:
            print("  -", it)
        if mism:
            for (idx, sha_a, sha_b, la, lb) in mism[:3]:
                print(f"    code cell[{idx}] norm_sha cn={sha_a} en={sha_b} norm_len cn={la} en={lb}")
            if len(mism) > 3:
                print(f"    ... and {len(mism) - 3} more code cells")
        print()

    return 0 if not bad else 1


if __name__ == "__main__":
    raise SystemExit(main())

