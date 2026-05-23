#!/usr/bin/env python3
"""Create the English notebook set from the Chinese source notebooks.

The English edition keeps the same executable code structure, clears stale
Chinese outputs, and replaces reader-facing prose with English teaching notes.
"""

import io
import json
import re
import tokenize
from pathlib import Path


REPO = Path(__file__).resolve().parent.parent
SOURCE_DIR = REPO / "notebooks"
TARGET_DIR = REPO / "notebooks-en"

PARTS = {
    "part1-foundation": "Foundation",
    "part2-training": "Training Systems",
    "part3-inference": "Inference",
    "part4-frontiers": "Frontiers",
    "part5-production": "Evaluation & Deployment",
}

PHRASE_MAP = {
    "助手": "assistant",
    "用户": "user",
    "老师": "teacher",
    "我": "I",
    "你": "you",
    "是": "is",
    "有": "has",
    "喜欢": "like",
    "讨厌": "dislike",
    "知道": "know",
    "不知道": "do not know",
    "可以": "can",
    "好": "good",
    "坏": "bad",
    "不错": "nice",
    "谢谢": "thanks",
    "再见": "goodbye",
    "你好": "hello",
    "天气": "weather",
    "今天": "today",
    "星期": "weekday",
    "英语": "English",
    "数学": "math",
    "编程": "programming",
    "代码": "code",
    "答案": "answer",
    "动物": "animal",
    "动作": "action",
    "介词": "preposition",
    "冠词": "article",
    "物品": "object",
    "特殊": "special",
    "保守混合": "conservative mix",
    "均衡混合": "balanced mix",
    "激进混合": "aggressive mix",
    "不切换": "no switch",
    "巴黎": "Paris",
    "伦敦": "London",
    "柏林": "Berlin",
    "罗马": "Rome",
    "马德里": "Madrid",
    "苹果": "apple",
    "橘子": "orange",
    "吃": "eat",
    "推理": "reasoning",
    "过程": "process",
    "小明": "Ming",
    "小红": "Hong",
    "小刚": "Gang",
    "原文": "Original text",
    "结果": "Result",
    "输入": "Input",
    "输出": "Output",
    "模型": "Model",
    "说明": "Note",
    "正确": "correct",
    "错误": "wrong",
}

SUBSTRING_MAP = [
    ("词表大小", "Vocabulary size"),
    ("词表内容", "Vocabulary items"),
    ("Token 数量", "Number of tokens"),
    ("训练数据形状", "Training data shape"),
    ("训练完成", "Training finished"),
    ("定义完成", "Definition complete"),
    ("生成结果", "Generated result"),
    ("期望输出", "Expected output"),
    ("关键区别", "Key difference"),
    ("关键优势", "Key advantages"),
    ("关键问题", "Key problem"),
    ("关键洞察", "Key insight"),
    ("对比分析", "Comparison"),
    ("投票环节", "Voting step"),
    ("新增符号", "New symbols"),
    ("训练样本", "Training sample"),
    ("训练 ID", "Training IDs"),
    ("概率分布", "Probability distribution"),
    ("执行顺序", "Execution order"),
    ("完整实现", "Complete implementation"),
    ("策略 A", "Strategy A"),
    ("策略 B", "Strategy B"),
    ("策略 C", "Strategy C"),
    ("总结", "Summary"),
    ("实际训练中怎么选", "How to choose in real training"),
    ("未安装", "Not installed"),
    ("跳过", "skip"),
    ("安装", "install"),
]

