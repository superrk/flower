export interface Plant {
  id: string
  name: string
  type: 'leaf' | 'flower' | 'succulent' | 'fruit' | 'herb'
  photoKey?: string
  wateringCycle: number
  lightRequirement: 'low' | 'medium' | 'high'
  healthStatus: 'good' | 'fair' | 'poor'
  lastWatered: string
  nextWatering: string
  notes: string
  createdAt: string
  updatedAt: string
}

export type RecordType = 'watering' | 'fertilizing' | 'transplanting' | 'other'

export interface CareRecord {
  id: string
  plantId: string
  date: string
  type: RecordType
  watered: boolean
  healthScore: number
  lightLevel: number
  notes: string
  images: string[]
  createdAt: string
  updatedAt: string
}

export interface Reminder {
  id: string
  plantId: string
  type: 'watering' | 'light' | 'health'
  message: string
  createdAt: string
  read: boolean
}

export interface PlantTypeOption {
  label: string
  type: Plant['type']
  value: Plant['type']
}

export interface LightLevelOption {
  label: string
  value: Plant['lightRequirement']
}

export interface RecordTypeOption {
  label: string
  value: RecordType
  icon: string
}

export const PLANT_TYPES: PlantTypeOption[] = [
  { label: '观叶植物', type: 'leaf', value: 'leaf' },
  { label: '观花植物', type: 'flower', value: 'flower' },
  { label: '多肉植物', type: 'succulent', value: 'succulent' },
  { label: '果实植物', type: 'fruit', value: 'fruit' },
  { label: '香草植物', type: 'herb', value: 'herb' }
]

export const LIGHT_LEVELS: LightLevelOption[] = [
  { label: '低光照 (散射光)', value: 'low' },
  { label: '中等光照', value: 'medium' },
  { label: '高光照 (充足阳光)', value: 'high' }
]

export const RECORD_TYPES: RecordTypeOption[] = [
  { label: '浇水', value: 'watering', icon: 'fa-tint' },
  { label: '施肥', value: 'fertilizing', icon: 'fa-leaf' },
  { label: '移栽', value: 'transplanting', icon: 'fa-tree' },
  { label: '其它', value: 'other', icon: 'fa-ellipsis-h' }
]
