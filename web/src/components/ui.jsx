export function SegmentedControl({ value, options, onChange, ariaLabel }) {
  return (
    <div className="ui-segmented" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          className={value === option.value ? 'active' : ''}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function Metric({ value, label }) {
  return (
    <div className="stat">
      <span className="stat-num">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

export function NotebookButton({ number, title, onClick }) {
  return (
    <button className="part-nb" onClick={onClick}>
      <span className="part-nb-num">{number}</span>
      <span className="part-nb-title">{title}</span>
      <svg className="part-nb-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  )
}
