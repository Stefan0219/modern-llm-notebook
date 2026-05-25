# Roadmap

Modern LLM Notebook is already usable as a bilingual, runnable notebook course.
The next goal is to make it easier to discover, easier to finish, and easier to
contribute to.

## Current Baseline

| Area | Status |
|:---|:---|
| Curriculum | 23 notebooks across foundations, training, inference, frontiers, and production |
| Languages | Chinese and English notebook sets |
| Outputs | English notebooks include executed results |
| Web reader | React / Vite reader with language switching |
| Static site | GitHub Pages deployment workflow |
| Checks | English notebook coverage and web build checks |
| Community intake | Issue templates for bugs, notebook improvements, and topic requests |

## Near-Term Priorities

### 1. First-run experience

- Add a tested Colab badge to every notebook.
- Add a short "how to run this notebook" cell at the top of each chapter.
- Keep CPU-friendly defaults for all core examples.
- Mark heavy or optional cells clearly.

### 2. Exercises and solutions

- Add 2-3 small exercises to each major notebook.
- Use fill-in-the-blank code with `assert` checks.
- Add hints that guide the reader without giving away the answer.
- Keep solutions separate so the main notebook stays readable.

### 3. Visual packaging

- Add course screenshots to `docs/`.
- Add a route-map graphic that shows the full path:
  text -> tokens -> embeddings -> attention -> training -> inference -> evaluation.
- Add a short demo GIF of the web reader and language switching.

### 4. Reliability

- Expand CI checks for notebook structure, syntax, and bilingual coverage.
- Add a scheduled notebook execution job for a representative subset.
- Add broken-link checking for README and notebook launch links.
- Keep generated docs reproducible from source notebooks.

### 5. Community growth

- Label beginner-friendly contribution tasks.
- Create a `docs/contributor-guide.md` for adding or translating notebooks.
- Keep the project scope clear: this is a teaching implementation, not a production framework.

## Possible Future Chapters

These are good candidates only after the existing 23-notebook path stays polished:

- RAG from scratch
- Tool calling and structured outputs from scratch
- Agent loop from scratch
- Quantization intuition: int8, int4, GPTQ, AWQ
- More complete PagedAttention / vLLM-style serving internals
- GRPO and modern RL training variants
- A tiny evaluation harness from scratch

## What Makes a Good Contribution

A strong contribution should improve at least one of these:

- clarity: readers understand the concept faster
- correctness: code and explanations are more accurate
- runnability: examples execute reliably on common machines
- bilingual quality: English and Chinese versions stay complete and aligned
- learning value: exercises, diagrams, or outputs make the concept easier to test
