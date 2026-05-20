# Contributing to Modern LLM Notebook

Thanks for your interest in contributing! This project thrives on community contributions — whether it's fixing a typo, improving an explanation, or adding a new notebook.

## How to Contribute

1. **Fork** the repo and create a branch from `main`.
2. **Make your changes** — keep notebooks self-contained and runnable.
3. **Test** that every cell in the notebook executes without error.
4. **Submit a Pull Request** with a clear description of what you changed and why.

## Notebook Guidelines

- Each notebook must be self-contained (doesn't depend on variables from other notebooks).
- Follow the pedagogical style: **intuition → hand calculation → code implementation → experiment**.
- Use the first markdown cell to explain what the notebook covers and why it matters.
- Keep imports at the top of each notebook.
- Use `np.random.seed(42)` or equivalent for reproducibility.

## What to Contribute

- **Fixes**: typos, broken code, outdated API calls, incorrect explanations.
- **Improvements**: clearer explanations, better visualizations, more efficient code.
- **New notebooks**: emerging topics like Mamba, Jamba, Liquid Foundation Models, etc.
- **Translations**: English translations of Chinese markdown cells.

## Code Style

- Follow PEP 8 for Python code.
- Use type hints where they improve readability.
- Keep cells reasonably short — prefer many small cells over a few giant ones.
- Use `print()` for output that helps the reader understand what's happening.

## Questions?

Open an issue with the `question` label. We're happy to help!
