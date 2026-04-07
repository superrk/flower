<template>
  <div class="flex items-start space-x-3">
    <div class="bg-primary-light rounded-full p-2 text-primary shrink-0">
      <i :class="iconClass"></i>
    </div>
    <div class="flex-1 min-w-0">
      <h3 class="font-semibold text-gray-800">{{ title }}</h3>
      <p class="text-sm text-gray-600">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type: 'watering' | 'light' | 'health'
  title: string
  message: string
}>()

const iconClass = computed(() => {
  const map: Record<string, string> = {
    watering: 'fa fa-tint',
    light: 'fa fa-sun-o',
    health: 'fa fa-leaf'
  }
  return map[props.type] || 'fa fa-info-circle'
})
</script>
