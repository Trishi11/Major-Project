// Chemical and equipment types
export interface Chemical {
  id: string
  name: string
  formula: string
  color: string
  concentration?: number
  temperature?: number
  ph?: number
  properties: ChemicalProperties
}

export interface ChemicalProperties {
  state: 'solid' | 'liquid' | 'gas'
  color: string
  density: number
  boilingPoint: number
  meltingPoint: number
  solubility: number
  reactivity: string[]
}

// Equipment types
export interface Equipment {
  id: string
  type: EquipmentType
  name: string
  capacity: number
  contents?: Chemical[]
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  isSelected: boolean
  temperature: number
}

export type EquipmentType = 
  | 'beaker'
  | 'flask'
  | 'test-tube'
  | 'graduated-cylinder'
  | 'burette'
  | 'bunsen-burner'
  | 'thermometer'
  | 'stirring-rod'

// Experiment types
export interface Experiment {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number // in minutes
  category: ExperimentCategory
  objectives: string[]
  materials: ExperimentMaterial[]
  steps: ExperimentStep[]
  safetyNotes: string[]
  expectedResults: string[]
  reactions: ChemicalReaction[]
}

export type ExperimentCategory = 
  | 'acid-base'
  | 'precipitation'
  | 'redox'
  | 'thermal'
  | 'gas-evolution'
  | 'crystallization'

export interface ExperimentMaterial {
  equipmentType: EquipmentType
  chemical?: Chemical
  quantity: number
  required: boolean
}

export interface ExperimentStep {
  id: string
  instruction: string
  equipment: string[]
  chemicals: string[]
  action: ActionType
  duration?: number
  temperature?: number
  expectedObservation: string
  safety?: string
  completed: boolean
}

export type ActionType = 
  | 'pour'
  | 'mix'
  | 'heat'
  | 'cool'
  | 'measure'
  | 'observe'
  | 'wait'
  | 'stir'

// Chemical reactions
export interface ChemicalReaction {
  id: string
  reactants: string[]
  products: string[]
  conditions: ReactionConditions
  effects: VisualEffect[]
  equation: string
}

export interface ReactionConditions {
  temperature?: number
  ph?: number
  concentration?: number
  catalyst?: string
}

export interface VisualEffect {
  type: 'color-change' | 'gas-evolution' | 'precipitation' | 'heat-release' | 'bubbling' | 'flame'
  intensity: number
  duration: number
  color?: string
  particle?: 'bubble' | 'smoke' | 'steam' | 'crystals'
}

// Lab state management
export interface LabState {
  currentExperiment?: Experiment
  equipment: Equipment[]
  chemicals: Chemical[]
  reactions: ChemicalReaction[]
  temperature: number
  time: number
  isRunning: boolean
  selectedEquipment?: string
}

// UI types
export interface UIState {
  selectedExperiment?: string
  showInstructions: boolean
  showSafetyNotes: boolean
  currentStep: number
  isMenuOpen: boolean
  view: '3d' | 'dashboard'
}

// Interaction types
export interface InteractionState {
  isDragging: boolean
  draggedItem?: string
  hoverItem?: string
  pouringFrom?: string
  pouringTo?: string
}