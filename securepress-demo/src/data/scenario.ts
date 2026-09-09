import { components } from './components'
import { findings } from './findings'
import { project } from './project'
import { remediations } from './remediations'
import { validationChecks } from './validation-checks'
import type { Scenario } from '../domain/models'
import { ScenarioSchema } from '../domain/schema'

const rawScenario: Scenario = {
  project,
  inventory: {
    pluginCount: 17,
    themeCount: 4,
    components,
  },
  findings,
  remediations,
  validationChecks,
}

export const telcoScenario: Scenario = ScenarioSchema.parse(rawScenario) as Scenario
