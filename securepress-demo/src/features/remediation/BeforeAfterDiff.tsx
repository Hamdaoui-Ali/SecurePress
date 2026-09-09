interface BeforeAfterDiffProps {
  before: string
  after: string
}

export function BeforeAfterDiff({ before, after }: BeforeAfterDiffProps) {
  return (
    <div className="before-after-grid">
      <div className="before-after-column before-after-before">
        <span>État initial</span>
        <p>{before}</p>
      </div>
      <div className="before-after-column before-after-after">
        <span>État renforcé proposé</span>
        <p>{after}</p>
      </div>
    </div>
  )
}
