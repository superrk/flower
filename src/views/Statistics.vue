<template>
  <div class="min-h-screen bg-neutral-light pb-20">
    <GlassNav />

    <main class="page-container py-6">
      <div class="flex items-center mb-6 slide-up">
        <button @click="goBack" class="p-2 -ml-2 text-gray-600">
          <i class="fa fa-arrow-left"></i>
        </button>
        <h1 class="text-xl font-bold flex-1 text-center pr-10">数据统计</h1>
      </div>

      <section class="slide-up" style="animation-delay: 0.1s">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold">养护统计</h2>
          <n-select v-model:value="statsPeriod" :options="statsOptions" size="small" style="width: 100px" />
        </div>

        <div class="bg-white rounded-xl p-4 card-shadow mb-6">
          <h3 class="font-semibold mb-4">浇水频率</h3>
          <div class="h-48">
            <Bar :data="wateringChartData" :options="barChartOptions" />
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 card-shadow mb-6">
          <h3 class="font-semibold mb-4">健康度趋势</h3>
          <div class="h-48">
            <Line :data="healthChartData" :options="lineChartOptions" />
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 card-shadow">
          <h3 class="font-semibold mb-4">光照分布</h3>
          <div class="h-48">
            <Doughnut :data="lightChartData" :options="doughnutChartOptions" />
          </div>
        </div>
      </section>

      <section class="mt-6 slide-up" style="animation-delay: 0.2s">
        <h2 class="text-lg font-bold mb-4">植物健康排行</h2>
        <div class="space-y-3">
          <div
            v-for="(plant, index) in plantsByHealth"
            :key="plant.id"
            class="bg-white rounded-xl p-4 card-shadow flex items-center space-x-4"
          >
            <div :class="getRankClass(index)" class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white">
              {{ index + 1 }}
            </div>
            <div class="flex-1">
              <div class="font-semibold">{{ plant.name }}</div>
              <div class="text-sm text-gray-600">{{ getPlantTypeText(plant.type) }}</div>
            </div>
            <div class="text-right">
              <div :class="getHealthClass(plant.healthStatus)" class="text-xs px-2 py-1 rounded-full">
                {{ getHealthText(plant.healthStatus) }}
              </div>
              <div class="text-xs text-gray-500 mt-1">浇水 {{ plant.wateringCycle }}天/次</div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bar, Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { NSelect } from 'naive-ui'
import GlassNav from '@/components/GlassNav.vue'
import BottomNav from '@/components/BottomNav.vue'
import { usePlantsStore } from '@/stores/plants'
import { useRecordsStore } from '@/stores/records'
import type { Plant } from '@/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)

const router = useRouter()
const plantsStore = usePlantsStore()
const recordsStore = useRecordsStore()

const statsPeriod = ref('week')

const statsOptions = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' }
]

