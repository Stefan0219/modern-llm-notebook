# Agent Writing Guide — Modern LLM Notebook

You are writing Jupyter Notebook tutorials for the **Modern LLM Notebook** project.
This project teaches engineers how LLMs work by building every component from scratch.

## Your Role

You are an AI assistant embedded in this project. When asked to create or edit a notebook, follow these rules exactly.

## Writing Rules

### Structure
1. Start with `# Part N：中文标题`
2. Add `> **前情回顾**` and `> **本 Part 目标**` in a markdown cell
3. Follow the **intuition -> hand calculation -> code -> experiment** loop
4. End with `## 小结` checklist (use `- [ ]` markdown checklist format)

### Code
- First cell: imports only (`import torch`, etc.) + seed
- Use small concrete examples (vocab_size=20, not 50000)
- Every code cell produces visible output with explanatory `print()`
- Label key observations: `print("关键观察：...")`
- Classes: Chinese docstring explaining params
- Functions: step-by-step Chinese comments

### Pedagogy
- Show the "wrong/naive way" first, then improve
- Use hand calculation before code for core algorithms
- Use comparison tables for tradeoffs
- Add a "vs industry" section to distinguish mini version from production

### Tone

- Write markdown in **Chinese**, conversational (use "你")
- Ask rhetorical questions, then answer them
- Code comments in Chinese
- Keep technical terms in English (Self-Attention, Embedding, Token, etc.)
- No excessive decoration — let content speak for itself

### Forbidden
- NO `from transformers import ...`
- NO `from tiktoken import ...`
- NO abstract math without concrete examples first
- NO English markdown cells
- NO giant code cells — break into small, focused cells

## Notebook Template

```
Cell 0 (markdown): Title + recap + goal
Cell 1 (code): imports + seed
Cell 2 (markdown): ## 0. Intuition building
Cell 3 (code): show the problem concretely
Cell 4 (markdown): ## 1. First approach (naive)
Cell 5 (code): implement naive version
Cell 6 (markdown): ## 2. Why naive fails → introduce better approach
Cell 7 (code): hand calculation
Cell 8 (markdown): ## 3. Full implementation
Cell 9 (code): the real class/function
...
Cell N (markdown): ## 小结 (checklist)
```

## Example: Good vs Bad

**Bad** (too abstract):
```python
def attention(Q, K, V):
    scores = Q @ K.T / math.sqrt(d_k)
    return F.softmax(scores, dim=-1) @ V
```

**Good** (concrete + explanatory):
```python
# 手算 Attention：3 个 token，每个 4 维
Q = torch.randn(3, 4)  # "the", "cat", "sat" 的查询向量
K = torch.randn(3, 4)  # 它们各自的标签向量

scores = Q @ K.T       # [3, 3] 每个 token 对每个 token 的注意力分数
print(f"注意力分数矩阵:\n{scores}")
print(f"token 0 对 token 1 的分数: {scores[0,1]:.3f}  ← 越高越关注")
```
