<template>
  <div class="analysis-view">
    <div class="page-header">
      <div class="page-title">
        <h1>数据分析</h1>
        <p>用药数据可视化分析</p>
      </div>
    </div>

    <div class="page-content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon stat-icon--primary">
            <FileTextOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalRecords }}</div>
            <div class="stat-label">总记录数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--success">
            <MedicineBoxOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalDosage }}</div>
            <div class="stat-label">累计用药</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--warning">
            <CalendarOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.uniqueDates }}</div>
            <div class="stat-label">记录天数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--info">
            <LineChartOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.avgDosage }}</div>
            <div class="stat-label">日均用量</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <LineChartOutlined />
            用药趋势
          </h3>
          <div class="card-actions">
            <div class="btn-group">
              <button 
                v-for="range in trendRanges" 
                :key="range.value"
                class="btn btn-small"
                :class="{ 'btn-primary': trendRange === range.value, 'btn-default': trendRange !== range.value }"
                @click="trendRange = range.value"
              >
                {{ range.label }}
              </button>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="chart-container">
            <v-chart class="chart" :option="trendOption" autoresize />
          </div>
        </div>
      </div>

      <div class="charts-row">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <PieChartOutlined />
              药品用量占比
            </h3>
          </div>
          <div class="card-body">
            <div class="chart-container chart-container--small">
              <v-chart class="chart" :option="pieOption" autoresize />
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <BarChartOutlined />
              时段用量对比
            </h3>
          </div>
          <div class="card-body">
            <div class="chart-container chart-container--small">
              <v-chart class="chart" :option="barOption" autoresize />
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <CalendarOutlined />
            用药日历热力图
          </h3>
          <div class="card-actions">
            <select v-model="calendarYear" class="select">
              <option v-for="year in yearOptions" :key="year" :value="year">
                {{ year }}年
              </option>
            </select>
          </div>
        </div>
        <div class="card-body">
          <div class="heatmap-container">
            <v-chart class="chart heatmap-chart" :option="heatmapOption" autoresize />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <TrophyOutlined />
            药品用量排行
          </h3>
        </div>
        <div class="card-body card-body--no-padding">
          <table class="data-table">
            <thead>
              <tr>
                <th class="col-rank">排名</th>
                <th>药品名称</th>
                <th class="col-total">总用量</th>
                <th class="col-percent">占比</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in medicineRankData" :key="item.name">
                <td class="col-rank">
                  <span v-if="index < 3" class="rank-badge" :class="`rank-badge--${index + 1}`">
                    {{ index + 1 }}
                  </span>
                  <span v-else class="rank-number">{{ index + 1 }}</span>
                </td>
                <td>{{ item.name }}</td>
                <td class="col-total">{{ item.total }}</td>
                <td class="col-percent">
                  <div class="progress-wrapper">
                    <div class="progress-bar">
                      <div 
                        class="progress-fill" 
                        :style="{ width: item.percent + '%', background: getProgressColor(index) }"
                      ></div>
                    </div>
                    <span class="progress-text">{{ item.percent }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { 
  FileTextOutlined, 
  MedicineBoxOutlined, 
  CalendarOutlined, 
  LineChartOutlined,
  PieChartOutlined,
  BarChartOutlined,
  TrophyOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart, BarChart, HeatmapChart } from 'echarts/charts'
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  VisualMapComponent,
  CalendarComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { getRecords } from '@/api/medication'

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  BarChart,
  HeatmapChart,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  VisualMapComponent,
  CalendarComponent
])

const records = ref([])
const trendRange = ref('30')
const calendarYear = ref(dayjs().year())

const trendRanges = [
  { label: '近7天', value: '7' },
  { label: '近30天', value: '30' },
  { label: '近90天', value: '90' }
]

const stats = ref({
  totalRecords: 0,
  totalDosage: 0,
  uniqueDates: 0,
  avgDosage: 0
})

const yearOptions = computed(() => {
  const current = dayjs().year()
  return [current - 2, current - 1, current]
})

const fetchRecords = async () => {
  try {
    const response = await getRecords()
    records.value = response.data
    calculateStats()
  } catch (error) {
    console.error('获取记录失败:', error)
  }
}