LESSONS = {
    "01-tokenizer-basics": {
        "title": "Tokenizer Basics: How Text Becomes Numbers",
        "previous": "This is the entry point, so we begin from the first question: why can a model not read raw text directly?",
        "goal": "Understand what Token, Tokenizer, vocab, encode, decode, special tokens, padding, and attention masks mean.",
        "sections": [
            ("Build the intuition", "A Tokenizer is the translator in front of the model. It turns text into token IDs, and it can turn token IDs back into text. The important idea is simple: neural networks work with numbers, so text must first become a sequence of integer IDs."),
            ("Try simple choices", "A character-level tokenizer is stable because every character can be represented, but it creates long sequences. A word-level tokenizer creates shorter sequences, but it breaks when it sees a word outside the vocabulary. Subword tokenization is the compromise: common pieces stay together, rare words are split into smaller pieces."),
            ("Hand-check the algorithm", "For a sentence such as 'the cat', character tokenization gives ['t', 'h', 'e', ' ', 'c', 'a', 't'], while word tokenization gives ['the', 'cat']. The numbers are just IDs, like name tags; ID 12 is not 'larger in meaning' than ID 3."),
            ("Exercises", "The exercises ask you to fill in encode, add BOS/EOS special tokens, and build padding plus an attention mask. Ask an AI for hints if you get stuck, but do not ask it to finish the blanks for you."),
        ],
        "checklist": ["Token means the smallest text unit a model processes.", "Tokenizer.encode maps text to IDs; decode maps IDs back to text.", "Character-level is robust but long; word-level is short but brittle; subword tokenization balances both."],
    },
    "02-bpe-tokenizer": {
        "title": "BPE Tokenizer: Growing a Vocabulary From Statistics",
        "previous": "Part 01 showed why raw text must become token IDs, and why character-level and word-level tokenization both have trade-offs.",
        "goal": "Implement Byte Pair Encoding (BPE) by counting frequent neighboring pairs and merging them step by step.",
        "sections": [
            ("Why BPE exists", "BPE solves the tension between tiny character vocabularies and huge word vocabularies. It starts with small pieces and lets frequent patterns become larger tokens."),
            ("Core action", "The whole algorithm repeats one move: count adjacent token pairs, find the most frequent pair, merge it into a new token, and record that merge rule."),
            ("Manual example", "If ('l', 'o') appears most often, BPE creates 'lo'. Later ('lo', 'w') might become 'low'. The vocabulary is not magic; it grows from repeated statistics."),
            ("Industrial difference", "Real tokenizers use byte-level handling, normalization rules, special tokens, and large corpora. This notebook keeps the algorithm small so every merge is visible."),
        ],
        "checklist": ["BPE begins from small units and repeatedly merges frequent adjacent pairs.", "Merge rules define how encoding works later.", "Subword tokenization avoids most OOV failures while keeping sequences shorter than character-level tokenization."],
    },
    "03-embedding-position": {
        "title": "Embeddings and Position: Turning IDs Into Vectors",
        "previous": "Parts 01-02 turned text into token IDs. Now the IDs need to become numbers a neural network can compute with.",
        "goal": "Build Token Embedding and Position Encoding, then observe why both token identity and token order matter.",
        "sections": [
            ("Why IDs are not enough", "A token ID is only a lookup number. The model needs a vector, because vectors can be added, multiplied, compared, and learned."),
            ("Token Embedding", "An Embedding table is like a dictionary from token ID to vector. If token 5 means 'cat', row 5 of the table is the vector the model receives for that token."),
            ("Position information", "Without position, 'dog bites man' and 'man bites dog' contain the same tokens. Position Encoding gives the model a way to know where each token sits."),
            ("Experiment", "The code visualizes and compares token vectors and position vectors so you can see that the final input representation is token meaning plus location."),
        ],
        "checklist": ["Embedding maps token IDs to learnable vectors.", "Position Encoding tells the model token order.", "The model input is usually token embedding plus position information."],
    },
    "04-transformer-block": {
        "title": "Attention and Transformer Block",
        "previous": "Part 03 built token and position vectors. Now each token needs to read information from other tokens.",
        "goal": "Understand Self-Attention, Multi-Head Attention, residual connections, LayerNorm, and the Transformer Block.",
        "sections": [
            ("The problem Attention solves", "A token cannot be understood alone. In 'the bank by the river', the word 'bank' needs surrounding words to decide its meaning."),
            ("Q, K, V intuition", "Query asks 'what am I looking for?', Key says 'what do I contain?', and Value is the information passed forward. Attention scores decide how much each token reads from the others."),
            ("Manual calculation", "The notebook uses tiny matrices so you can compute score = QK^T, apply softmax, and multiply by V before trusting the code."),
            ("Block structure", "A Transformer Block wraps Attention with residual connections, normalization, and a feed-forward network. Each part stabilizes or enriches the signal."),
        ],
        "checklist": ["Self-Attention lets each token read other tokens.", "Multi-Head Attention reads several relationship patterns at once.", "A Transformer Block combines attention, feed-forward layers, residual paths, and normalization."],
    },
    "05-mini-gpt": {
        "title": "Build Your First Mini-GPT",
        "previous": "Parts 01-04 built tokenization, embeddings, attention, and Transformer blocks.",
        "goal": "Assemble a small decoder-only GPT and understand how logits predict the next token.",
        "sections": [
            ("What GPT does", "GPT is an autoregressive model: given previous tokens, it predicts the next token. Repeating that prediction produces text."),
            ("Architecture path", "Token IDs go through token embedding, position embedding, several Transformer blocks, final normalization, and a language-model head."),
            ("Causal mask", "During training, token i must not peek at future tokens. The causal mask enforces the same rule the model will face at generation time."),
            ("Karpathy comparison", "The notebook points out how the small implementation lines up with minGPT/nanoGPT style code while staying readable."),
        ],
        "checklist": ["Decoder-only GPT predicts the next token.", "Causal masking prevents future-token leakage.", "The lm_head maps hidden states to vocabulary logits."],
    },
    "06-architecture-refinements": {
        "title": "Architecture Refinements: RMSNorm, SwiGLU, RoPE, Pre-Norm",
        "previous": "Mini-GPT gave us a working decoder. Modern models refine the same skeleton for stability and efficiency.",
        "goal": "Implement common LLaMA-style refinements and see what problem each one solves.",
        "sections": [
            ("Why refine the block", "A basic Transformer works, but deep training needs stable normalization, expressive feed-forward layers, and position handling that extrapolates better."),
            ("RMSNorm", "RMSNorm normalizes by root mean square. It keeps the scale controlled with less machinery than LayerNorm."),
            ("SwiGLU", "SwiGLU gives the feed-forward layer a learned gate, so the model can choose which features pass through."),
            ("RoPE and Pre-Norm", "RoPE rotates query/key vectors to encode relative position. Pre-Norm places normalization before sublayers to improve training stability."),
        ],
        "checklist": ["RMSNorm controls scale.", "SwiGLU adds a gate to the feed-forward path.", "RoPE injects position into attention through rotations."],
    },
    "07-moe": {
        "title": "Mixture of Experts: Routing Tokens to Specialists",
        "previous": "Part 06 improved the dense Transformer block. MoE changes the feed-forward part so not every token uses the same expert.",
        "goal": "Implement a small MoE layer, top-k routing, and load-balancing intuition.",
        "sections": [
            ("Why MoE exists", "Dense models use all parameters for every token. MoE increases total parameters while activating only a few experts per token."),
            ("Router intuition", "A router scores experts for each token, chooses the top experts, and combines their outputs with gate weights."),
            ("Load balance", "If one expert receives all tokens, the system wastes capacity. Auxiliary losses encourage more even expert usage."),
            ("Trade-off", "MoE can increase model capacity efficiently, but it makes training, communication, batching, and serving more complex."),
        ],
        "checklist": ["The router chooses experts per token.", "Only selected experts run, so active compute stays smaller than total parameters.", "Load balancing prevents expert collapse."],
    },
    "08-bert-encoder": {
        "title": "BERT Encoder: Bidirectional Understanding",
        "previous": "GPT predicts the next token with a causal mask. BERT uses a different mask so tokens can read both directions.",
        "goal": "Build a small encoder-only model and understand Masked Language Modeling (MLM).",
        "sections": [
            ("Decoder vs encoder", "GPT is good at continuation because it reads left to right. BERT is good at understanding because every token can attend to both left and right context."),
            ("MLM task", "Instead of predicting the next token, BERT hides some tokens and asks the model to recover them from surrounding context."),
            ("Classification head", "Encoder representations can feed tasks such as classification because they summarize the whole input with bidirectional context."),
            ("Key distinction", "BERT is not a text generator in the same way GPT is; it is mainly an encoder for understanding tasks."),
        ],
        "checklist": ["BERT uses bidirectional attention.", "MLM trains the model to recover masked tokens.", "Encoder outputs are useful for understanding and classification tasks."],
    },
    "09-training-loss": {
        "title": "Training and Loss: How Prediction Becomes Learning",
        "previous": "Earlier parts built model components. Now we need to make parameters improve from data.",
        "goal": "Hand-calculate Cross-Entropy, build a training loop, and inspect loss, gradients, batching, and accumulation.",
        "sections": [
            ("Why loss exists", "A model outputs logits, not a lesson learned. Loss turns 'how wrong was the prediction?' into a number that gradient descent can reduce."),
            ("Cross-Entropy by hand", "Softmax turns logits into probabilities. Cross-Entropy punishes the model when it gives low probability to the correct token."),
            ("Training loop", "A basic loop does forward pass, loss calculation, backward pass, optimizer step, and metric logging."),
            ("Practical details", "Batching, gradient accumulation, learning rate, and data quality all shape whether training is stable and useful."),
        ],
        "checklist": ["Cross-Entropy rewards high probability on the correct next token.", "Backpropagation computes gradients.", "The optimizer updates parameters to reduce loss over many batches."],
    },
    "10-scaling-laws": {
        "title": "Scaling Laws: Parameters, Data, and Compute",
        "previous": "Part 09 showed how a model learns from loss. Scaling laws ask how model size, data size, and compute interact.",
        "goal": "Estimate compute, compare Kaplan and Chinchilla intuitions, and understand why more parameters are not always the best use of budget.",
        "sections": [
            ("The resource triangle", "Training quality depends on parameters, tokens, and compute. If one side is badly chosen, extra budget can be wasted."),
            ("Compute estimate", "A common rough estimate is C about 6 times parameters times tokens. It is not exact, but it gives useful scale intuition."),
            ("Chinchilla intuition", "For a fixed compute budget, many older models were too large and trained on too little data. More data can beat simply adding parameters."),
            ("Takeaway", "Scaling laws are planning tools, not magic laws. They help ask whether the next dollar should buy parameters, data, or training time."),
        ],
        "checklist": ["Training compute depends heavily on parameters and token count.", "Compute-optimal training balances model size and data.", "Scaling laws guide planning but do not replace experiments."],
    },
    "11-data-engineering": {
        "title": "Data Engineering: Cleaning the Fuel for Training",
        "previous": "Scaling laws showed data volume matters. This part asks what makes data usable.",
        "goal": "Understand extraction, language filtering, quality filtering, deduplication, and data mixing.",
        "sections": [
            ("Why data engineering matters", "A model learns patterns from its corpus. Messy, duplicated, or low-quality text teaches messy behavior."),
            ("Pipeline steps", "A typical pipeline extracts text, filters languages, removes low-quality documents, deduplicates near-copies, and mixes sources deliberately."),
            ("Quality filters", "Simple rules can catch extreme length, symbol noise, repeated text, or strange word statistics. Model-based scores can add another signal."),
            ("Deduplication", "Exact hashing catches identical documents; MinHash-style methods catch near duplicates."),
        ],
        "checklist": ["Data quality affects model behavior.", "Filtering and deduplication are core training infrastructure.", "Data mixing controls what the model sees often."],
    },
    "12-lora": {
        "title": "LoRA: Low-Rank Adaptation",
        "previous": "We have a trainable model, but full fine-tuning can be expensive.",
        "goal": "Implement LoRA, understand low-rank updates, and see how adapters can be merged for inference.",
        "sections": [
            ("Why LoRA exists", "A pretrained model already stores broad knowledge. For a new task, we often only need a small update rather than changing every weight."),
            ("Low-rank idea", "Instead of learning a full weight update matrix, LoRA learns two smaller matrices A and B whose product approximates the update."),
            ("Where to apply it", "LoRA is commonly attached to attention projections or other linear layers where small targeted changes are useful."),
            ("Merge for inference", "After training, the low-rank update can be folded into the base weight so inference stays simple."),
        ],
        "checklist": ["LoRA freezes the base weight and learns a low-rank update.", "A and B are much smaller than a full update matrix.", "LoRA can often be merged into the base model for inference."],
    },
    "13-midtraining-cpt": {
        "title": "Mid-Training and Continued Pretraining",
        "previous": "LoRA adapts a model with small trainable modules. Continued pretraining adapts by training on more domain text.",
        "goal": "Understand CPT, domain adaptation, data mixing, and how loss curves reveal learning or forgetting.",
        "sections": [
            ("Why continue pretraining", "A general model may not know a specific domain well. Continued pretraining exposes it to domain text before downstream tuning."),
            ("Data mix", "Pure domain data can improve specialization but may hurt general ability. Mixing general and domain data reduces forgetting."),
            ("Observation", "Loss curves tell whether the model is adapting, overfitting, or forgetting. The point is not just to train longer, but to train on the right mixture."),
            ("CPT vs fine-tuning", "CPT teaches language/domain distribution; instruction tuning teaches response behavior."),
        ],
        "checklist": ["CPT adapts a pretrained model to a domain.", "Data mixing controls specialization versus forgetting.", "Loss curves are diagnostic signals, not just scores."],
    },
    "14-rlhf-alignment": {
        "title": "RLHF Alignment: Turning Preferences Into Objectives",
        "previous": "Training predicts tokens, but useful assistants must optimize for helpful behavior.",
        "goal": "Understand Reward Models, Bradley-Terry preference loss, PPO clipping, KL penalty, and DPO intuition.",
        "sections": [
            ("The mismatch", "Pretraining teaches continuation. Users want helpful, honest, safe answers. Alignment methods turn preference data into training signals."),
            ("Reward model", "A reward model learns to score which response humans prefer. Pairwise comparisons become a supervised learning problem."),
            ("PPO and KL", "PPO updates the policy toward higher reward while clipping changes. KL penalty keeps the new model close to the reference model."),
            ("DPO", "DPO removes the explicit reward-model step and directly optimizes chosen responses over rejected responses."),
        ],
        "checklist": ["RLHF uses preference data.", "Reward models score responses.", "PPO and DPO are two ways to move a model toward preferred behavior."],
    },
    "15-generation": {
        "title": "Generation: From Logits to Text",
        "previous": "Mini-GPT outputs logits. Generation decides how to choose the next token from those logits.",
        "goal": "Compare greedy decoding, temperature sampling, top-k, top-p, and beam search.",
        "sections": [
            ("Why decoding matters", "The same model can sound deterministic, creative, repetitive, or diverse depending on the decoding rule."),
            ("Greedy and temperature", "Greedy picks the highest-probability token. Temperature changes how sharp or flat the probability distribution is."),
            ("Top-k and top-p", "Top-k keeps a fixed number of candidates. Top-p keeps enough candidates to cover a probability mass."),
            ("Beam search", "Beam search keeps several candidate sequences, which can help structured tasks but may reduce open-ended diversity."),
        ],
        "checklist": ["Decoding turns logits into token choices.", "Temperature controls randomness.", "Top-k, top-p, and beam search trade diversity, quality, and compute."],
    },
    "16-inference-acceleration": {
        "title": "Inference Acceleration: KV Cache and Serving Constraints",
        "previous": "Generation chooses tokens one by one. Now we ask why that loop is slow and how systems speed it up.",
        "goal": "Understand KV Cache, attention cost, batching, quantization, FlashAttention, and PagedAttention intuition.",
        "sections": [
            ("Why generation is slow", "Autoregressive models generate one token at a time. Recomputing all previous keys and values every step wastes work."),
            ("KV Cache", "The cache stores past keys and values so each new token only computes the new pieces it needs."),
            ("Memory pressure", "KV Cache saves compute but consumes memory. Serving systems must manage batch size, context length, and throughput."),
            ("System ideas", "FlashAttention improves attention IO efficiency; PagedAttention manages KV memory more flexibly for many requests."),
        ],
        "checklist": ["KV Cache avoids recomputing past keys and values.", "Inference speed is limited by both compute and memory.", "Serving systems optimize batching, memory layout, and attention kernels."],
    },
    "17-speculative-decoding": {
        "title": "Speculative Decoding: Let a Small Model Help a Large Model",
        "previous": "KV Cache speeds a single model. Speculative decoding uses a second model to reduce expensive target-model steps.",
        "goal": "Implement draft-then-verify acceptance and understand why the output distribution can remain correct.",
        "sections": [
            ("Core idea", "A small draft model proposes several tokens quickly. The large target model verifies them in parallel."),
            ("Acceptance", "If the target model agrees enough with the draft token, we accept it. If not, we correct and continue."),
            ("Why it helps", "The target model still guards quality, but one target forward pass can validate multiple proposed tokens."),
            ("Limits", "Speedup depends on draft quality, target cost, batch shape, and implementation overhead."),
        ],
        "checklist": ["Draft model proposes tokens.", "Target model verifies them.", "Accepted drafts reduce the number of expensive target-model steps."],
    },
    "18-long-context": {
        "title": "Long Context: Extending the Window",
        "previous": "Basic inference assumes a limited context window. Modern applications often need much longer inputs.",
        "goal": "Study RoPE frequency behavior, position interpolation, NTK-aware scaling, YaRN intuition, and needle-in-haystack tests.",
        "sections": [
            ("Why long context is hard", "Attention cost grows with sequence length, and position encodings may not extrapolate beyond training lengths."),
            ("RoPE lens", "RoPE represents positions through rotations at different frequencies. Long-context tricks adjust how those frequencies behave."),
            ("Scaling methods", "Position interpolation compresses positions; NTK-aware and YaRN-style methods adjust frequencies more carefully."),
            ("Evaluation", "Needle-in-haystack tests ask whether a model can retrieve a small fact buried in a long context."),
        ],
        "checklist": ["Long context stresses both compute and position encoding.", "RoPE scaling changes how positions are represented.", "Retrieval tests reveal whether long context is actually usable."],
    },
    "19-cot-thinking": {
        "title": "CoT and Thinking: Reasoning Traces as Training Signals",
        "previous": "The model can generate text. Now we look at why intermediate reasoning traces can change answers.",
        "goal": "Understand Chain-of-Thought, Self-Consistency, thinking tags, cold-start data, and reward design.",
        "sections": [
            ("Why reasoning traces help", "Some tasks need intermediate steps. A visible chain gives the model room to decompose the problem instead of jumping straight to an answer."),
            ("Self-Consistency", "Instead of trusting one reasoning path, sample multiple paths and choose the answer that appears most consistently."),
            ("Thinking tags", "Tags such as <think> are control markers. The model does not magically understand the word; training teaches how to use the region."),
            ("Training data", "Cold-start traces, reward functions, and language consistency all affect whether reasoning behavior is useful or messy."),
        ],
        "checklist": ["CoT gives the model intermediate reasoning space.", "Self-Consistency uses multiple sampled paths.", "Thinking behavior depends on data, rewards, and formatting."],
    },
    "20-vlm": {
        "title": "Vision-Language Models: Connecting Images to Text",
        "previous": "Text-only models read token sequences. VLMs add visual information to the same language-model pipeline.",
        "goal": "Understand patch embeddings, vision encoders, projectors, Cross-Attention, and Flamingo-style gated fusion.",
        "sections": [
            ("Why VLMs need a bridge", "Images are arrays of pixels; language models expect token-like vectors. A VLM must convert visual signals into representations the LLM can use."),
            ("Patch Embedding", "An image can be split into patches, and each patch can become a vector, similar to a visual token."),
            ("Projector and fusion", "A projector maps vision features into the language model dimension. Cross-Attention or gated blocks let text tokens read image features."),
            ("Training strategy", "Many VLMs freeze some parts at first so visual ability grows without immediately destroying language ability."),
        ],
        "checklist": ["Images become patch or vision features.", "A projector aligns visual features with the LLM hidden size.", "Cross-Attention lets language tokens read visual information."],
    },
    "21-evaluation": {
        "title": "Evaluation: Measuring Model Behavior",
        "previous": "Once a model can train and generate, we need evidence that it is actually better.",
        "goal": "Build small evaluation examples and understand accuracy, LLM-as-Judge, win rates, radar charts, and RAGAS-style metrics.",
        "sections": [
            ("Why evaluation is hard", "A single score rarely captures all behavior. Models can be good at one task and weak at another."),
            ("Benchmark types", "Multiple-choice tasks, open-ended judge tasks, safety checks, multilingual tests, and retrieval tasks measure different skills."),
            ("Pairwise comparison", "Win-rate matrices compare model outputs directly. This is often more informative than isolated scores."),
            ("RAG evaluation", "RAGAS-style metrics split the question into faithfulness, relevance, and context usage."),
        ],
        "checklist": ["Evaluation must match the behavior you care about.", "LLM-as-Judge needs careful prompts and calibration.", "Pairwise and composite metrics reveal different model trade-offs."],
    },
    "22-distillation": {
        "title": "Distillation: Moving Knowledge Into a Smaller Model",
        "previous": "Evaluation tells us what a model can do. Distillation asks how to transfer ability into a cheaper model.",
        "goal": "Understand hard labels, soft labels, temperature, logit distillation, data distillation, and feature distillation.",
        "sections": [
            ("Why distill", "Large models are expensive to serve. A smaller student can learn from a larger teacher to reduce cost or latency."),
            ("Soft labels", "Teacher probabilities contain more information than a single correct class. Temperature reveals these softer relationships."),
            ("Logit distillation", "The student learns to match the teacher's output distribution, not just the final answer."),
            ("Other forms", "Data distillation uses teacher-generated examples; feature distillation matches internal representations."),
        ],
        "checklist": ["Distillation trains a student from a teacher.", "Soft labels carry dark knowledge.", "Temperature changes how much distribution detail the student sees."],
    },
    "23-opd": {
        "title": "On-Policy Distillation",
        "previous": "Standard distillation often trains on teacher or dataset distributions. OPD focuses on the student's own generated distribution.",
        "goal": "Understand exposure bias, Forward/Reverse KL, k1/k2/k3 estimators, OPSD, and the paper taxonomy.",
        "sections": [
            ("Exposure bias", "A student may train on one distribution but generate from another. Errors compound when the model must continue from its own imperfect outputs."),
            ("On-policy idea", "On-policy distillation samples from the student's current behavior and teaches on the states it actually visits."),
            ("KL directions", "Forward KL and Reverse KL encourage different behavior: coverage versus mode-seeking. Estimators approximate these objectives from samples."),
            ("Taxonomy", "The notebook organizes recent OPD-related papers by objective, sampling strategy, and correction method."),
        ],
        "checklist": ["OPD trains on the student's own generated states.", "KL direction changes what behavior is encouraged.", "Estimator choice matters for stability and bias."],
    },
}


