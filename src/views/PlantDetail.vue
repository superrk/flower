<template>
  <div class="min-h-screen bg-neutral-light pb-20">
    <GlassNav :notificationCount="0" />

    <main class="page-container py-6">
      <div v-if="!plant" class="text-center py-8">
        <p class="text-gray-500">植物不存在</p>
        <n-button type="primary" @click="goBack" class="mt-4">返回首页</n-button>
      </div>

      <template v-else>
        <div class="slide-up">
          <div class="w-full h-48 bg-primary-light rounded-xl overflow-hidden mb-6">
            <img v-if="plantPhoto" :src="plantPhoto" :alt="plant.name" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <i class="fa fa-leaf text-primary text-6xl opacity-50"></i>
            </div>
          </div>

          <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl font-bold">{{ plant.name }}</h1>
            <span :class="healthBadgeClass" class="text-sm px-3 py-1 rounded-full">
              {{ healthText }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-white rounded-xl p-4 card-shadow">
              <div class="text-sm text-gray-600 mb-1">浇水周期</div>
              <div class="flex items-center justify-between">
                <span class="font-semibold">{{ plant.wateringCycle }} 天</span>
                <i class="fa fa-tint text-blue-500"></i>
              </div>
            </div>
            <div class="bg-white rounded-xl p-4 card-shadow">
              <div class="text-sm text-gray-600 mb-1">光照需求</div>
              <div class="flex items-center justify-between">
                <span class="font-semibold">{{ lightText }}</span>
                <i class="fa fa-sun-o text-yellow-500"></i>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-4 card-shadow mb-6">
            <div class="text-sm text-gray-600 mb-2">下次浇水</div>
            <div class="flex items-center justify-between">
              <div>
                <div class="text-lg font-bold">{{ formatDate(plant.nextWatering) }}</div>
                <div class="text-sm text-gray-600">{{ wateringText }}</div>
              </div>
              <n-button type="primary" @click="showAddRecordModal = true">添加记录</n-button>
            </div>
          </div>
        </div>

        <n-tabs v-model:value="activeTab" type="line" class="mt-4">
          <n-tab-pane name="records" tab="养护记录">
            <div class="space-y-3 mt-4">
              <div v-for="record in recordsWithImages" :key="record.id" class="bg-white rounded-lg p-3 card-shadow">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <i :class="[getRecordTypeIcon(record.type), getRecordTypeColor(record.type)]"></i>
                    <span class="font-medium">{{ formatDate(record.date) }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span :class="getHealthClass(record.healthScore)" class="text-xs px-2 py-1 rounded-full">
                      {{ record.healthScore }}/10
                    </span>
                    <button @click="handleEditRecord(record)" class="text-gray-400 hover:text-primary p-1">
                      <i class="fa fa-pencil text-sm"></i>
                    </button>
                    <button @click="handleDeleteRecord(record.id)" class="text-gray-400 hover:text-red-500 p-1">
                      <i class="fa fa-trash text-sm"></i>
                    </button>
                  </div>
                </div>
                <div v-if="record.notes" class="text-sm text-gray-600 mb-2">{{ record.notes }}</div>
                <div v-if="record.images && record.images.length > 0" class="flex space-x-2 overflow-x-auto">
                  <img
                    v-for="(img, idx) in record.images"
                    :key="idx"
                    :src="img"
                    class="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                </div>
              </div>
              <div v-if="records.length === 0" class="text-center text-gray-500 py-8">
                暂无养护记录
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="settings" tab="设置">
            <div class="mt-4 space-y-4">
              <n-form ref="formRef" :model="formValue" label-placement="top">
                <n-form-item label="植物名称">
                  <n-input v-model:value="formValue.name" placeholder="请输入植物名称" />
                </n-form-item>
                <n-form-item label="植物种类">
                  <n-select v-model:value="formValue.type" :options="plantTypeOptions" placeholder="选择种类" />
                </n-form-item>
                <n-form-item label="浇水周期（天）">
                  <n-input-number v-model:value="formValue.wateringCycle" :min="1" :max="30" />
                </n-form-item>
                <n-form-item label="光照需求">
                  <n-select v-model:value="formValue.lightRequirement" :options="lightLevelOptions" placeholder="选择光照需求" />
                </n-form-item>
                <n-form-item label="备注">
                  <n-input v-model:value="formValue.notes" type="textarea" placeholder="添加备注..." />
                </n-form-item>
              </n-form>

              <div class="flex space-x-3">
                <n-button type="primary" class="flex-1" @click="handleSave">保存修改</n-button>
                <n-button type="error" class="flex-1" @click="handleDelete">删除</n-button>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </template>
    </main>

    <BottomNav />

    <RecordFormModal
      v-model:visible="showAddRecordModal"
      :plantId="plantId"
      :editRecord="editingRecord"
      @success="handleRecordSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NTabs, NTabPane, NForm, NFormItem, NInput, NInputNumber, NSelect, useMessage, useDialog } from 'naive-ui'
import GlassNav from '@/components/GlassNav.vue'
import BottomNav from '@/components/BottomNav.vue'
import RecordFormModal from '@/components/RecordFormModal.vue'
import { usePlantsStore } from '@/stores/plants'
import { useRecordsStore } from '@/stores/records'
import { getImage } from '@/composables/useIndexedDB'
import { PLANT_TYPES, LIGHT_LEVELS, RECORD_TYPES, type Plant, type CareRecord, type RecordType } from '@/types'

const route = useRoute()
const router = useRouter()
const plantsStore = usePlantsStore()
const recordsStore = useRecordsStore()
const message = useMessage()
const dialog = useDialog()

const plantId = computed(() => route.params.id as string)
const plant = computed(() => plantsStore.getPlantById(plantId.value))
const records = computed(() => recordsStore.getRecentRecords(plantId.value, 10))
const plantPhoto = ref<string | null>(null)
const activeTab = ref('records')
const showAddRecordModal = ref(false)
const editingRecord = ref<CareRecord | null>(null)
const recordsWithImages = ref<(CareRecord & { images: string[] })[]>([])

const formValue = reactive({
  name: '',
  type: 'leaf' as Plant['type'],
  wateringCycle: 7,
  lightRequirement: 'medium' as Plant['lightRequirement'],
  notes: ''
})

const plantTypeOptions = PLANT_TYPES.map(pt => ({ label: pt.label, value: pt.type }))
const lightLevelOptions = LIGHT_LEVELS.map(ll => ({ label: ll.label, value: ll.value }))

const healthBadgeClass = computed(() => {
  if (!plant.value) return ''
  const base = 'text-xs px-2 py-1 rounded-full'
  if (plant.value.healthStatus === 'good') return base + ' bg-green-100 text-green-800'
  if (plant.value.healthStatus === 'fair') return base + ' bg-yellow-100 text-yellow-800'
  return base + ' bg-red-100 text-red-800'
})

const healthText = computed(() => {
  if (!plant.value) return ''
  if (plant.value.healthStatus === 'good') return '健康'
  if (plant.value.healthStatus === 'fair') return '一般'
  return '较差'
})

const lightText = computed(() => {
  if (!plant.value) return ''
  const map: Record<string, string> = { low: '散射', medium: '适中', high: '充足' }
  return map[plant.value.lightRequirement] || '适中'
})

const wateringText = computed(() => {
  if (!plant.value) return ''
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const next = new Date(plant.value.nextWatering)
  next.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天需要浇水'
  if (diffDays === 1) return '明天浇水'
  if (diffDays < 0) return `已逾期 ${Math.abs(diffDays)} 天`
  return `${diffDays} 天后浇水`
})

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
}

function getHealthClass(score: number) {
  if (score >= 7) return 'bg-green-100 text-green-800'
  if (score >= 4) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

function getRecordTypeIcon(type: RecordType) {
  const rt = RECORD_TYPES.find(r => r.value === type)
  return rt ? `fa ${rt.icon}` : 'fa fa-ellipsis-h'
}

function getRecordTypeColor(type: RecordType) {
  if (type === 'watering') return 'text-blue-500'
  if (type === 'fertilizing') return 'text-green-500'
  if (type === 'transplanting') return 'text-amber-700'
  return 'text-gray-500'
}

async function loadRecordsWithImages() {
  const result: (CareRecord & { images: string[] })[] = []
  for (const record of records.value) {
    const images: string[] = []
    for (const key of record.images || []) {
      const img = await getImage(key)
      if (img) images.push(img)
    }
    result.push({ ...record, images })
  }
  recordsWithImages.value = result
}

function handleEditRecord(record: CareRecord & { images: string[] }) {
  editingRecord.value = record
  showAddRecordModal.value = true
}

function handleDeleteRecord(recordId: string) {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这条养护记录吗？',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      await recordsStore.deleteRecord(recordId)
      await loadRecordsWithImages()
      message.success('记录已删除')
    }
  })
}

