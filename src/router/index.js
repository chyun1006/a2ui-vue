import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/ComprehensiveDemo.vue'),
    },
    {
      path: '/v3',
      name: 'v3',
      component: () => import('../views/A2UIDemoV3.vue'),
    },
    {
      path: '/v1',
      name: 'v1',
      component: () => import('../views/A2UIDemo.vue'),
    },
    {
      path: '/complete',
      name: 'complete',
      component: () => import('../views/CompleteDemo.vue'),
    },
  ],
})

export default router
