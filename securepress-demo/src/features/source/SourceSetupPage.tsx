import { FolderOpen, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useAssessment } from '../../app/AssessmentProvider'
import type { DirectoryHandleLike } from '../../domain/models'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { SourceStatus } from './SourceStatus'

interface PickerWindow extends Window {
  showDirectoryPicker?: () => Promise<DirectoryHandleLike>
}

export function SourceSetupPage() {
  const {
    source,
    sourceDraft,
    sourceChecking,
    sourceCheckProgress,
    selectLocalFolder,
    selectPreparedSource,
    verifySelectedSource,
  } = useAssessment()
  const [pickerError, setPickerError] = useState<string | undefined>()

  const pathValue = sourceDraft?.pathLabel ?? source.pathLabel
  const hasCandidate = Boolean(
    sourceDraft?.pathLabel &&
      (sourceDraft.mode === 'prepared' || sourceDraft.directoryHandle),
  )

  const selectFolder = async () => {
    setPickerError(undefined)
    const picker = (window as PickerWindow).showDirectoryPicker
    if (!picker) {
      setPickerError('Folder selection is unavailable in this browser. Use the prepared package instead.')
      return
    }

    try {
      const handle = await picker()
      selectLocalFolder(handle)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setPickerError('The folder could not be selected in this browser session.')
    }
  }

  return (
    <main className="source-setup-page" id="main-content">
      <div className="source-setup-brand" aria-label="SecurePress">
        <span className="source-setup-brand-mark" aria-hidden="true">
          <ShieldCheck size={22} />
        </span>
        <span>
          <strong>SecurePress</strong>
          <small>Local security workspace</small>
        </span>
      </div>

      <div className="source-setup-layout">
        <div className="source-setup-intro">
          <p className="eyebrow">WORKSPACE SETUP</p>
          <h1>Choose your WordPress source</h1>
          <p>
            Select the local copy you want SecurePress to inspect. Every later step stays scoped to
            this source package.
          </p>
          <p className="source-setup-note">
            No website is contacted. SecurePress checks the selected folder locally, or you can use
            the prepared LNET TELCO package for the demonstration.
          </p>
        </div>

        <Card title="Choose a source package" eyebrow="LOCAL EVIDENCE" className="source-setup-card">
          <div className="source-form">
            <section className="registered-source" aria-label="Registered source">
              <div className="registered-source-heading">
                <span>Registered source</span>
                <span className="registered-source-state">
                  {hasCandidate ? 'Ready to verify' : 'Selection required'}
                </span>
              </div>
              <strong>{pathValue || 'No source selected'}</strong>
              <p>
                Select a folder to grant local access. A typed path is not inspected in this browser.
              </p>
            </section>

            <div className="source-action-row">
              <Button
                variant="secondary"
                disabled={sourceChecking}
                onClick={() => void selectFolder()}
              >
                <FolderOpen aria-hidden="true" size={17} />
                Select local WordPress folder
              </Button>
              <Button
                variant="ghost"
                disabled={sourceChecking}
                onClick={() => {
                  setPickerError(undefined)
                  selectPreparedSource()
                }}
              >
                Use prepared LNET TELCO package
              </Button>
            </div>

            <Button
              disabled={sourceChecking || !hasCandidate}
              busy={sourceChecking}
              onClick={() => void verifySelectedSource()}
            >
              Verify source
            </Button>

            {!hasCandidate && !sourceChecking ? (
              <p className="field-help">
                Select a local folder or use the prepared package before verifying.
              </p>
            ) : null}

            <SourceStatus
              source={source}
              candidateLabel={sourceDraft?.pathLabel}
              checking={sourceChecking}
              progress={sourceCheckProgress}
              pickerError={pickerError}
            />
          </div>
        </Card>
      </div>
    </main>
  )
}
