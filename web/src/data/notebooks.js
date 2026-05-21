const notebookModules = import.meta.glob('../../../notebooks/**/*.ipynb', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const PARTS = [
  ['part1-foundation', 'Foundation'],
  ['part2-training', 'Training Systems'],
  ['part3-inference', 'Inference'],
  ['part4-frontiers', 'Frontiers'],
  ['part5-production', 'Evaluation & Deployment'],
]

const TITLE_MAP = {
  '01-tokenizer-basics': 'Tokenizer 基础',
  '02-bpe-tokenizer': 'BPE Tokenizer',
  '03-embedding-position': 'Embedding 与位置编码',
  '04-transformer-block': 'Attention 与 Transformer Block',
  '05-mini-gpt': '实现自己的第一个 GPT',
  '06-architecture-refinements': '架构改进',
  '07-moe': 'MoE 混合专家',
  '08-bert-encoder': 'BERT 编码器',
  '09-training-loss': '训练与 Loss',
  '10-scaling-laws': 'Scaling Laws',
  '11-data-engineering': '数据工程',
  '12-lora': 'LoRA',
  '13-midtraining-cpt': 'Mid-Training & CPT',
  '14-rlhf-alignment': 'RLHF 对齐',
  '15-generation': '生成策略',
  '16-inference-acceleration': '推理加速',
  '17-speculative-decoding': '投机解码',
  '18-long-context': '长上下文',
  '19-cot-thinking': 'CoT 思维链',
  '20-vlm': '视觉语言模型',
  '21-evaluation': '模型评测',
  '22-distillation': '知识蒸馏',
  '23-opd': 'On-Policy Distillation',
}

const PYTHON_KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class',
  'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from',
  'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass',
  'raise', 'return', 'try', 'while', 'with', 'yield',
])

const PYTHON_BUILTINS = new Set([
  'abs', 'all', 'any', 'bool', 'dict', 'enumerate', 'float', 'int', 'len', 'list',
  'map', 'max', 'min', 'print', 'range', 'reversed', 'round', 'set', 'sorted', 'str',
  'sum', 'tuple', 'type', 'zip',
])

const CODE_PREVIEW_LINES = 28

const NOTEBOOKS = Object.entries(notebookModules)
  .map(([path, raw]) => {
    const match = path.match(/notebooks\/([^/]+)\/([^/]+)\.ipynb$/)
    if (!match) return null
    const [, partDir, id] = match
    return {
      id,
      partDir,
      raw,
      order: PARTS.findIndex(([dir]) => dir === partDir),
    }
  })
  .filter(Boolean)
  .sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return a.id.localeCompare(b.id, 'en')
  })

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function slugify(text, fallback) {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || fallback
}

function inlineMarkdown(text) {
  let html = escapeHtml(text)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  return html
}