def has_cjk(text):
    return bool(re.search(r"[\u4e00-\u9fff]", text))


def lesson_markdown(stem, part_dir):
    lesson = LESSONS[stem]
    lines = [
        f"# 🧱 Part {stem[:2]}: {lesson['title']}",
        "",
        f"> **Previous context**: {lesson['previous']}",
        f"> **Goal for this part**: {lesson['goal']}",
        "",
        "Today we are solving one concrete confusion: what is the hidden mechanism behind this part of an LLM, and how can we rebuild it with small numbers before trusting a library?",
        "",
    ]
    for index, (title, body) in enumerate(lesson["sections"]):
        lines.extend([f"## {index}. {title}", "", body, ""])
    lines.extend([
        "## How to use the code cells",
        "",
        "Run the cells in order. The code is intentionally direct and small: each cell should expose one idea, print the key observation, and let you change a number to see what moves.",
        "",
        "## Exercises",
        "",
        "When a cell contains a TODO placeholder, fill it yourself and use the `assert` checks as feedback. You can ask an AI for hints, step-by-step reasoning, or a direction check, but avoid asking it to complete the exercise outright.",
        "",
        "## Summary Checklist",
        "",
    ])
    lines.extend([f"- [ ] {item}" for item in lesson["checklist"]])
    lines.extend([
        "",
        f"Next, continue through the code cells for the {PARTS[part_dir]} part and inspect the printed observations.",
        "",
    ])
    return "\n".join(lines)


