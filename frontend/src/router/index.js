import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: '药品记录' }
    },
    {
      path: '/analysis',
      name: 'analysis',
      component: () => import('../views/AnalysisView.vue'),
      meta: { title: '数据分析' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { title: '设置' }
    }
  ]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 用药记录管理` : '用药记录管理'
  next()
})

export default router
