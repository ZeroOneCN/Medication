<template>
  <div class="chart-container">
    <v-chart class="chart" :option="option" autoresize />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const option = ref({
  title: {
    text: '药品用量趋势',
    left: 'center',
    textStyle: {
      color: '#262626',
      fontSize: 16,
      fontWeight: 'normal'
    }
  },
  tooltip: {
    trigger: 'axis',
    formatter: function(params) {
      let result = params[0].axisValue + '<br/>'
      params.forEach(param => {
        result += param.seriesName + ': ' + param.value + '颗<br/>'
      })
      return result
    }
  },
  legend: {
    data: ['早餐', '午餐', '晚餐'],
    bottom: 0,
    textStyle: {
      color: '#595959'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [],
    axisLine: {
      lineStyle: {
        color: '#d9d9d9'
      }
    },
    axisLabel: {
      color: '#595959'
    }
  },
  yAxis: {
    type: 'value',
    name: '用量（颗）',
    nameTextStyle: {
      color: '#595959'
    },
    axisLine: {
      lineStyle: {
        color: '#d9d9d9'
      }
    },
    axisLabel: {
      color: '#595959'
    },
    splitLine: {
      lineStyle: {
        color: '#f0f0f0'
      }
    }
  },
  series: [
    {
      name: '早餐',
      type: 'line',
      data: [],
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3
      },
      itemStyle: {
        color: '#1890ff'
      }
    },
    {
      name: '午餐',
      type: 'line',
      data: [],
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3
      },
      itemStyle: {
        color: '#52c41a'
      }
    },
    {
      name: '晚餐',
      type: 'line',
      data: [],
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3
      },
      itemStyle: {
        color: '#faad14'
      }
    }
  ]
})

const updateChart = (data) => {
  // 按日期排序
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  )

  // 更新x轴数据
  option.value.xAxis.data = sortedData.map(item => 
    new Date(item.date).toLocaleDateString()
  )

  // 更新系列数据
  option.value.series[0].data = sortedData.map(item => item.breakfast)
  option.value.series[1].data = sortedData.map(item => item.lunch)
  option.value.series[2].data = sortedData.map(item => item.dinner)
}

watch(() => props.data, (newData) => {
  updateChart(newData)
}, { immediate: true })
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
  background: #fff;
}

.chart {
  width: 100%;
  height: 100%;
}
</style> 