import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/plant/:id',
      name: 'plant-detail',
      component: () => import('@/views/PlantDetail.vue')
    },
    {
      path: '/add',
      name: 'add-plant',
      component: () => import('@/views/AddPlant.vue')
    },
    {
      path: '/edit/:id',
      name: 'edit-plant',
      component: () => import('@/views/AddPlant.vue')
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('@/views/Statistics.vue')
    }
  ]
})

export default router
