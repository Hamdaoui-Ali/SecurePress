import type { ComponentRecord } from '../../domain/models'

const typeLabels: Record<ComponentRecord['type'], string> = {
  core: 'Core',
  theme: 'Theme',
  plugin: 'Plugin',
}

export function ComponentTable({ components }: { components: ComponentRecord[] }) {
  return (
    <div className="table-scroll">
      <table className="component-table">
        <caption className="sr-only">Components in the indexed source package</caption>
        <thead>
          <tr>
            <th scope="col">Component</th>
            <th scope="col">Type</th>
            <th scope="col">Version</th>
            <th scope="col">Package presence</th>
            <th scope="col">Activation</th>
            <th scope="col">Source note</th>
          </tr>
        </thead>
        <tbody>
          {components.map((component) => (
            <tr key={component.id}>
              <th scope="row">{component.name}</th>
              <td>{typeLabels[component.type]}</td>
              <td>{component.version ?? 'Not detailed'}</td>
              <td>
                <span className="table-status table-status-confirmed">
                  Present in indexed package
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
                  {component.activation === 'confirmed' ? 'Confirmed' : 'Unknown'}
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
