<template>
  <nav class="glass-effect sticky top-0 z-50 border-b border-gray-200">
    <div class="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <i class="fa fa-leaf text-primary text-2xl"></i>
        <h1 class="text-xl font-bold text-primary">花草录</h1>
      </div>
      <div class="flex items-center space-x-4">
        <button @click="$emit('notification')" class="relative p-2 text-gray-600 hover:text-primary transition-colors">
          <i class="fa fa-bell-o text-lg"></i>
          <span v-if="notificationCount > 0" class="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {{ notificationCount > 9 ? '9+' : notificationCount }}
          </span>
        </button>
        <button @click="$emit('settings')" class="p-2 text-gray-600 hover:text-primary transition-colors">
          <i class="fa fa-cog text-lg"></i>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  notificationCount?: number
}>()

defineEmits(['notification', 'settings'])
</script>

<style scoped>
.bg-accent {
  background-color: #FFC107;
}
</style>
