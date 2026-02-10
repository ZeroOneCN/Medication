import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './assets/main.css'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import localeData from 'dayjs/plugin/localeData'
import updateLocale from 'dayjs/plugin/updateLocale'

dayjs.extend(localeData)
dayjs.extend(updateLocale)
dayjs.locale('zh-cn')
dayjs.updateLocale('zh-cn', { weekStart: 0 })

const app = createApp(App)

app.use(router)
app.use(createPinia())
app.use(Antd)

app.mount('#app') 
