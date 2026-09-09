import type { ComponentRecord } from '../domain/models'

const sourceNote = 'Présence confirmée dans l’archive hors production.'

export const components: ComponentRecord[] = [
  {
    id: 'core-wordpress',
    name: 'WordPress',
    type: 'core',
    version: '6.4.3',
    presence: 'confirmed_in_files',
    activation: 'confirmed',
    sourceNote,
  },
  {
    id: 'theme-astra',
    name: 'Astra',
    type: 'theme',
    version: '4.6.3',
    presence: 'confirmed_in_files',
    activation: 'unknown',
    sourceNote,
  },
  ...(['02', '03', '04'] as const).map(
    (suffix): ComponentRecord => ({
      id: `theme-undetailed-${suffix}`,
      name: `Thème inventorié non détaillé ${suffix}`,
      type: 'theme',
      version: null,
      presence: 'confirmed_in_files',
      activation: 'unknown',
      sourceNote: 'Nom non détaillé dans le rapport.',
    }),
  ),
  {
    id: 'plugin-woocommerce',
    name: 'WooCommerce',
    type: 'plugin',
    version: '8.4.0',
    presence: 'confirmed_in_files',
    activation: 'unknown',
    sourceNote,
  },
  ...[
    'Spectra',
    'Essential Blocks',
    'Depicter',
    'Smart Slider 3',
    'Carousel Slider',
    'Editor Plus',
    'Super Block Slider',
    'Variation Swatches',
    'Cart Abandonment Recovery',
    'Akismet',
    'Starter Templates',
  ].map(
    (name, index): ComponentRecord => ({
      id: `plugin-${index + 2}`,
      name,
      type: 'plugin',
      version: null,
      presence: 'confirmed_in_files',
      activation: 'unknown',
      sourceNote,
    }),
  ),
  {
    id: 'plugin-info-cards',
    name: 'Info Cards',
    type: 'plugin',
    version: '1.0.2',
    presence: 'confirmed_in_files',
    activation: 'unknown',
    sourceNote: 'Extension tierce présente dans l’archive et analysée.',
  },
  ...(['14', '15', '16', '17'] as const).map(
    (suffix): ComponentRecord => ({
      id: `plugin-undetailed-${suffix}`,
      name: `Extension inventoriée non détaillée ${suffix}`,
      type: 'plugin',
      version: null,
      presence: 'confirmed_in_files',
      activation: 'unknown',
      sourceNote: 'Nom non détaillé dans le rapport.',
    }),
  ),
]
