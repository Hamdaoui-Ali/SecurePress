import { Database, LoaderCircle, Play, RefreshCcw } from 'lucide-react'
import { useAssessment } from '../../app/AssessmentProvider'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { telcoScenario } from '../../data/scenario'
import { ComponentTable } from './ComponentTable'
import { InventoryProgress } from './InventoryProgress'

export function InventoryPage() {
  const { state, busy, progress, activeOperation, runInventory } = useAssessment()
  const completed = state.inventoryCompleted
  const isDiscovering = busy && activeOperation?.kind === 'discovery'
  const componentCount = telcoScenario.inventory.components.length

  return (
    <div className="page-stack">
      <div className="page-heading page-heading-with-action">
        <div>
          <p className="eyebrow">DISCOVERY</p>
          <h2>Index the source package</h2>
          <p>
            Discovery records components present in the indexed package without
            inferring activation or target exposure.
          </p>
        </div>
        <Button
          busy={false}
          disabled={busy}
          aria-busy={isDiscovering || undefined}
          onClick={() => void runInventory()}
          data-guide-id="run-inventory"
        >
          {isDiscovering ? (
            <LoaderCircle aria-hidden="true" size={17} />
          ) : completed ? (
            <RefreshCcw aria-hidden="true" size={17} />
          ) : (
            <Play aria-hidden="true" size={17} />
          )}
          {isDiscovering
            ? 'Discovery in progress'
            : completed
              ? 'Run discovery again'
              : 'Run discovery'}
        </Button>
      </div>

      <div className="inventory-summary">
        <div className="inventory-summary-icon" aria-hidden="true">
          <Database size={22} />
        </div>
        <div>
          <strong>{componentCount} components indexed</strong>
          <span>
            TELCO source package · WordPress {telcoScenario.project.wordpressVersion}
          </span>
        </div>
      </div>

      <Card title="Discovery progress" eyebrow="PACKAGE INDEXING">
        <InventoryProgress
          completed={completed}
          running={isDiscovering}
          progress={progress}
        />
      </Card>

      {completed ? (
        <Card title="Indexed components" eyebrow="SOURCE PACKAGE">
          <p className="inventory-truth">
            Presence in the package does not establish activation or exposure.
          </p>
          <ComponentTable components={telcoScenario.inventory.components} />
        </Card>
      ) : (
        <Card title="Component index pending" eyebrow="NEXT ACTION">
          <p className="muted-copy">
            Run discovery to index components and retain the distinction between
            package presence, activation, and database-dependent evidence.
          </p>
        </Card>
      )}
    </div>
  )
}
