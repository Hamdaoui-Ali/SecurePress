import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAssessment } from '../../app/AssessmentProvider'
import { guidedStepDetails, guidedSteps } from '../../data/guided-steps'
import { GuidedDemoOverlay } from './GuidedDemoOverlay'

export function GuidedDemo() {
  const {
    state,
    busy,
    applyRemediation,
    runValidation,
    nextGuidedStep,
    previousGuidedStep,
    exitGuidedDemo,
  } = useAssessment()
  const location = useLocation()
  const navigate = useNavigate()
  const previousStepRef = useRef<number | null>(null)
  const [advancing, setAdvancing] = useState(false)
  const navigationRevision = useRef(0)
  const latestStep = useRef(state.guidedStep)

  useEffect(() => {
    latestStep.current = state.guidedStep
  }, [state.guidedStep])

  const stepIndex = state.guidedStep
  const active = stepIndex !== null
  const stepKey = active ? guidedSteps[stepIndex] : null
  const detail = stepKey ? guidedStepDetails[stepKey] : null

  useEffect(() => {
    if (!active || !detail || stepIndex === null) {
      previousStepRef.current = null
      return
    }

    if (previousStepRef.current !== stepIndex) {
      previousStepRef.current = stepIndex
      if (location.pathname !== detail.route) {
        navigate(detail.route)
      }
    }
  }, [active, detail, location.pathname, navigate, stepIndex])

  useEffect(() => {
    if (!active || !detail) return

    const target = document.querySelector<HTMLElement>(
      `[data-guide-id="${detail.targetId}"]`,
    )
    if (!target) return

    target.classList.add('guided-target')
    target.scrollIntoView?.({ block: 'center', behavior: 'smooth' })
    return () => target.classList.remove('guided-target')
  }, [active, detail, location.pathname])

  if (!active || !detail || stepIndex === null) return null

  const handleNext = async () => {
    if (advancing || busy) return
    setAdvancing(true)
    const revision = navigationRevision.current
    const stillCurrent = () =>
      navigationRevision.current === revision && latestStep.current === stepIndex

    try {
      if (stepIndex === guidedSteps.length - 1) {
        exitGuidedDemo()
        return
      }

      if (stepKey === 'apply-remediation') {
        const guidedFindingIds = [
          'F-001',
          'F-002',
          'F-003',
          'F-004',
          'F-007',
          'F-009',
        ] as const

        for (const findingId of guidedFindingIds) {
          const succeeded = await applyRemediation(findingId)
          if (!succeeded || !stillCurrent()) return
        }
      }

      if (stepKey === 'run-validation' && !state.validationResults['external-dynamic-retest']) {
        const succeeded = await runValidation()
        if (!succeeded || !stillCurrent()) return
      }

      if (stillCurrent()) nextGuidedStep(stepIndex)
    } finally {
      setAdvancing(false)
    }
  }

  return (
    <GuidedDemoOverlay
      stepNumber={stepIndex + 1}
      totalSteps={guidedSteps.length}
      title={detail.title}
      description={detail.description}
      isFirst={stepIndex === 0}
      isLast={stepIndex === guidedSteps.length - 1}
      busy={advancing || busy}
      onPrevious={() => {
        navigationRevision.current += 1
        previousGuidedStep()
      }}
      onNext={() => void handleNext()}
      onExit={() => {
        navigationRevision.current += 1
        exitGuidedDemo()
      }}
    />
  )
}
