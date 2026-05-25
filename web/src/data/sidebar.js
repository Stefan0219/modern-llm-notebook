// Sidebar sections with lesson IDs matching actual notebook filenames
export const SIDEBAR_SECTIONS = [
  {
    title: "基础",
    titleEn: "FOUNDATION",
    lessons: [
      { id: "01-tokenizer-basics", num: "01", title: "Tokenizer 基础", section: "foundation" },
      { id: "02-bpe-tokenizer", num: "02", title: "BPE Tokenizer", section: "foundation" },
      { id: "03-embedding-position", num: "03", title: "Embedding 与位置编码", section: "foundation" },
      { id: "04-transformer-block", num: "04", title: "Attention 与 Transformer", section: "foundation" },
      { id: "05-mini-gpt", num: "05", title: "实现自己的第一个 LLM", section: "foundation" },
    ]
  },
  {
    title: "训练",
    titleEn: "TRAINING",
    lessons: [
      { id: "06-architecture-refinements", num: "06", title: "架构改进", section: "training" },
      { id: "07-moe", num: "07", title: "MoE 混合专家", section: "training" },
      { id: "08-bert-encoder", num: "08", title: "BERT 编码器", section: "training" },
      { id: "09-training-loss", num: "09", title: "训练与 Loss", section: "training" },
      { id: "10-scaling-laws", num: "10", title: "Scaling Laws", section: "training" },
      { id: "11-data-engineering", num: "11", title: "数据工程", section: "training" },
      { id: "12-lora", num: "12", title: "LoRA", section: "training" },
      { id: "13-midtraining-cpt", num: "13", title: "继续预训练", section: "training" },
      { id: "14-rlhf-alignment", num: "14", title: "RLHF 对齐", section: "training" },
    ]
  },
  {
    title: "推理",
    titleEn: "INFERENCE",
    lessons: [
      { id: "15-generation", num: "15", title: "生成策略", section: "inference" },
      { id: "16-inference-acceleration", num: "16", title: "推理加速", section: "inference" },
      { id: "17-speculative-decoding", num: "17", title: "投机解码", section: "inference" },
    ]
  },
  {
    title: "前沿",
    titleEn: "FRONTIERS",
    lessons: [
      { id: "18-long-context", num: "18", title: "长上下文", section: "frontiers" },
      { id: "19-cot-thinking", num: "19", title: "CoT 思维链", section: "frontiers" },
      { id: "20-vlm", num: "20", title: "VLM 视觉语言模型", section: "frontiers" },
    ]
  },
  {
    title: "评测与部署",
    titleEn: "EVAL & DEPLOY",
    lessons: [
      { id: "21-evaluation", num: "21", title: "模型评测", section: "production" },
      { id: "22-distillation", num: "22", title: "知识蒸馏", section: "production" },
      { id: "23-opd", num: "23", title: "On-Policy Distillation", section: "production" },
    ]
  },
]

export const PATH_STEPS = [
  { num: "01", title: "基础", titleEn: "Foundation", desc: "理解 LLM 的基本概念与核心组件", descEn: "Core concepts and building blocks of LLMs", section: "foundation" },
  { num: "02", title: "训练", titleEn: "Training", desc: "深入训练系统、对齐与优化方法", descEn: "Training systems, alignment, and optimization", section: "training" },
  { num: "03", title: "推理", titleEn: "Inference", desc: "生成策略、推理加速与投机解码", descEn: "Decoding strategies, acceleration, and speculative decoding", section: "inference" },
  { num: "04", title: "前沿", titleEn: "Frontiers", desc: "长上下文、CoT 思维链与 VLM", descEn: "Long context, chain-of-thought, and VLM", section: "frontiers" },
  { num: "05", title: "评测与部署", titleEn: "Eval & Deploy", desc: "模型评测、蒸馏与生产部署", descEn: "Evaluation, distillation, and production deployment", section: "production" },
]

export const RUNNABLE_NOTEBOOKS = [
  { id: "nb-1", lessonId: "01-tokenizer-basics", title: "Tokenizer 基础", titleEn: "Tokenizer Basics", desc: "了解分词原理与实现", descEn: "Understand tokenization principles", section: "foundation", duration: 12 },
  { id: "nb-2", lessonId: "04-transformer-block", title: "Attention 与 Transformer", titleEn: "Attention & Transformer", desc: "从零实现注意力机制", descEn: "Build attention from scratch", section: "foundation", duration: 18 },
  { id: "nb-3", lessonId: "07-moe", title: "MoE 混合专家", titleEn: "Mixture of Experts", desc: "稀疏激活与专家路由", descEn: "Sparse activation and expert routing", section: "training", duration: 20 },
  { id: "nb-4", lessonId: "09-training-loss", title: "训练与 Loss", titleEn: "Training & Loss", desc: "理解训练循环与优化", descEn: "Training loops and optimization", section: "training", duration: 25 },
  { id: "nb-5", lessonId: "05-mini-gpt", title: "实现自己的第一个 LLM", titleEn: "Build Your First LLM", desc: "从零搭建 Mini-GPT", descEn: "Build Mini-GPT from scratch", section: "foundation", duration: 45 },
  { id: "nb-6", lessonId: "12-lora", title: "LoRA", titleEn: "LoRA", desc: "参数高效微调方法", descEn: "Parameter-efficient fine-tuning", section: "training", duration: 20 },
  { id: "nb-7", lessonId: "15-generation", title: "生成策略", titleEn: "Generation Strategies", desc: "贪心、采样与束搜索", descEn: "Greedy, sampling, and beam search", section: "inference", duration: 18 },
  { id: "nb-8", lessonId: "19-cot-thinking", title: "CoT 思维链", titleEn: "Chain-of-Thought", desc: "链式推理的机制", descEn: "Mechanics of chain reasoning", section: "frontiers", duration: 16 },
  { id: "nb-9", lessonId: "14-rlhf-alignment", title: "RLHF 对齐", titleEn: "RLHF Alignment", desc: "人类反馈强化学习", descEn: "Reinforcement learning from human feedback", section: "training", duration: 36 },
  { id: "nb-10", lessonId: "22-distillation", title: "知识蒸馏", titleEn: "Knowledge Distillation", desc: "模型压缩与传递", descEn: "Model compression and knowledge transfer", section: "production", duration: 20 },
]

// Map lesson ID to the first lesson ID of each section (for path step clicks)
export const PATH_STEP_LESSON_IDS = [
  "01-tokenizer-basics",
  "06-architecture-refinements",
  "15-generation",
  "18-long-context",
  "21-evaluation",
]
