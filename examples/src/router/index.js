import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'comprehensive',
      component: () => import('../views/ComprehensiveDemo.vue'),
      meta: { title: '综合演示' },
    },
    {
      path: '/ui-demo',
      name: 'ui-demo',
      component: () => import('../views/UiDemo.vue'),
      meta: { title: 'UI 组件演示' },
    },
  ],
})

export default router
