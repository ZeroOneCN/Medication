import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RecordView from '../views/RecordView.vue'
import AnalysisView from '../views/AnalysisView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/record',
      name: 'record',
      component: RecordView
    },
    {
      path: '/analysis',
      name: 'analysis',
      component: AnalysisView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    }
  ]
})

export default router 