def english_string_for(original, index):
    if original in PHRASE_MAP:
        return PHRASE_MAP[original]

    translated = original
    for zh, en in sorted(PHRASE_MAP.items(), key=lambda item: len(item[0]), reverse=True):
        translated = translated.replace(zh, en)
    for zh, en in SUBSTRING_MAP:
        translated = translated.replace(zh, en)
    if translated != original and not has_cjk(translated):
        return translated

    text = original.lower()
    if "todo" in text or "在这里" in original:
        return "TODO: replace this placeholder with your code"
    if "assert" in text or "请先" in original:
        return "Please replace the placeholder before running the assertion."
    if "真实 tokenizer" in original:
        return "Real tokenizer: GPT-2 byte-level BPE"
    if "未能加载" in original:
        return "Could not load tiktoken. Install tiktoken to run the real tokenizer demo."
    if "原因" in original:
        return "Reason"
    if "逐个 token" in original:
        return "Inspect each token:"
    if "token 数" in original:
        return "Number of tokens"
    if "语料库共" in original:
        return "Corpus size"
    if "总字符数" in original:
        return "Total characters"
    if "总词数" in original:
        return "Total words (split by spaces)"
    if "训练完成" in original:
        return "Tokenizer training finished"
    if "编码/解码测试" in original:
        return "Encode/decode test"
    if "OOV" in original:
        return "OOV (Out Of Vocabulary) demo"
    if "当前词表" in original:
        return "Current vocabulary"
    if "尝试编码" in original:
        return "Trying to encode"
    if "不在词表" in original:
        return "not in vocabulary"
    if "词表里有" in original:
        return "in vocabulary"
    if "关键观察" in original:
        return "Key observation: inspect the values above and connect them to the idea in this cell."
    if "解释" in original:
        return "Explanation: the printed values show the main mechanism in this step."
    if "结论" in original:
        return "Conclusion: this small example shows the main trade-off."
    if "原文" in original:
        return "Original text"
    if "解码" in original:
        return "Decoded text"
    if "词表" in original:
        return "Vocabulary"
    if "训练" in original:
        return "Training"
    if "损失" in original or "loss" in text:
        return "Loss"
    if "通过" in original:
        return "Exercise passed: you have understood this step."
    return "Read the values printed above and connect them to the concept in this cell."


