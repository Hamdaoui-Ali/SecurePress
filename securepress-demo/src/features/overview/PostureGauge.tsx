import type { CSSProperties } from 'react'

interface PostureGaugeProps {
  score: number
  remainingRiskPoints: number
  status: string
}

export function PostureGauge({
  score,
  remainingRiskPoints,
  status,
}: PostureGaugeProps) {
  return (
    <div className="posture-layout">
      <div
        className="posture-gauge"
        style={{ '--gauge-score': `${score}%` } as CSSProperties}
        role="img"
        aria-label={`Security posture score: ${score} out of 100`}
      >
        <div className="posture-gauge-inner">
          <strong>{score}</strong>
          <span>/ 100</span>
        </div>
      </div>
      <div className="posture-copy">
        <p className="posture-status">{status}</p>
        <p>
          Remaining risk: <strong>{remainingRiskPoints} points</strong>
        </p>
        <p className="muted-copy">
          The score reflects the deterministic workspace assessment and still
          requires target verification.
        </p>
      </div>
    </div>
  )
}
