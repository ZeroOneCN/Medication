<template>
  <div class="stats-container">
    <a-row :gutter="16">
      <a-col :span="8">
        <a-card class="stat-card" :bordered="false">
          <template #title>今日用药</template>
          <div class="stat-value">{{ todayStats.total }} 颗</div>
          <div class="stat-detail">
            <div>早餐: {{ todayStats.breakfast }} 颗</div>
            <div>午餐: {{ todayStats.lunch }} 颗</div>
            <div>晚餐: {{ todayStats.dinner }} 颗</div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="stat-card" :bordered="false">
          <template #title>本周用药</template>
          <div class="stat-value">{{ weekStats.total }} 颗</div>
          <div class="stat-detail">
            <div>平均每日: {{ weekStats.average }} 颗</div>
            <div>最高: {{ weekStats.max }} 颗</div>
            <div>最低: {{ weekStats.min }} 颗</div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="stat-card" :bordered="false">
          <template #title>本月用药</template>
          <div class="stat-value">{{ monthStats.total }} 颗</div>
          <div class="stat-detail">
            <div>平均每日: {{ monthStats.average }} 颗</div>
            <div>最高: {{ monthStats.max }} 颗</div>
            <div>最低: {{ monthStats.min }} 颗</div>
          </div>
        </a-card>
      </a-col>
    </a-row>
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
  const todayData = props.data.find(item => dayjs(item.date).format('YYYY-MM-DD') === today) || {
    breakfast: 0,
    lunch: 0,
    dinner: 0
  }
  
  return {
    total: todayData.breakfast + todayData.lunch + todayData.dinner,
    breakfast: todayData.breakfast,
    lunch: todayData.lunch,
    dinner: todayData.dinner
  }
})

const weekStats = computed(() => {
  const weekStart = dayjs().startOf('week')
  const weekEnd = dayjs().endOf('week')
  const weekData = props.data.filter(item => {
    const date = dayjs(item.date)
    return date.isAfter(weekStart) && date.isBefore(weekEnd)
  })

  const dailyTotals = weekData.map(item => 
    item.breakfast + item.lunch + item.dinner
  )

  const total = dailyTotals.reduce((a, b) => a + b, 0)
  const daysCount = weekData.length || 1 // 避免除以0

  return {
    total,
    average: Math.round(total / daysCount),
    max: dailyTotals.length ? Math.max(...dailyTotals) : 0,
    min: dailyTotals.length ? Math.min(...dailyTotals) : 0
  }
})

const monthStats = computed(() => {
  const monthStart = dayjs().startOf('month')
  const monthEnd = dayjs().endOf('month')
  const monthData = props.data.filter(item => {
    const date = dayjs(item.date)
    return date.isAfter(monthStart) && date.isBefore(monthEnd)
  })

  const dailyTotals = monthData.map(item => 
    item.breakfast + item.lunch + item.dinner
  )

  const total = dailyTotals.reduce((a, b) => a + b, 0)
  const daysCount = monthData.length || 1 // 避免除以0

  return {
    total,
    average: Math.round(total / daysCount),
    max: dailyTotals.length ? Math.max(...dailyTotals) : 0,
    min: dailyTotals.length ? Math.min(...dailyTotals) : 0
  }
})
</script>

<style scoped>
.stats-container {
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin: 8px 0;
}

.stat-detail {
  color: #595959;
  font-size: 14px;
}

.stat-detail div {
  margin: 4px 0;
}
</style> 