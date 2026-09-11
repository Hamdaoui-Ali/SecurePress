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
        title="Démarrer le parcours guidé ?"
        description="Le parcours local sera remis à zéro et commencera par la vue d’ensemble."
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
