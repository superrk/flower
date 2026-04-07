<template>
  <div class="min-h-screen bg-neutral-light pb-20">
    <GlassNav :notification-count="reminderCount" @notification="showNotifications" />

    <main class="page-container py-6">
      <section class="mb-8 fade-in">
        <div class="bg-primary-gradient rounded-2xl p-6 text-white shadow-card">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-2xl font-bold mb-2">你好，植物守护者！</h2>
              <p class="text-white/90 mb-4">今天有 <span class="font-bold">{{ plantsStore.plantsNeedWaterToday }}</span> 株植物需要你的照顾</p>
              <button @click="goToAdd" class="bg-white text-primary px-4 py-2 rounded-full font-medium hover:bg-opacity-90 transition-all transform hover:scale-105">
                <i class="fa fa-plus mr-2"></i>添加植物
              </button>
            </div>
            <div class="hidden sm:block">
              <i class="fa fa-pagelines text-5xl opacity-80"></i>
            </div>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-2 gap-4 mb-8 slide-up" style="animation-delay: 0.1s">
        <div class="bg-white rounded-xl p-4 card-shadow card-transition hover:card-shadow-hover">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-600">植物总数</h3>
            <i class="fa fa-tree text-primary"></i>
          </div>
          <p class="text-2xl font-bold">{{ plantsStore.totalCount }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 card-shadow card-transition hover:card-shadow-hover">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-600">健康状态</h3>
            <i class="fa fa-heartbeat text-secondary"></i>
          </div>
          <p class="text-2xl font-bold text-secondary">{{ healthStatus }}</p>
        </div>
      </section>

      <section class="mb-8 slide-up" style="animation-delay: 0.2s">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">我的植物</h2>
          <div class="flex space-x-2">
            <button
              @click="viewMode = 'grid'"
              :class="['p-2 rounded-lg transition-colors', viewMode === 'grid' ? 'bg-primary-light text-primary' : 'text-gray-400 hover:text-primary']"
            >
              <i class="fa fa-th-large"></i>
            </button>
            <button
              @click="viewMode = 'list'"
              :class="['p-2 rounded-lg transition-colors', viewMode === 'list' ? 'bg-primary-light text-primary' : 'text-gray-400 hover:text-primary']"
            >
              <i class="fa fa-list"></i>
            </button>
          </div>
        </div>

        <div class="relative mb-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索植物..."
            class="w-full bg-white border border-gray-200 rounded-full py-3 px-5 pl-12 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          <i class="fa fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>

        <div v-if="filteredPlants.length === 0" class="text-center py-8 text-gray-500">
          <i class="fa fa-leaf text-4xl opacity-50 mb-2"></i>
          <p>还没有添加植物，快去添加吧！</p>
        </div>

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-2 gap-4">
          <PlantCard v-for="plant in filteredPlants" :key="plant.id" :plant="plant" />
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="plant in filteredPlants"
            :key="plant.id"
            class="plant-list-item bg-white rounded-xl p-4 card-shadow card-transition hover:card-shadow-hover flex items-center space-x-4 cursor-pointer"
            @click="goToDetail(plant.id)"
          >
            <div class="w-16 h-16 rounded-lg overflow-hidden bg-primary-light shrink-0">
              <div class="w-full h-full flex items-center justify-center">
                <i class="fa fa-leaf text-primary text-2xl"></i>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <h3 class="font-bold text-gray-800 truncate">{{ plant.name }}</h3>
                <span :class="getHealthClass(plant.healthStatus)" class="text-xs px-2 py-1 rounded-full">
                  {{ getHealthText(plant.healthStatus) }}
                </span>
              </div>
              <div class="flex items-center justify-between text-sm text-gray-600">
                <div class="flex items-center space-x-3">
                  <span><i class="fa fa-tint text-blue-500 mr-1"></i>{{ getWateringText(plant.nextWatering) }}</span>
                  <span><i class="fa fa-sun-o text-yellow-500 mr-1"></i>{{ getLightText(plant.lightRequirement) }}</span>
                </div>
                <button class="text-primary hover:text-primary-dark">
                  <i class="fa fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mb-8 slide-up" style="animation-delay: 0.3s">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">养护统计</h2>
          <n-select v-model:value="statsPeriod" :options="statsOptions" size="small" style="width: 100px" />
        </div>
        <div class="bg-white rounded-xl p-4 card-shadow">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </section>

      <section class="slide-up" style="animation-delay: 0.4s">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">智能建议</h2>
          <i class="fa fa-lightbul-o text-accent text-xl"></i>
        </div>
        <div class="bg-white rounded-xl p-5 card-shadow">
          <div class="space-y-4">
            <SuggestionCard
              v-for="suggestion in suggestions"
              :key="suggestion.id"
              :type="suggestion.type"
              :title="suggestion.title"
              :message="suggestion.message"
            />
          </div>
        </div>
      </section>
    </main>

    <BottomNav />

    <n-modal v-model:show="showNotificationModal" preset="card" title="通知中心" style="max-width: 400px; margin: 16px;">
      <div class="space-y-4">
        <div v-for="reminder in reminders" :key="reminder.id" :class="getReminderClass(reminder.type)">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">{{ getReminderTitle(reminder.type) }}</h3>
            <span class="text-xs text-gray-500">{{ formatTime(reminder.createdAt) }}</span>
          </div>
          <p class="text-sm mt-1">{{ reminder.message }}</p>
        </div>
        <div v-if="reminders.length === 0" class="text-center text-gray-500 py-4">
          暂无通知
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { NSelect, NModal } from 'naive-ui'
import GlassNav from '@/components/GlassNav.vue'
import BottomNav from '@/components/BottomNav.vue'
import PlantCard from '@/components/PlantCard.vue'
import SuggestionCard from '@/components/SuggestionCard.vue'
import { usePlantsStore } from '@/stores/plants'
import type { Plant } from '@/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const router = useRouter()
const plantsStore = usePlantsStore()

const viewMode = ref<'grid' | 'list'>('grid')
const searchQuery = ref('')
const statsPeriod = ref('week')
const showNotificationModal = ref(false)
const reminderCount = ref(0)

const statsOptions = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' }
]

