interface BeforeAfterDiffProps {
  before: string
  after: string
}

export function BeforeAfterDiff({ before, after }: BeforeAfterDiffProps) {
  return (
    <div className="before-after-grid">
      <div className="before-after-column before-after-before">
        <span>Initial state</span>
        <p>{before}</p>
      </div>
      <div className="before-after-column before-after-after">
        <span>Proposed hardened state</span>
        <p>{after}</p>
      </div>
    </div>
  )
}
