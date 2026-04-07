<template>
  <footer class="glass-effect fixed bottom-0 left-0 right-0 border-t border-gray-200 z-50">
    <div class="max-w-md mx-auto grid grid-cols-3 gap-2 px-4 py-3">
      <button
        v-for="item in navItems"
        :key="item.name"
        :class="[
          'flex flex-col items-center justify-center p-2 transition-colors',
          activeRoute === item.name ? 'text-primary' : 'text-gray-500 hover:text-primary'
        ]"
        @click="handleNav(item)"
      >
        <i :class="['text-xl', item.icon]"></i>
        <span class="text-xs mt-1">{{ item.label }}</span>
      </button>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const navItems = [
  { name: 'home', label: '首页', icon: 'fa fa-home', path: '/' },
  { name: 'calendar', label: '日历', icon: 'fa fa-calendar', path: '/statistics' },
  { name: 'add', label: '添加', icon: 'fa fa-plus-circle', path: '/add' }
]

const activeRoute = computed(() => route.name as string)

function handleNav(item: typeof navItems[0]) {
  if (item.name === 'profile') {
    return
  }
  router.push(item.path)
}
</script>