def replace_string_token(token_text, token_index):
    if not has_cjk(token_text):
        return token_text
    return repr(english_string_for(token_text, token_index))


def translate_code(source):
    if not has_cjk(source):
        return source

    reader = io.StringIO(source).readline
    try:
        tokens = list(tokenize.generate_tokens(reader))
    except tokenize.TokenError:
        return re.sub(r"[\u4e00-\u9fff]+", "English note", source)

    line_offsets = []
    offset = 0
    for line in source.splitlines(keepends=True):
        line_offsets.append(offset)
        offset += len(line)
    if not line_offsets:
        line_offsets.append(0)

    replacements = []
    for index, tok in enumerate(tokens):
        tok_type, tok_text, start, end, line = tok
        if tok_type == tokenize.COMMENT and has_cjk(tok_text):
            replacement = "# Teaching note: follow this line to see the main step."
        elif tok_type == tokenize.STRING and has_cjk(tok_text):
            replacement = replace_string_token(tok_text, index)
        else:
            continue

        start_offset = line_offsets[start[0] - 1] + start[1]
        end_offset = line_offsets[end[0] - 1] + end[1]
        replacements.append((start_offset, end_offset, replacement))

    translated = source
    for start_offset, end_offset, replacement in reversed(replacements):
        translated = translated[:start_offset] + replacement + translated[end_offset:]
    translated = translated.replace("✅", "[ok]").replace("❌", "[x]")
    return translated


