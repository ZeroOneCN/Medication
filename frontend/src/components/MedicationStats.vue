<template>
  <div class="stats-container">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">今日用药</span>
          <span class="stat-badge stat-badge--primary">{{ todayStats.total }} 颗</span>
        </div>
        <div class="stat-details">
          <div class="stat-detail-item">
            <span class="detail-label">早餐</span>
            <span class="detail-value">{{ todayStats.breakfast }} 颗</span>
          </div>
          <div class="stat-detail-item">
            <span class="detail-label">午餐</span>
            <span class="detail-value">{{ todayStats.lunch }} 颗</span>
          </div>
          <div class="stat-detail-item">
            <span class="detail-label">晚餐</span>
            <span class="detail-value">{{ todayStats.dinner }} 颗</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">本周用药</span>
          <span class="stat-badge stat-badge--success">{{ weekStats.total }} 颗</span>
        </div>
        <div class="stat-details">
          <div class="stat-detail-item">
            <span class="detail-label">平均每日</span>
            <span class="detail-value">{{ weekStats.average }} 颗</span>
          </div>
          <div class="stat-detail-item">
            <span class="detail-label">最高</span>
            <span class="detail-value">{{ weekStats.max }} 颗</span>
          </div>
          <div class="stat-detail-item">
            <span class="detail-label">最低</span>
            <span class="detail-value">{{ weekStats.min }} 颗</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">本月用药</span>
          <span class="stat-badge stat-badge--warning">{{ monthStats.total }} 颗</span>
        </div>
        <div class="stat-details">
          <div class="stat-detail-item">
            <span class="detail-label">平均每日</span>
            <span class="detail-value">{{ monthStats.average }} 颗</span>
          </div>
          <div class="stat-detail-item">
            <span class="detail-label">最高</span>
            <span class="detail-value">{{ monthStats.max }} 颗</span>
          </div>
          <div class="stat-detail-item">
            <span class="detail-label">最低</span>
            <span class="detail-value">{{ monthStats.min }} 颗</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">累计用药</span>
          <span class="stat-badge stat-badge--info">{{ totalStats.total }} 颗</span>
        </div>
        <div class="stat-details">
          <div class="stat-detail-item">
            <span class="detail-label">累计天数</span>
            <span class="detail-value">{{ totalStats.days }} 天</span>
          </div>
          <div class="stat-detail-item">
            <span class="detail-label">日均用量</span>
            <span class="detail-value">{{ totalStats.average }} 颗</span>
          </div>
          <div class="stat-detail-item">
            <span class="detail-label">累计种类</span>
            <span class="detail-value">{{ totalStats.medicineTypes }} 种</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const todayStats = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  const todayData = props.data.filter(item => dayjs(item.date).format('YYYY-MM-DD') === today)
  
  return {
    total: todayData.reduce((sum, item) => sum + item.breakfast + item.lunch + item.dinner, 0),
    breakfast: todayData.reduce((sum, item) => sum + item.breakfast, 0),
    lunch: todayData.reduce((sum, item) => sum + item.lunch, 0),
    dinner: todayData.reduce((sum, item) => sum + item.dinner, 0)
  }
})

const weekStats = computed(() => {
  const weekStart = dayjs().day(0).startOf('day')
  const weekEndExclusive = weekStart.add(7, 'day')

  const totalsByDate = new Map()
  for (const item of props.data) {
    const date = dayjs(item.date).startOf('day')
    if (date.isBefore(weekStart) || !date.isBefore(weekEndExclusive)) continue

    const dateKey = date.format('YYYY-MM-DD')
    const currentTotal = totalsByDate.get(dateKey) || 0
    totalsByDate.set(dateKey, currentTotal + item.breakfast + item.lunch + item.dinner)
  }

  const dailyTotals = Array.from({ length: 7 }, (_, index) => {
    const dateKey = weekStart.add(index, 'day').format('YYYY-MM-DD')
    return totalsByDate.get(dateKey) || 0
  })

  const total = dailyTotals.reduce((a, b) => a + b, 0)
  const daysWithRecords = totalsByDate.size
  const dailyTotalsForExtremes = daysWithRecords ? Array.from(totalsByDate.values()) : [0]

  return {
    total,
    average: daysWithRecords ? Math.round(total / daysWithRecords) : 0,
    max: Math.max(...dailyTotalsForExtremes),
    min: Math.min(...dailyTotalsForExtremes)
  }
})

const monthStats = computed(() => {
  const monthStart = dayjs().startOf('month')
  const monthEndExclusive = monthStart.add(1, 'month')

  const totalsByDate = new Map()
  for (const item of props.data) {
    const date = dayjs(item.date).startOf('day')
    if (date.isBefore(monthStart) || !date.isBefore(monthEndExclusive)) continue

    const dateKey = date.format('YYYY-MM-DD')
    const currentTotal = totalsByDate.get(dateKey) || 0
    totalsByDate.set(dateKey, currentTotal + item.breakfast + item.lunch + item.dinner)
  }

  const dailyTotals = Array.from(totalsByDate.values())

  const total = dailyTotals.reduce((a, b) => a + b, 0)
  const daysWithRecords = totalsByDate.size

  return {
    total,
    average: daysWithRecords ? Math.round(total / daysWithRecords) : 0,
    max: dailyTotals.length ? Math.max(...dailyTotals) : 0,
    min: dailyTotals.length ? Math.min(...dailyTotals) : 0
  }
})

const totalStats = computed(() => {
  const dailyTotals = props.data.map(item => 
    item.breakfast + item.lunch + item.dinner
  )

  const total = dailyTotals.reduce((a, b) => a + b, 0)
  const days = new Set(props.data.map(item => dayjs(item.date).format('YYYY-MM-DD'))).size
  const medicineTypes = new Set(props.data.map(item => item.medicine_name)).size

  return {
    total,
    days,
    average: days ? Math.round(total / days) : 0,
    medicineTypes
  }
})
</script>

<style scoped>
.stats-container {
  margin-bottom: var(--spacing-6);
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
  box-shadow: var(--shadow-sm);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.stat-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
}

.stat-badge {
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: 9999px;
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.stat-badge--primary { 
  background: hsl(var(--primary) / 0.1); 
  color: var(--color-primary); 
}
.stat-badge--success { 
  background: hsl(142.1 76% 36% / 0.1); 
  color: var(--color-success); 
}
.stat-badge--warning { 
  background: hsl(38 92% 50% / 0.1); 
  color: hsl(38 92% 30%);
}
.stat-badge--info { 
  background: hsl(262 83% 58% / 0.1); 
  color: var(--color-info); 
}

.stat-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.stat-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-1) 0;
}

.detail-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.detail-value {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