const healthStatus = computed(() => {
  const healthy = plantsStore.healthyCount
  const total = plantsStore.totalCount
  if (total === 0) return '无数据'
  if (healthy / total > 0.7) return '良好'
  if (healthy / total > 0.4) return '一般'
  return '需关注'
})

const filteredPlants = computed(() => {
  if (!searchQuery.value) return plantsStore.plants
  const query = searchQuery.value.toLowerCase()
  return plantsStore.plants.filter(p => p.name.toLowerCase().includes(query))
})

const chartData = computed(() => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const data = [2, 1, 3, 0, 2, 1, 2]
  return {
    labels: days,
    datasets: [{
      label: '浇水次数',
      data: data,
      backgroundColor: '#4CAF50',
      borderColor: '#4CAF50',
      borderWidth: 1,
      borderRadius: 6,
      barThickness: 20
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 5,
      ticks: { stepSize: 1 },
      grid: { color: '#f0f0f0' }
    },
    x: {
      grid: { display: false }
    }
  }
}

const suggestions = computed(() => {
  const result: Array<{id: string; type: 'watering' | 'light' | 'health'; title: string; message: string}> = []
  const today = new Date().toISOString().split('T')[0]

  plantsStore.plants.forEach(plant => {
    if (plant.nextWatering <= today) {
      result.push({
        id: `water-${plant.id}`,
        type: 'watering',
        title: '浇水提醒',
        message: `${plant.name}需要浇水了，土壤可能已经干燥！`
      })
    }
  })

  plantsStore.plants.filter(p => p.lightRequirement === 'low').slice(0, 1).forEach(plant => {
    result.push({
      id: `light-${plant.id}`,
      type: 'light',
      title: '光照调整',
      message: `${plant.name}近期光照不足，建议移至明亮散射光处。`
    })
  })

  return result.slice(0, 3)
})

const reminders = computed(() => suggestions.value.map(s => ({
  id: s.id,
  type: s.type,
  message: s.message,
  createdAt: new Date().toISOString(),
  plantId: '',
  read: false
})))

function getHealthClass(status: Plant['healthStatus']) {
  if (status === 'good') return 'bg-green-100 text-green-800'
  if (status === 'fair') return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

function getHealthText(status: Plant['healthStatus']) {
  if (status === 'good') return '健康'
  if (status === 'fair') return '一般'
  return '较差'
}

function getWateringText(nextWatering: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const next = new Date(nextWatering)
  next.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '明天'
  if (diffDays < 0) return `${Math.abs(diffDays)}天前`
  return `${diffDays}天后`
}

function getLightText(requirement: Plant['lightRequirement']) {
  const map: Record<string, string> = { low: '散射', medium: '适中', high: '充足' }
  return map[requirement] || '适中'
}

function getReminderClass(type: string) {
  if (type === 'watering') return 'bg-red-50 border-l-4 border-red-400 p-4 rounded'
  if (type === 'light') return 'bg-blue-50 border-l-4 border-blue-400 p-4 rounded'
  return 'bg-green-50 border-l-4 border-green-400 p-4 rounded'
}

function getReminderTitle(type: string) {
  if (type === 'watering') return '紧急浇水提醒'
  if (type === 'light') return '光照提醒'
  return '养护提醒'
}

function formatTime(isoString: string) {
  const date = new Date(isoString)
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
}

function goToAdd() {
  router.push({ name: 'add-plant' })
}

function goToDetail(id: string) {
  router.push({ name: 'plant-detail', params: { id } })
}

function showNotifications() {
  showNotificationModal.value = true
}

onMounted(() => {
  reminderCount.value = suggestions.value.length
})
</script>

<style scoped>
.bg-accent {
  background-color: #FFC107;
}
</style>