async function handleRecordSuccess(data: any) {
  if (editingRecord.value) {
    recordsStore.updateRecord(editingRecord.value.id, data)
  } else {
    recordsStore.addRecord({
      plantId: plantId.value,
      type: data.type,
      watered: data.type === 'watering',
      healthScore: data.healthScore,
      lightLevel: data.lightLevel,
      notes: data.notes,
      images: data.images
    })
  }
  editingRecord.value = null
  await loadRecordsWithImages()
}

function handleSave() {
  if (!plant.value) return
  plantsStore.updatePlant(plant.value.id, {
    name: formValue.name,
    type: formValue.type,
    wateringCycle: formValue.wateringCycle,
    lightRequirement: formValue.lightRequirement,
    notes: formValue.notes
  })
  message.success('保存成功！')
}

function handleDelete() {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除"${plant.value?.name}"吗？此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      if (!plant.value) return
      plantsStore.deletePlant(plant.value.id)
      recordsStore.deleteRecordsByPlantId(plant.value.id)
      message.success('删除成功')
      router.push({ name: 'home' })
    }
  })
}

function goBack() {
  router.push({ name: 'home' })
}

watch(showAddRecordModal, (val) => {
  if (!val) {
    editingRecord.value = null
  }
})

onMounted(async () => {
  if (plant.value) {
    formValue.name = plant.value.name
    formValue.type = plant.value.type
    formValue.wateringCycle = plant.value.wateringCycle
    formValue.lightRequirement = plant.value.lightRequirement
    formValue.notes = plant.value.notes

    if (plant.value.photoKey) {
      plantPhoto.value = await getImage(plant.value.photoKey) || null
    }
  }
  await loadRecordsWithImages()
})
</script>
