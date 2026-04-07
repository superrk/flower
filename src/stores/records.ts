import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CareRecord } from '@/types'
import { setItem, getItem, generateId } from '@/composables/useStorage'

const RECORDS_KEY = 'care-records'

export const useRecordsStore = defineStore('records', () => {
  const records = ref<CareRecord[]>(getItem<CareRecord[]>(RECORDS_KEY) || [])

  function saveToStorage() {
    setItem(RECORDS_KEY, records.value)
  }

  function addRecord(recordData: Omit<CareRecord, 'id'>): CareRecord {
    const record: CareRecord = {
      ...recordData,
      id: generateId()
    }
    records.value.unshift(record)
    saveToStorage()
    return record
  }

  function getRecordsByPlantId(plantId: string): CareRecord[] {
    return records.value.filter(r => r.plantId === plantId)
  }

  function getRecentRecords(plantId: string, limit: number = 10): CareRecord[] {
    return getRecordsByPlantId(plantId).slice(0, limit)
  }

  function deleteRecordsByPlantId(plantId: string): void {
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
    getRecordsByPlantId,
    getRecentRecords,
    deleteRecordsByPlantId,
    todayRecords,
    weeklyRecords,
    getRecordsByDateRange
  }
})
