<template>
  <n-config-provider :theme="themeConfig" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <router-view />
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NConfigProvider, type GlobalThemeOverrides } from 'naive-ui'
import { darkTheme, lightTheme } from 'naive-ui'

const themeConfig = computed(() => lightTheme)

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#4CAF50',
    primaryColorHover: '#66BB6A',
    primaryColorPressed: '#388E3C',
    primaryColorSuppl: '#81C784',
    successColor: '#4CAF50',
    successColorHover: '#66BB6A',
    successColorPressed: '#388E3C',
    warningColor: '#FFC107',
    warningColorHover: '#FFD54F',
    warningColorPressed: '#FFA000',
    errorColor: '#F44336',
    borderRadius: '12px',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  Button: {
    borderRadiusMedium: '12px'
  },
  Card: {
    borderRadiusMedium: '16px'
  },
  Input: {
    borderRadiusMedium: '12px'
  },
  Select: {
    borderRadiusMedium: '12px'
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  background-color: #F5F5F5;
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}
</style>
