import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Plant } from '@/types'
import { setItem, getItem, generateId } from '@/composables/useStorage'

const PLANTS_KEY = 'plants'

export const usePlantsStore = defineStore('plants', () => {
  const plants = ref<Plant[]>(getItem<Plant[]>(PLANTS_KEY) || [])

  function saveToStorage() {
    setItem(PLANTS_KEY, plants.value)
  }

  function addPlant(plantData: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>): Plant {
    const now = new Date().toISOString()
    const plant: Plant = {
      ...plantData,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    }
    plants.value.push(plant)
    saveToStorage()
    return plant
  }

  function updatePlant(id: string, updates: Partial<Plant>): boolean {
    const index = plants.value.findIndex(p => p.id === id)
    if (index === -1) return false

    plants.value[index] = {
      ...plants.value[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    saveToStorage()
    return true
  }

  function deletePlant(id: string): boolean {
    const index = plants.value.findIndex(p => p.id === id)
    if (index === -1) return false

    plants.value.splice(index, 1)
    saveToStorage()
    return true
  }

  function getPlantById(id: string): Plant | undefined {
    return plants.value.find(p => p.id === id)
  }

  function waterPlant(id: string): boolean {
    const plant = getPlantById(id)
    if (!plant) return false

    const today = new Date()
    const nextWatering = new Date(today)
    nextWatering.setDate(today.getDate() + plant.wateringCycle)

    return updatePlant(id, {
      lastWatered: today.toISOString().split('T')[0],
      nextWatering: nextWatering.toISOString().split('T')[0]
    })
  }

  const totalCount = computed(() => plants.value.length)

  const healthyCount = computed(() =>
    plants.value.filter(p => p.healthStatus === 'good').length
  )

  const plantsNeedWaterToday = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return plants.value.filter(p => p.nextWatering <= today).length
  })

  return {
    plants,
    addPlant,
    updatePlant,
    deletePlant,
    getPlantById,
    waterPlant,
    totalCount,
    healthyCount,
    plantsNeedWaterToday
  }
})
