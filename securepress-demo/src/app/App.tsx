import { HashRouter } from 'react-router'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AssessmentProvider, useAssessment } from './AssessmentProvider'
import { AppRoutes } from './routes'
import { GuidedDemo } from '../components/workflow/GuidedDemo'
import { ResetDemoDialog } from '../components/workflow/ResetDemoDialog'

function AppContent() {
  const { busy, resetDemo, startGuidedDemo } = useAssessment()
  const navigate = useNavigate()
  const [guidedStartOpen, setGuidedStartOpen] = useState(false)

  return (
    <>
      <AppRoutes
        onReset={() => {
          if (busy) return
          resetDemo()
          navigate('/setup')
        }}
        onStartGuidedDemo={() => setGuidedStartOpen(true)}
      />
      <GuidedDemo />
      <ResetDemoDialog
        open={guidedStartOpen}
        busy={busy}
        title="Start the guided walkthrough?"
        description="The local workspace will be reset and the walkthrough will begin at the overview."
        onCancel={() => setGuidedStartOpen(false)}
        onConfirm={() => {
          if (busy) return
          setGuidedStartOpen(false)
          startGuidedDemo()
          navigate('/')
        }}
      />
    </>
  )
}

function App() {
  return (
    <AssessmentProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AssessmentProvider>
  )
}

export default App
