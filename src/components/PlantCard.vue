<template>
  <div class="plant-card bg-white rounded-2xl overflow-hidden card-shadow card-transition hover:card-shadow-hover" @click="handleClick">
    <div class="relative h-32 bg-primary-light">
      <img v-if="plantPhoto" :src="plantPhoto" :alt="plant.name" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full flex items-center justify-center">
        <i class="fa fa-leaf text-primary text-4xl opacity-50"></i>
      </div>
      <div class="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
        <i class="fa fa-ellipsis-v text-gray-600"></i>
      </div>
    </div>
    <div class="p-4">
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-bold text-lg text-gray-800">{{ plant.name }}</h3>
        <span :class="healthBadgeClass">{{ healthText }}</span>
      </div>
      <div class="flex items-center justify-between text-sm text-gray-600">
        <span>
          <i class="fa fa-tint text-blue-500 mr-1"></i>{{ wateringText }}
        </span>
        <span>
          <i class="fa fa-sun-o text-yellow-500 mr-1"></i>{{ lightText }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Plant } from '@/types'
import { getImage } from '@/composables/useIndexedDB'

const props = defineProps<{
  plant: Plant
}>()

const router = useRouter()
const plantPhoto = ref<string | null>(null)

onMounted(async () => {
  if (props.plant.photoKey) {
    plantPhoto.value = await getImage(props.plant.photoKey) || null
  }
})

const healthBadgeClass = computed(() => {
  const base = 'text-xs px-2 py-1 rounded-full'
  if (props.plant.healthStatus === 'good') return base + ' bg-green-100 text-green-800'
  if (props.plant.healthStatus === 'fair') return base + ' bg-yellow-100 text-yellow-800'
  return base + ' bg-red-100 text-red-800'
})

const healthText = computed(() => {
  if (props.plant.healthStatus === 'good') return '健康'
  if (props.plant.healthStatus === 'fair') return '一般'
  return '较差'
})

const wateringText = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const nextDate = new Date(props.plant.nextWatering)
  nextDate.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '明天'
  if (diffDays < 0) return `${Math.abs(diffDays)}天前`
  return `${diffDays}天后`
})

const lightText = computed(() => {
  const map: Record<string, string> = {
    low: '散射',
    medium: '适中',
    high: '充足'
  }
  return map[props.plant.lightRequirement] || '适中'
})

function handleClick() {
  router.push({ name: 'plant-detail', params: { id: props.plant.id } })
}
</script>

<style scoped>
.plant-card {
  cursor: pointer;
}
.plant-card:hover {
  transform: scale(1.02);
}
</style>
