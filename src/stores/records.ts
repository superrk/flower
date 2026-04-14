import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CareRecord, RecordType } from '@/types'
import { setItem, getItem, generateId } from '@/composables/useStorage'
import { deleteImages } from '@/composables/useIndexedDB'

const RECORDS_KEY = 'care-records'

export const useRecordsStore = defineStore('records', () => {
  const records = ref<CareRecord[]>(getItem<CareRecord[]>(RECORDS_KEY) || [])

  function saveToStorage() {
    setItem(RECORDS_KEY, records.value)
  }

  function addRecord(recordData: {
    plantId: string
    type: RecordType
    watered: boolean
    healthScore: number
    lightLevel: number
    notes: string
    images: string[]
  }): CareRecord {
    const now = new Date().toISOString()
    const record: CareRecord = {
      ...recordData,
      id: generateId(),
      date: now.split('T')[0],
      createdAt: now,
      updatedAt: now
    }
    records.value.unshift(record)
    saveToStorage()
    return record
  }

  function updateRecord(id: string, updates: Partial<Omit<CareRecord, 'id' | 'createdAt'>>): boolean {
    const index = records.value.findIndex(r => r.id === id)
    if (index === -1) return false

    records.value[index] = {
      ...records.value[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    saveToStorage()
    return true
  }

  async function deleteRecord(id: string): Promise<boolean> {
    const index = records.value.findIndex(r => r.id === id)
    if (index === -1) return false

    const record = records.value[index]
    if (record.images && record.images.length > 0) {
      await deleteImages(record.images)
    }

    records.value.splice(index, 1)
    saveToStorage()
    return true
  }

  function getRecordsByPlantId(plantId: string): CareRecord[] {
    return records.value.filter(r => r.plantId === plantId)
  }

  function getRecentRecords(plantId: string, limit: number = 10): CareRecord[] {
    return getRecordsByPlantId(plantId).slice(0, limit)
  }

  async function deleteRecordsByPlantId(plantId: string): Promise<void> {
    const plantRecords = getRecordsByPlantId(plantId)
    for (const record of plantRecords) {
      if (record.images && record.images.length > 0) {
        await deleteImages(record.images)
      }
    }
    records.value = records.value.filter(r => r.plantId !== plantId)
    saveToStorage()
  }

  const todayRecords = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return records.value.filter(r => r.date === today)
  })

  const weeklyRecords = computed(() => {
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(today.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]
    return records.value.filter(r => r.date >= weekAgoStr)
  })

  function getRecordsByDateRange(startDate: string, endDate: string): CareRecord[] {
    return records.value.filter(r => r.date >= startDate && r.date <= endDate)
  }

  return {
    records,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecordsByPlantId,
    getRecentRecords,
    deleteRecordsByPlantId,
    todayRecords,
    weeklyRecords,
    getRecordsByDateRange
  }
})
