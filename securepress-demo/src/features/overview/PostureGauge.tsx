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
        aria-label={`Indice pédagogique simulé : ${score} sur 100`}
      >
        <div className="posture-gauge-inner">
          <strong>{score}</strong>
          <span>/ 100</span>
        </div>
      </div>
      <div className="posture-copy">
        <p className="posture-status">{status}</p>
        <p>
          Risque restant simulé : <strong>{remainingRiskPoints} points</strong>
        </p>
        <p className="muted-copy">
          Le score est pédagogique : il ne remplace pas une validation sur la
          cible.
        </p>
      </div>
    </div>
  )
}
