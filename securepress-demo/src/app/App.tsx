import { HashRouter } from 'react-router'
import { AssessmentProvider, useAssessment } from './AssessmentProvider'
import { AppRoutes } from './routes'

function AppContent() {
  const { resetDemo } = useAssessment()

  return <AppRoutes onReset={resetDemo} onStartGuidedDemo={() => undefined} />
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
