<template>
  <div class="min-h-screen bg-neutral-light pb-20">
    <GlassNav />

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
              <n-button type="primary" @click="handleWater">立即浇水</n-button>
            </div>
          </div>
        </div>

        <n-tabs v-model:value="activeTab" type="line" class="mt-4">
          <n-tab-pane name="records" tab="养护记录">
            <div class="space-y-3 mt-4">
              <div v-for="record in records" :key="record.id" class="bg-white rounded-lg p-3 card-shadow">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-medium">{{ formatDate(record.date) }}</span>
                  <span :class="getHealthClass(record.healthScore)" class="text-xs px-2 py-1 rounded-full">
                    健康度 {{ record.healthScore }}/10
                  </span>
                </div>
                <div class="text-sm text-gray-600">
                  <span v-if="record.watered"><i class="fa fa-tint text-blue-500 mr-1"></i>已浇水</span>
                  <span v-if="record.notes"> | {{ record.notes }}</span>
                </div>
              </div>
              <div v-if="records.length === 0" class="text-center text-gray-500 py-4">
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
                  <n-select v-model:value="formValue.lightRequirement" :options="lightLevelOptions" />
                </n-form-item>
                <n-form-item label="备注">
                  <n-input v-model:value="formValue.notes" type="textarea" placeholder="添加备注..." />
                </n-form-item>
              </n-form>

              <div class="flex">
                <n-button type="primary" class="flex-1" @click="handleSave">保存修改</n-button>
                <n-button type="error" class="flex-1" @click="handleDelete">删除</n-button>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </template>
    </main>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { NButton, NTabs, NTabPane, NForm, NFormItem, NInput, NInputNumber, NSelect, useMessage, useDialog } from 'naive-ui'
import GlassNav from '@/components/GlassNav.vue'
import BottomNav from '@/components/BottomNav.vue'
import { usePlantsStore } from '@/stores/plants'
import { useRecordsStore } from '@/stores/records'
import { getImage } from '@/composables/useIndexedDB'
import { PLANT_TYPES, LIGHT_LEVELS } from '@/types'
import type { Plant } from '@/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

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

const formValue = reactive({
  name: '',
  type: 'leaf' as Plant['type'],
  wateringCycle: 7,
  lightRequirement: 'medium' as Plant['lightRequirement'],
  notes: ''
})

const plantTypeOptions = PLANT_TYPES
const lightLevelOptions = LIGHT_LEVELS

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

function handleWater() {
  if (!plant.value) return
  plantsStore.waterPlant(plant.value.id)
  recordsStore.addRecord({
    plantId: plant.value.id,
    date: new Date().toISOString().split('T')[0],
    watered: true,
    healthScore: 7,
    lightLevel: 50,
    notes: '浇水养护'
  })
  message.success('浇水成功！')
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
})
</script>