const calculateStats = () => {
  const data = records.value
  stats.value.totalRecords = data.length
  stats.value.totalDosage = data.reduce((sum, r) => sum + r.breakfast + r.lunch + r.dinner, 0)
  stats.value.uniqueDates = new Set(data.map(r => dayjs(r.date).format('YYYY-MM-DD'))).size
  stats.value.avgDosage = stats.value.uniqueDates > 0 
    ? Math.round(stats.value.totalDosage / stats.value.uniqueDates) 
    : 0
}

const getTrendData = computed(() => {
  const days = parseInt(trendRange.value)
  const result = []
  const dateMap = new Map()

  for (let i = days - 1; i >= 0; i--) {
    const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
    dateMap.set(date, { breakfast: 0, lunch: 0, dinner: 0, total: 0 })
  }

  records.value.forEach(r => {
    const date = dayjs(r.date).format('YYYY-MM-DD')
    if (dateMap.has(date)) {
      const item = dateMap.get(date)
      item.breakfast += r.breakfast
      item.lunch += r.lunch
      item.dinner += r.dinner
      item.total += r.breakfast + r.lunch + r.dinner
    }
  })

  dateMap.forEach((value, key) => {
    result.push({ date: key, ...value })
  })

  return result.sort((a, b) => a.date.localeCompare(b.date))
})

const trendOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'cross' },
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#E5E7EB',
    textStyle: { color: '#111827' }
  },
  legend: {
    data: ['早餐', '午餐', '晚餐', '总计'],
    bottom: 0,
    textStyle: { color: '#6B7280' }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: getTrendData.value.map(d => dayjs(d.date).format('MM-DD')),
    axisLine: { lineStyle: { color: '#E5E7EB' } },
    axisLabel: { color: '#6B7280' }
  },
  yAxis: {
    type: 'value',
    name: '用量（颗）',
    nameTextStyle: { color: '#6B7280' },
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: '#E5E7EB', type: 'dashed' } },
    axisLabel: { color: '#6B7280' }
  },
  series: [
    { name: '早餐', type: 'line', smooth: true, data: getTrendData.value.map(d => d.breakfast), itemStyle: { color: '#3B82F6' } },
    { name: '午餐', type: 'line', smooth: true, data: getTrendData.value.map(d => d.lunch), itemStyle: { color: '#10B981' } },
    { name: '晚餐', type: 'line', smooth: true, data: getTrendData.value.map(d => d.dinner), itemStyle: { color: '#F59E0B' } },
    { name: '总计', type: 'line', smooth: true, data: getTrendData.value.map(d => d.total), lineStyle: { type: 'dashed', width: 2 }, itemStyle: { color: '#6366F1' } }
  ]
}))

const getPieData = computed(() => {
  const medicineMap = new Map()
  records.value.forEach(r => {
    const total = r.breakfast + r.lunch + r.dinner
    medicineMap.set(r.medicine_name, (medicineMap.get(r.medicine_name) || 0) + total)
  })
  return Array.from(medicineMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
})

const pieOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c}颗 ({d}%)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#E5E7EB',
    textStyle: { color: '#111827' }
  },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center',
    type: 'scroll',
    textStyle: { color: '#6B7280' }
  },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['40%', '50%'],
    avoidLabelOverlap: true,
    itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
    label: { show: false },
    emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
    data: getPieData.value,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#84CC16']
  }]
}))

const barOption = computed(() => {
  const timeData = { breakfast: 0, lunch: 0, dinner: 0 }
  records.value.forEach(r => {
    timeData.breakfast += r.breakfast
    timeData.lunch += r.lunch
    timeData.dinner += r.dinner
  })

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E5E7EB',
      textStyle: { color: '#111827' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['早餐', '午餐', '晚餐'],
      axisLine: { lineStyle: { color: '#E5E7EB' } },
      axisLabel: { color: '#6B7280' }
    },
    yAxis: {
      type: 'value',
      name: '用量（颗）',
      nameTextStyle: { color: '#6B7280' },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#E5E7EB', type: 'dashed' } },
      axisLabel: { color: '#6B7280' }
    },
    series: [{
      type: 'bar',
      data: [
        { value: timeData.breakfast, itemStyle: { color: '#3B82F6', borderRadius: [4, 4, 0, 0] } },
        { value: timeData.lunch, itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] } },
        { value: timeData.dinner, itemStyle: { color: '#F59E0B', borderRadius: [4, 4, 0, 0] } }
      ],
      barWidth: '40%',
      label: { show: true, position: 'top', formatter: '{c}颗', color: '#6B7280' }
    }]
  }
})