def build_english_notebook(source_path):
    part_dir = source_path.parent.name
    stem = source_path.stem
    notebook = json.loads(source_path.read_text(encoding="utf-8"))

    code_cells = []
    for cell in notebook["cells"]:
        if cell.get("cell_type") != "code":
            continue
        source = "".join(cell.get("source", []))
        cell = dict(cell)
        cell["source"] = translate_code(source).splitlines(keepends=True)
        cell["outputs"] = []
        cell["execution_count"] = None
        code_cells.append(cell)

    intro_cell = {
        "cell_type": "markdown",
        "metadata": {},
        "source": lesson_markdown(stem, part_dir).splitlines(keepends=True),
    }
    notebook["cells"] = [intro_cell, *code_cells]
    return notebook


def main():
    for source_path in sorted(SOURCE_DIR.glob("**/*.ipynb")):
        if ".ipynb_checkpoints" in str(source_path):
            continue
        target_path = TARGET_DIR / source_path.relative_to(SOURCE_DIR)
        target_path.parent.mkdir(parents=True, exist_ok=True)
        notebook = build_english_notebook(source_path)
        target_path.write_text(
            json.dumps(notebook, ensure_ascii=False, indent=1) + "\n",
            encoding="utf-8",
        )
        print(f"wrote {target_path.relative_to(REPO)}")


if __name__ == "__main__":
    main()