function getDateRange(period: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let startDate: Date
  let labels: string[] = []
  let formatFn: (d: Date) => string

  if (period === 'week') {
    startDate = new Date(today)
    startDate.setDate(today.getDate() - today.getDay() + 1)
    labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    formatFn = (d: Date) => d.toISOString().split('T')[0]
  } else if (period === 'month') {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1)
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}日`)
    formatFn = (d: Date) => d.toISOString().split('T')[0]
  } else {
    startDate = new Date(today.getFullYear(), 0, 1)
    labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    formatFn = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  return { startDate, labels, formatFn }
}

function getFilteredRecords(period: string) {
  const { startDate } = getDateRange(period)
  return recordsStore.records.filter(r => {
    const recordDate = new Date(r.date)
    return recordDate >= startDate
  })
}

const wateringChartData = computed(() => {
  const { labels } = getDateRange(statsPeriod.value)
  const today = new Date()

  const data = labels.map((_, index) => {
    if (statsPeriod.value === 'week') {
      const date = new Date(today)
      date.setDate(today.getDate() - today.getDay() + 1 + index)
      const dateStr = date.toISOString().split('T')[0]
      return recordsStore.records.filter(r => r.date === dateStr && r.watered).length
    } else if (statsPeriod.value === 'month') {
      const date = new Date(today.getFullYear(), today.getMonth(), 1 + index)
      const dateStr = date.toISOString().split('T')[0]
      return recordsStore.records.filter(r => r.date === dateStr && r.watered).length
    } else {
      const year = today.getFullYear()
      const monthRecords = recordsStore.records.filter(r => {
        const recordDate = new Date(r.date)
        return recordDate.getFullYear() === year && recordDate.getMonth() === index
      })
      return monthRecords.filter(r => r.watered).length
    }
  })

  return {
    labels,
    datasets: [{
      label: '浇水次数',
      data,
      backgroundColor: '#4CAF50',
      borderColor: '#4CAF50',
      borderWidth: 1,
      borderRadius: 6,
      barThickness: statsPeriod.value === 'month' ? 8 : 20
    }]
  }
})

const healthChartData = computed(() => {
  const today = new Date()
  let labels: string[] = []
  let groupBy: 'day' | 'month'

  if (statsPeriod.value === 'week') {
    labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    groupBy = 'day'
  } else if (statsPeriod.value === 'month') {
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}日`)
    groupBy = 'day'
  } else {
    labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    groupBy = 'month'
  }

  const filteredRecords = getFilteredRecords(statsPeriod.value)

  const groupedHealth: Map<string, number[]> = new Map()
  filteredRecords.forEach(record => {
    const recordDate = new Date(record.date)
    let key: string
    if (groupBy === 'day') {
      key = recordDate.toISOString().split('T')[0]
    } else {
      key = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`
    }
    if (!groupedHealth.has(key)) {
      groupedHealth.set(key, [])
    }
    groupedHealth.get(key)!.push(record.healthScore)
  })

  const data = labels.map((_, index) => {
    let key: string
    if (statsPeriod.value === 'week') {
      const monday = new Date(today)
      monday.setDate(today.getDate() - today.getDay() + 1)
      const d = new Date(monday)
      d.setDate(monday.getDate() + index)
      key = d.toISOString().split('T')[0]
    } else if (statsPeriod.value === 'month') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1 + index)
      key = d.toISOString().split('T')[0]
    } else {
      key = `${today.getFullYear()}-${String(index + 1).padStart(2, '0')}`
    }
    const scores = groupedHealth.get(key) || []
    if (scores.length === 0) return 0
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
  })

  return {
    labels,
    datasets: [{
      label: '平均健康度',
      data,
      borderColor: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }
})

const lightChartData = computed(() => ({
  labels: ['低光照', '中等光照', '高光照'],
  datasets: [{
    data: [
      plantsStore.plants.filter(p => p.lightRequirement === 'low').length,
      plantsStore.plants.filter(p => p.lightRequirement === 'medium').length,
      plantsStore.plants.filter(p => p.lightRequirement === 'high').length
    ],
    backgroundColor: ['#FFC107', '#4CAF50', '#8BC34A'],
    borderWidth: 0
  }]
}))

const barChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      beginAtZero: true,
      max: Math.max(5, ...wateringChartData.value.datasets[0].data) + 1,
      ticks: { stepSize: 1 },
      grid: { color: '#f0f0f0' }
    },
    x: { grid: { display: false } }
  }
}))

const lineChartOptions = computed(() => {
  const data = healthChartData.value.datasets[0].data
  const maxHealth = Math.max(...data, 0)
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(10, maxHealth + 1),
        grid: { color: '#f0f0f0' }
      },
      x: { grid: { display: false } }
    }
  }
})

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const }
  }
}

const plantsByHealth = computed(() => {
  return [...plantsStore.plants].sort((a, b) => {
    const healthOrder = { good: 3, fair: 2, poor: 1 }
    return healthOrder[b.healthStatus] - healthOrder[a.healthStatus]
  })
})

function getRankClass(index: number) {
  if (index === 0) return 'bg-yellow-500'
  if (index === 1) return 'bg-gray-400'
  if (index === 2) return 'bg-amber-600'
  return 'bg-gray-300'
}

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

function getPlantTypeText(type: Plant['type']) {
  const map: Record<string, string> = {
    leaf: '观叶植物',
    flower: '观花植物',
    succulent: '多肉植物',
    fruit: '果实植物',
    herb: '香草植物'
  }
  return map[type] || '其他'
}

function goBack() {
  router.back()
}
</script>