const getHeatmapData = computed(() => {
  const year = calendarYear.value
  const dateMap = new Map()
  records.value.forEach(r => {
    const date = dayjs(r.date)
    if (date.year() === year) {
      const dateStr = date.format('YYYY-MM-DD')
      const total = r.breakfast + r.lunch + r.dinner
      dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + total)
    }
  })
  return Array.from(dateMap.entries()).map(([date, value]) => [date, value])
})

const heatmapOption = computed(() => ({
  tooltip: {
    formatter: (params) => `${params.value[0]}: ${params.value[1]}颗`,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#E5E7EB',
    textStyle: { color: '#111827' }
  },
  visualMap: {
    min: 0,
    max: Math.max(...getHeatmapData.value.map(d => d[1]), 10),
    type: 'piecewise',
    orient: 'horizontal',
    left: 'center',
    top: 0,
    inRange: { color: ['#E5E7EB', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6'] },
    textStyle: { color: '#6B7280' }
  },
  calendar: {
    top: 60,
    left: 30,
    right: 30,
    cellSize: ['auto', 15],
    range: calendarYear.value,
    itemStyle: { borderWidth: 3, borderColor: '#fff' },
    yearLabel: { show: true, color: '#111827' },
    dayLabel: { firstDay: 1, nameMap: ['日', '一', '二', '三', '四', '五', '六'], color: '#6B7280' },
    monthLabel: { nameMap: 'cn', color: '#6B7280' }
  },
  series: [{ type: 'heatmap', coordinateSystem: 'calendar', data: getHeatmapData.value }]
}))

const medicineRankData = computed(() => {
  const medicineMap = new Map()
  records.value.forEach(r => {
    const total = r.breakfast + r.lunch + r.dinner
    medicineMap.set(r.medicine_name, (medicineMap.get(r.medicine_name) || 0) + total)
  })
  const totalDosage = Array.from(medicineMap.values()).reduce((a, b) => a + b, 0)
  return Array.from(medicineMap.entries())
    .map(([name, total]) => ({
      name,
      total,
      percent: totalDosage > 0 ? Math.round((total / totalDosage) * 100) : 0
    }))
    .sort((a, b) => b.total - a.total)
})

const getProgressColor = (index) => {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EF4444']
  return colors[index % colors.length]
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped>
.analysis-view {
  width: 100%;
}

.page-header {
  margin-bottom: var(--spacing-6);
}

.page-title h1 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.page-title p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: var(--spacing-1) 0 0 0;
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-4);
}

.stat-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
}

.stat-icon--primary { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
.stat-icon--success { background: rgba(16, 185, 129, 0.1); color: #10B981; }
.stat-icon--warning { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
.stat-icon--info { background: rgba(99, 102, 241, 0.1); color: #6366F1; }

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}

.card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid var(--color-border);
}

.card-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.card-body {
  padding: var(--spacing-6);
}

.card-body--no-padding {
  padding: 0;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.btn-group {
  display: flex;
  gap: 4px;
}

.btn-group .btn {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-card);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-group .btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-group .btn-primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.btn-group .btn-primary:hover {
  background: var(--color-primary-hover);
}

.select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  background: var(--color-card);
  color: var(--color-text);
  cursor: pointer;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.chart-container--small {
  height: 260px;
}

.heatmap-container {
  width: 100%;
  height: 180px;
}

.heatmap-chart {
  height: 180px !important;
}

.chart {
  width: 100%;
  height: 100%;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-6);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: var(--spacing-3) var(--spacing-4);
  text-align: left;
  border-bottom: 1px solid var(--color-border-light);
}

.data-table th {
  background: var(--color-bg-secondary);
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.data-table td {
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.col-rank { width: 60px; }
.col-total { width: 80px; }
.col-percent { width: 200px; }

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
}

.rank-badge--1 { background: #FBBF24; color: white; }
.rank-badge--2 { background: #D1D5DB; color: #6B7280; }
.rank-badge--3 { background: #F97316; color: white; }

.rank-number {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--color-bg-secondary);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  min-width: 40px;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: var(--spacing-md);
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .stat-value {
    font-size: 20px;
  }

  .chart-container {
    height: 250px;
  }

  .chart-container--small {
    height: 220px;
  }

  .heatmap-container {
    height: 150px;
  }

  .heatmap-chart {
    height: 150px !important;
  }
}
</style>