function renderTable(lines) {
  const rows = lines.map(line => (
    line
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map(cell => inlineMarkdown(cell.trim()))
  ))
  if (rows.length < 2) return null

  const alignRow = rows[1].every(cell => /^:?-{3,}:?$/.test(cell))
  if (!alignRow) return null

  const head = rows[0].map(cell => `<th>${cell}</th>`).join('')
  const body = rows.slice(2).map(row => (
    `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
  )).join('')
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
}

function flushParagraph(blocks, paragraph) {
  if (paragraph.length === 0) return
  blocks.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`)
  paragraph.length = 0
}

function renderMarkdown(source) {
  const lines = source.split(/\r?\n/)
  const blocks = []
  const paragraph = []
  const headingCounts = new Map()

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      flushParagraph(blocks, paragraph)
      continue
    }

    if (trimmed.startsWith('```')) {
      flushParagraph(blocks, paragraph)
      const code = []
      i += 1
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i])
        i += 1
      }
      blocks.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`)
      continue
    }

    const tableLines = []
    let j = i
    while (j < lines.length && lines[j].includes('|')) {
      tableLines.push(lines[j])
      j += 1
    }
    if (tableLines.length >= 2) {
      const table = renderTable(tableLines)
      if (table) {
        flushParagraph(blocks, paragraph)
        blocks.push(table)
        i = j - 1
        continue
      }
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      flushParagraph(blocks, paragraph)
      const level = heading[1].length
      const text = heading[2].replace(/\s+#+$/, '')
      const base = slugify(text, `heading-${i}`)
      const count = headingCounts.get(base) || 0
      headingCounts.set(base, count + 1)
      const id = count === 0 ? base : `${base}-${count}`
      blocks.push(`<h${level} id="${id}">${inlineMarkdown(text)}</h${level}>`)
      continue
    }

    const quote = trimmed.match(/^>\s?(.*)$/)
    if (quote) {
      flushParagraph(blocks, paragraph)
      const quoteLines = [quote[1]]
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('>')) {
        i += 1
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''))
      }
      blocks.push(`<blockquote><p>${inlineMarkdown(quoteLines.join(' '))}</p></blockquote>`)
      continue
    }

    const list = trimmed.match(/^([-*+]|\d+\.)\s+(.+)$/)
    if (list) {
      flushParagraph(blocks, paragraph)
      const ordered = /\d+\./.test(list[1])
      const tag = ordered ? 'ol' : 'ul'
      const items = [list[2]]
      while (i + 1 < lines.length) {
        const next = lines[i + 1].trim().match(/^([-*+]|\d+\.)\s+(.+)$/)
        if (!next) break
        i += 1
        items.push(next[2])
      }
      blocks.push(`<${tag}>${items.map(item => `<li>${inlineMarkdown(item)}</li>`).join('')}</${tag}>`)
      continue
    }

    paragraph.push(trimmed)
  }

  flushParagraph(blocks, paragraph)
  return `<div class="text_cell"><div class="inner_cell"><div class="text_cell_render rendered_html">${blocks.join('\n')}</div></div></div>`
}

function normalizeSource(source) {
  return Array.isArray(source) ? source.join('') : source || ''
}

function filterDisplayWarnings(text) {
  const lines = String(text).split(/\r?\n/)
  const visible = []
  let skipNextSourceLine = false

  for (const line of lines) {
    const isMatplotlibGlyphWarning =
      line.includes('UserWarning: Glyph') &&
      line.includes('missing from font(s)')

    if (isMatplotlibGlyphWarning) {
      skipNextSourceLine = true
      continue
    }

    if (skipNextSourceLine && /^\s+/.test(line)) {
      skipNextSourceLine = false
      continue
    }

    skipNextSourceLine = false
    visible.push(line)
  }

  return visible.join('\n')
}

function extractPythonSymbols(source) {
  const classes = new Set()
  const functions = new Set()
  const aliases = new Set()
  const lines = source.split(/\r?\n/)

  for (const line of lines) {
    const classMatch = line.match(/^\s*class\s+([A-Za-z_]\w*)/)
    if (classMatch) classes.add(classMatch[1])

    const functionMatch = line.match(/^\s*def\s+([A-Za-z_]\w*)/)
    if (functionMatch) functions.add(functionMatch[1])

    const importMatch = line.match(/^\s*import\s+(.+)$/)
    if (importMatch) {
      for (const item of importMatch[1].split(',')) {
        const alias = item.trim().match(/(?:as\s+)?([A-Za-z_]\w*)$/)
        if (alias) aliases.add(alias[1])
      }
    }

    const fromImportMatch = line.match(/^\s*from\s+\S+\s+import\s+(.+)$/)
    if (fromImportMatch) {
      for (const item of fromImportMatch[1].split(',')) {
        const alias = item.trim().match(/(?:as\s+)?([A-Za-z_]\w*)$/)
        if (alias) aliases.add(alias[1])
      }
    }
  }

  return { classes, functions, aliases }
}

function collectNotebookSymbols(nb) {
  const classes = new Set()
  const functions = new Set()
  const aliases = new Set()

  for (const cell of nb.cells) {
    if (cell.cell_type !== 'code') continue
    const symbols = extractPythonSymbols(normalizeSource(cell.source))
    symbols.classes.forEach(name => classes.add(name))
    symbols.functions.forEach(name => functions.add(name))
    symbols.aliases.forEach(name => aliases.add(name))
  }

  return { classes, functions, aliases }
}

function span(className, text) {
  return `<span class="${className}">${escapeHtml(text)}</span>`
}

function readPythonString(source, start) {
  const prefixMatch = source.slice(start).match(/^([rRuUbBfF]{0,3})(['"]{1,3})/)
  if (!prefixMatch) return null

  const prefix = prefixMatch[1]
  const quote = prefixMatch[2]
  const triple = quote.length === 3
  let i = start + prefix.length + quote.length

  while (i < source.length) {
    if (source.startsWith(quote, i)) {
      i += quote.length
      break
    }
    if (!triple && source[i] === '\n') break
    if (source[i] === '\\') {
      i += 2
    } else {
      i += 1
    }
  }

  return source.slice(start, i)
}

function highlightPython(source, symbols) {
  let html = ''
  let i = 0
  let expectingDefinitionName = null

  while (i < source.length) {
    const rest = source.slice(i)
    const char = source[i]

    const stringToken = readPythonString(source, i)
    if (stringToken) {
      html += span(stringToken.startsWith('"""') || stringToken.startsWith("'''") ? 'sd' : 's', stringToken)
      i += stringToken.length
      continue
    }

    if (char === '#') {
      const end = source.indexOf('\n', i)
      const comment = end === -1 ? source.slice(i) : source.slice(i, end)
      html += span('c1', comment)
      i += comment.length
      continue
    }

    const number = rest.match(/^(?:0[xX][\da-fA-F]+|\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/)
    if (number) {
      html += span('mi', number[0])
      i += number[0].length
      continue
    }

    const identifier = rest.match(/^[A-Za-z_]\w*/)
    if (identifier) {
      const name = identifier[0]
      const after = source.slice(i + name.length)
      const nextNonSpace = after.match(/^\s*([(.=,:])/)

      if (expectingDefinitionName === 'class') {
        html += span('nc user-class', name)
        symbols.classes.add(name)
        expectingDefinitionName = null
      } else if (expectingDefinitionName === 'def') {
        html += span('nf user-function', name)
        symbols.functions.add(name)
        expectingDefinitionName = null
      } else if (PYTHON_KEYWORDS.has(name)) {
        html += span(name === 'True' || name === 'False' || name === 'None' ? 'kc' : 'k', name)
        expectingDefinitionName = name === 'class' || name === 'def' ? name : null
      } else if (PYTHON_BUILTINS.has(name)) {
        html += span('nb', name)
      } else if (symbols.classes.has(name)) {
        html += span('nc user-class', name)
      } else if (symbols.functions.has(name) || nextNonSpace?.[1] === '(') {
        html += span('nf user-function', name)
      } else if (symbols.aliases.has(name)) {
        html += span('nn user-alias', name)
      } else {
        html += span('nv', name)
      }
      i += name.length
      continue
    }

    if (/^[+\-*/%=<>!&|^~:.,;()[\]{}]/.test(char)) {
      html += span(/[()[\]{},.:;]/.test(char) ? 'p' : 'o', char)
      i += 1
      continue
    }

    html += escapeHtml(char)
    i += 1
  }

  return html
}

function renderOutput(output) {
  if (output.output_type === 'stream') {
    const text = filterDisplayWarnings(normalizeSource(output.text))
    return text ? `<div class="output_area"><pre>${escapeHtml(text)}</pre></div>` : ''
  }

  if (output.output_type === 'error') {
    const traceback = output.traceback || [`${output.ename}: ${output.evalue}`]
    return `<div class="output_area"><pre class="error">${escapeHtml(traceback.join('\n'))}</pre></div>`
  }

  const data = output.data || {}
  if (data['image/png']) {
    return `<div class="output_area"><img src="data:image/png;base64,${data['image/png']}" alt="notebook output" /></div>`
  }

  const html = normalizeSource(data['text/html'])
  if (html) {
    return `<div class="output_area">${html}</div>`
  }

  const text = filterDisplayWarnings(normalizeSource(data['text/plain']))
  if (text) {
    return `<div class="output_area"><pre>${escapeHtml(text)}</pre></div>`
  }

  return ''
}

function countOutputLines(output) {
  if (output.output_type === 'stream') {
    const text = filterDisplayWarnings(normalizeSource(output.text)).trimEnd()
    return text ? text.split(/\r?\n/).length : 0
  }

  if (output.output_type === 'error') {
    const traceback = output.traceback || [`${output.ename}: ${output.evalue}`]
    return traceback.join('\n').trimEnd().split(/\r?\n/).length
  }

  const data = output.data || {}
  const text = filterDisplayWarnings(normalizeSource(data['text/plain'])).trimEnd()
  return text ? text.split(/\r?\n/).length : 0
}

function renderCodeCell(cell, symbols, index) {
  const source = normalizeSource(cell.source)
  const outputs = cell.outputs || []
  const outputHtml = outputs.map(renderOutput).join('')
  const outputLineCount = outputs.reduce((total, output) => total + countOutputLines(output), 0)
  const outputShouldPreview = outputLineCount > CODE_PREVIEW_LINES
  const outputLineLabel = outputLineCount > 0 ? `${outputLineCount} 行` : ''
  const outputToggleId = `output-expand-${index}`
  const outputBlock = outputHtml
    ? [
        '<div class="output_wrapper">',
        `<div class="output${outputShouldPreview ? ' output-expandable output-preview' : ''}">`,
        outputShouldPreview
          ? `<input class="output-expand-toggle" id="${outputToggleId}" type="checkbox" />`
          : '',
        outputHtml,
        outputShouldPreview
          ? [
              '<div class="output-expand-label">',
              `<span class="output-expand-more">展开全部输出 ${outputLineLabel}</span>`,
              '<span class="output-expand-less">收起输出</span>',
              '</div>',
            ].join('')
          : '',
        '</div>',
        '</div>',
      ].join('')
    : ''
  const lineCount = source ? source.split(/\r?\n/).length : 0
  const lineLabel = lineCount > 0 ? `${lineCount} 行` : '空代码块'
  const shouldPreview = lineCount > CODE_PREVIEW_LINES
  const toggleId = `code-expand-${index}`

  const blocks = [
    `<div class="code_cell${shouldPreview ? ' code_cell-expandable' : ''}">`,
    `<div class="input${shouldPreview ? ' code-input-expandable' : ''}">`,
    '<div class="code-header">',
    '<span class="code-fold-title">代码</span>',
    '<div class="code-header-actions">',
    `<span class="code-fold-meta">${lineLabel}</span>`,
    '<button class="code-copy-button" type="button" aria-label="Copy code" title="Copy code">',
    '<span class="code-copy-icon code-copy-icon-copy" aria-hidden="true">',
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
    '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>',
    '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>',
    '</svg>',
    '</span>',
    '<span class="code-copy-icon code-copy-icon-check" aria-hidden="true">',
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M20 6 9 17l-5-5"></path>',
    '</svg>',
    '</span>',
    '<span class="code-copy-text">Copy</span>',
    '</button>',
    '</div>',
    '</div>',
  ]

  if (shouldPreview) {
    blocks.push(`<input class="code-expand-toggle" id="${toggleId}" type="checkbox" />`)
  }

  blocks.push(
    `<div class="input_area${shouldPreview ? ' code-preview' : ''}">`,
    `<div class="highlight"><pre>${highlightPython(source, symbols)}</pre></div>`,
    '</div>',
  )

  if (shouldPreview) {
    blocks.push(
      '<div class="code-expand-label">',
      `<span class="code-expand-more">展开全部 ${lineLabel}</span>`,
      '<span class="code-expand-less">收起代码</span>',
      '</div>'
    )
  }

  blocks.push(
    '</div>',
    outputBlock,
    '</div>',
  )

  return blocks.join('')
}

function renderNotebook(nb) {
  const symbols = collectNotebookSymbols(nb)
  return nb.cells
    .map((cell, index) => {
      if (cell.cell_type === 'markdown') return renderMarkdown(normalizeSource(cell.source))
      if (cell.cell_type === 'code') return renderCodeCell(cell, symbols, index)
      return ''
    })
    .join('\n')
}

function parseNotebook(entry) {
  const nb = JSON.parse(entry.raw)
  const part = PARTS.find(([dir]) => dir === entry.partDir)?.[1] || entry.partDir
  const title = TITLE_MAP[entry.id] || entry.id
  return {
    id: entry.id,
    title,
    part,
    partDir: entry.partDir,
    html: renderNotebook(nb),
  }
}

export function getCatalog() {
  return NOTEBOOKS.map((entry) => {
    const part = PARTS.find(([dir]) => dir === entry.partDir)?.[1] || entry.partDir
    return {
      id: entry.id,
      title: TITLE_MAP[entry.id] || entry.id,
      part,
      partDir: entry.partDir,
    }
  })
}

export function getNotebook(id) {
  const entry = NOTEBOOKS.find(item => item.id === id)
  return entry ? parseNotebook(entry) : null
}

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    window.location.reload()
  })
}
