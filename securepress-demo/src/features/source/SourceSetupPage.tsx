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
    setSourcePath,
    selectLocalFolder,
    usePreparedSource,
    verifySelectedSource,
  } = useAssessment()
  const [pickerError, setPickerError] = useState<string | undefined>()

  const pathValue = sourceDraft?.pathLabel ?? source.pathLabel

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
          <h1>Connect a local WordPress source</h1>
          <p>
            Register the local copy you want SecurePress to inspect. Discovery, finding analysis,
            change sets, and the report stay scoped to this source package.
          </p>
          <p className="source-setup-note">
            No website is contacted. The browser verifies a selected folder locally, or you can use
            the prepared LNET TELCO package for the demonstration.
          </p>
        </div>

        <Card title="Source registration" eyebrow="LOCAL EVIDENCE" className="source-setup-card">
          <div className="source-form">
            <label htmlFor="source-path">Source path</label>
            <input
              id="source-path"
              value={pathValue}
              onChange={(event) => {
                setPickerError(undefined)
                setSourcePath(event.target.value)
              }}
              placeholder="Select a folder or enter a path label"
              autoComplete="off"
            />
            <p className="field-help">
              This label identifies the local workspace. Verification requires a browser-selected
              folder or the prepared package; a typed path alone is not inspected.
            </p>

            <div className="source-action-row">
              <Button
                variant="secondary"
                disabled={sourceChecking}
                onClick={() => void selectFolder()}
              >
                <FolderOpen aria-hidden="true" size={17} />
                Select local folder
              </Button>
              <Button
                variant="ghost"
                disabled={sourceChecking}
                onClick={() => {
                  setPickerError(undefined)
                  usePreparedSource()
                }}
              >
                Use prepared LNET TELCO package
              </Button>
            </div>

            <Button
              disabled={sourceChecking}
              busy={sourceChecking}
              onClick={() => void verifySelectedSource()}
            >
              Verify source
            </Button>

            <SourceStatus
              source={source}
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
