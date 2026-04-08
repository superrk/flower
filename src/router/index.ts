import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/flower/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/flower/plant/:id',
      name: 'plant-detail',
      component: () => import('@/views/PlantDetail.vue')
    },
    {
      path: '/flower/add',
      name: 'add-plant',
      component: () => import('@/views/AddPlant.vue')
    },
    {
      path: '/flower/edit/:id',
      name: 'edit-plant',
      component: () => import('@/views/AddPlant.vue')
    },
    {
      path: '/flower/statistics',
      name: 'statistics',
      component: () => import('@/views/Statistics.vue')
    }
  ]
})

export default router
