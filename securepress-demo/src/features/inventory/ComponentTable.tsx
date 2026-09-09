import type { ComponentRecord } from '../../domain/models'

const typeLabels: Record<ComponentRecord['type'], string> = {
  core: 'Noyau',
  theme: 'Thème',
  plugin: 'Extension',
}

export function ComponentTable({ components }: { components: ComponentRecord[] }) {
  return (
    <div className="table-scroll">
      <table className="component-table">
        <caption className="sr-only">Composants présents dans les fichiers</caption>
        <thead>
          <tr>
            <th scope="col">Composant</th>
            <th scope="col">Type</th>
            <th scope="col">Version</th>
            <th scope="col">Présence</th>
            <th scope="col">Activation</th>
            <th scope="col">Note de source</th>
          </tr>
        </thead>
        <tbody>
          {components.map((component) => (
            <tr key={component.id}>
              <th scope="row">{component.name}</th>
              <td>{typeLabels[component.type]}</td>
              <td>{component.version ?? 'Non détaillée'}</td>
              <td>
                <span className="table-status table-status-confirmed">
                  Présente dans les fichiers
                </span>
              </td>
              <td>
                <span
                  className={
                    component.activation === 'confirmed'
                      ? 'table-status table-status-confirmed'
                      : 'table-status table-status-unknown'
                  }
                >
                  {component.activation === 'confirmed'
                    ? 'Confirmée'
                    : 'Inconnue'}
                </span>
              </td>
              <td>{component.sourceNote}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
