"""
Thin wrappers to reuse Karpathy's reference implementations shipped in `external/`.

The notebooks in this repo occasionally borrow a minimal nanoGPT forward pass to
compare behavior against our educational re-implementation.

We intentionally do NOT vendor the full nanoGPT training stack into the main
package surface. This module provides a tiny, stable import path:

  from karpathy_models import NanoGPT, NanoGPTConfig

so the notebooks can run without making `external/karpathy/nanoGPT` a proper
Python package.
"""

from __future__ import annotations

import sys
from pathlib import Path


_REPO = Path(__file__).resolve().parent
_NANOGPT_DIR = _REPO / "external" / "karpathy" / "nanoGPT"

if _NANOGPT_DIR.exists():
    sys.path.insert(0, str(_NANOGPT_DIR))

try:
    # nanoGPT defines GPTConfig (dataclass) and GPT (nn.Module).
    from model import GPT as NanoGPT  # type: ignore
    from model import GPTConfig as NanoGPTConfig  # type: ignore
except Exception as exc:  # pragma: no cover
    raise ImportError(
        "Could not import nanoGPT from external/karpathy/nanoGPT. "
        "Make sure the git submodule is present."
    ) from exc

