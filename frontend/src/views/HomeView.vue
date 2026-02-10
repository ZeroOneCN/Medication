<template>
  <div class="home">
    <a-page-header
      title="药品记录"
      sub-title="记录每日用药情况"
    >
      <template #extra>
        <a-button type="primary" @click="showAddModal">添加记录</a-button>
        <a-button @click="exportData">导出数据</a-button>
        <a-button @click="downloadTemplate">下载模板</a-button>
        <a-upload
          :showUploadList="false"
          :beforeUpload="beforeUpload"
        >
          <a-button>导入数据</a-button>
        </a-upload>
      </template>
    </a-page-header>

    <div class="content-wrapper">
      <a-card class="filter-card" :bordered="false">
        <a-form
          :model="filterForm"
          :layout="isMobile ? 'vertical' : 'inline'"
          :class="['filter-form', { 'filter-form--single': !isMobile }]"
        >
          <a-form-item label="日期范围">
            <a-range-picker
              v-model:value="filterForm.dateRange"
              size="small"
              :style="{ width: isMobile ? '100%' : 'auto' }"
            />
          </a-form-item>
          <a-form-item label="药品名称">
            <a-input
              v-model:value="filterForm.medicineName"
              size="small"
              placeholder="请输入药品名称"
              :style="{ width: isMobile ? '100%' : '160px' }"
            />
          </a-form-item>
          <a-form-item label="用量范围">
            <div :class="['dosage-range', { 'dosage-range--nowrap': !isMobile }]">
              <a-input-number
                v-model:value="filterForm.minDosage"
                size="small"
                placeholder="最小用量"
                :min="0"
                :style="{ width: isMobile ? '100%' : '88px' }"
              />
              <span class="separator">-</span>
              <a-input-number
                v-model:value="filterForm.maxDosage"
                size="small"
                placeholder="最大用量"
                :min="0"
                :style="{ width: isMobile ? '100%' : '88px' }"
              />
            </div>
          </a-form-item>
          <a-form-item class="filter-actions">
            <a-button type="primary" size="small" @click="applyFilters">搜索</a-button>
          </a-form-item>
        </a-form>
      </a-card>

      <MedicationStats :data="filteredMedicationList" />

      <a-card class="table-card" :bordered="false">
        <a-table
          :columns="isMobile ? mobileColumns : columns"
          :data-source="filteredMedicationList"
          :pagination="{ pageSize: 10 }"
          :loading="loading"
          :scroll="{ x: isMobile ? 600 : undefined }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'date'">
              {{ formatDate(record.date) }}
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a @click="editRecord(record)">编辑</a>
                <a-popconfirm
                  title="确定要删除这条记录吗?"
                  @confirm="deleteRecordHandler(record.id)"
                >
                  <a class="text-danger">删除</a>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>

      <a-card class="summary-card" title="用药总结" :bordered="false">
        <a-row :gutter="16">
          <a-col :xs="24" :md="12">
            <div class="calendar-wrap">
              <a-calendar
                v-model:value="selectedSummaryDate"
                :fullscreen="false"
                @select="handleSummarySelect"
                @panelChange="handleSummaryPanelChange"
              >
                <template #headerRender="{ value, onChange }">
                  <div class="calendar-header">
                    <a-space size="small">
                      <a-select
                        size="small"
                        :value="value.year()"
                        style="width: 96px"
                        @change="(year) => handleCalendarYearChange(year, value, onChange)"
                      >
                        <a-select-option v-for="year in calendarYearOptions" :key="year" :value="year">
                          {{ year }}年
                        </a-select-option>
                      </a-select>
                      <a-select
                        size="small"
                        :value="value.month()"
                        style="width: 84px"
                        @change="(month) => handleCalendarMonthChange(month, value, onChange)"
                      >
                        <a-select-option v-for="monthIndex in 12" :key="monthIndex - 1" :value="monthIndex - 1">
                          <span :class="{ 'month-has-summary': monthHasSummary(monthIndex - 1) }">
                            {{ monthIndex }}月
                          </span>
                        </a-select-option>
                      </a-select>
                    </a-space>
                  </div>
                </template>
                <template #dateCellRender="{ current }">
                  <span v-if="hasSummary(current)" class="summary-marker"></span>
                </template>
              </a-calendar>
              <div v-if="savedSummaryList.length" class="summary-dates">
                <div class="summary-dates__title">本月已写（{{ savedSummaryList.length }}）</div>
                <a-list size="small" :data-source="savedSummaryList" :split="false">
                  <template #renderItem="{ item }">
                    <a-list-item class="summary-dates__item" @click="selectSummaryDate(item.date)">
                      <div class="summary-dates__date">{{ item.date }}</div>
                      <div class="summary-dates__excerpt">{{ item.excerpt }}</div>
                    </a-list-item>
                  </template>
                </a-list>
              </div>
            </div>
          </a-col>
          <a-col :xs="24" :md="12">
            <div class="summary-editor">
              <div class="summary-editor__header">
                <div class="summary-editor__title">
                  {{ selectedSummaryDate.format('YYYY-MM-DD') }}
                </div>
                <div class="summary-editor__meta">
                  当日总用量：{{ selectedDateTotal }} 颗
                </div>
              </div>
              <a-textarea
                v-model:value="selectedSummaryText"
                :rows="8"
                placeholder="可记录当天用药情况、症状变化、注意事项等"
              />
              <div class="summary-editor__actions">
                <a-button type="primary" :loading="savingSummary" @click="saveSelectedSummary">
                  保存总结
                </a-button>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑记录' : '添加记录'"
      @ok="handleOk"
      :confirmLoading="confirmLoading"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        layout="vertical"
      >
        <a-form-item label="日期" name="date">
          <a-date-picker v-model:value="formState.date" style="width: 100%" />
        </a-form-item>
        <a-form-item label="药品名称" name="medicineName">
          <a-input v-model:value="formState.medicineName" />
        </a-form-item>
        <a-row :gutter="12">
          <a-col :xs="24" :sm="8">
            <a-form-item label="早餐用量" name="breakfast">
              <a-input-number v-model:value="formState.breakfast" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="8">
            <a-form-item label="午餐用量" name="lunch">
              <a-input-number v-model:value="formState.lunch" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="8">
            <a-form-item label="晚餐用量" name="dinner">
              <a-input-number v-model:value="formState.dinner" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <div v-if="!isEdit" class="quick-add-row">
        <a-checkbox v-model:checked="keepAdding">确定后继续添加</a-checkbox>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import Papa from 'papaparse'
import { exportToCSV } from '@/utils/export'
import { parseCSV, parseExcel } from '@/utils/import'
import { getRecords, addRecord, updateRecord, deleteRecord, getDailySummaries, saveDailySummary } from '@/api/medication'
import MedicationStats from '@/components/MedicationStats.vue'
import * as XLSX from 'xlsx'

const columns = [
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
    width: 120,
  },
  {
    title: '药品名称',
    dataIndex: 'medicine_name',
    key: 'medicine_name',
    width: 150,
  },
  {
    title: '早餐用量',
    dataIndex: 'breakfast',
    key: 'breakfast',
    width: 100,
  },
  {
    title: '午餐用量',
    dataIndex: 'lunch',
    key: 'lunch',
    width: 100,
  },
  {
    title: '晚餐用量',
    dataIndex: 'dinner',
    key: 'dinner',
    width: 100,
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
  },
]

const mobileColumns = [
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
    width: 100,
  },
  {
    title: '药品',
    dataIndex: 'medicine_name',
    key: 'medicine_name',
    width: 120,
    ellipsis: true,
  },
  {
    title: '早',
    dataIndex: 'breakfast',
    key: 'breakfast',
    width: 60,
  },
  {
    title: '午',
    dataIndex: 'lunch',
    key: 'lunch',
    width: 60,
  },
  {
    title: '晚',
    dataIndex: 'dinner',
    key: 'dinner',
    width: 60,
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
  },
]

const medicationList = ref([])
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const loading = ref(false)
const confirmLoading = ref(false)
const currentId = ref(null)
const isMobile = ref(false)
const keepAdding = ref(false)
const dailySummaryMap = ref(new Map())
const selectedSummaryDate = ref(dayjs())
const selectedSummaryText = ref('')
const savingSummary = ref(false)
const summaryPanelDate = ref(selectedSummaryDate.value)
const summaryYearMap = ref(new Map())
const summaryYearLoaded = ref(selectedSummaryDate.value.year())

// 检测移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  fetchRecords()
  fetchMonthSummaries(selectedSummaryDate.value)
  fetchYearSummaries(selectedSummaryDate.value)
})

// 移除监听
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const filterForm = reactive({
  dateRange: null,
  medicineName: '',
  minDosage: null,
  maxDosage: null
})

const filterParams = reactive({
  dateRange: null,
  medicineName: '',
  minDosage: null,
  maxDosage: null
})

const filteredMedicationList = computed(() => {
  return medicationList.value.filter(item => {
    // 日期范围筛选
    if (filterParams.dateRange) {
      const [start, end] = filterParams.dateRange
      const date = dayjs(item.date)
      if (date.isBefore(start) || date.isAfter(end)) {
        return false
      }
    }

    // 药品名称筛选
    if (filterParams.medicineName && !item.medicine_name.includes(filterParams.medicineName)) {
      return false
    }

    // 用量范围筛选
    if (filterParams.minDosage !== null) {
      if (item.breakfast < filterParams.minDosage && 
          item.lunch < filterParams.minDosage && 
          item.dinner < filterParams.minDosage) {
        return false
      }
    }
    if (filterParams.maxDosage !== null) {
      if (item.breakfast > filterParams.maxDosage && 
          item.lunch > filterParams.maxDosage && 
          item.dinner > filterParams.maxDosage) {
        return false
      }
    }

    return true
  })
})

const applyFilters = () => {
  filterParams.dateRange = filterForm.dateRange ? [...filterForm.dateRange] : null
  filterParams.medicineName = filterForm.medicineName.trim()
  filterParams.minDosage = filterForm.minDosage
  filterParams.maxDosage = filterForm.maxDosage
}

const formState = reactive({
  date: null,
  medicineName: '',
  breakfast: 0,
  lunch: 0,
  dinner: 0,
})

const rules = {
  date: [{ required: true, message: '请选择日期' }],
  medicineName: [{ required: true, message: '请输入药品名称' }],
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const fetchRecords = async () => {
  loading.value = true
  try {
    const response = await getRecords()
    medicationList.value = response.data
  } catch (error) {
    message.error('获取记录失败')
  } finally {
    loading.value = false
  }
}

const totalsByDate = computed(() => {
  const map = new Map()
  for (const item of medicationList.value) {
    const dateKey = dayjs(item.date).format('YYYY-MM-DD')
    const current = map.get(dateKey) || 0
    map.set(dateKey, current + item.breakfast + item.lunch + item.dinner)
  }
  return map
})

const selectedDateKey = computed(() => selectedSummaryDate.value.format('YYYY-MM-DD'))

const selectedDateTotal = computed(() => totalsByDate.value.get(selectedDateKey.value) || 0)

const fetchMonthSummaries = async (panelDate) => {
  try {
    summaryPanelDate.value = panelDate
    const monthStart = dayjs(panelDate).startOf('month')
    const monthEnd = dayjs(panelDate).endOf('month')
    const start = monthStart.format('YYYY-MM-DD')
    const end = monthEnd.format('YYYY-MM-DD')
    const response = await getDailySummaries({ start, end })
    const map = new Map()
    for (const row of response.data || []) {
      const dateKey = dayjs(row.date).format('YYYY-MM-DD')
      map.set(dateKey, row.summary || '')
    }
    dailySummaryMap.value = map
    selectedSummaryText.value = map.get(selectedDateKey.value) || ''
  } catch (error) {
    message.error('获取总结失败')
  }
}

const fetchYearSummaries = async (panelDate) => {
  try {
    const year = dayjs(panelDate).year()
    summaryYearLoaded.value = year
    const start = dayjs(panelDate).startOf('year').format('YYYY-MM-DD')
    const end = dayjs(panelDate).endOf('year').format('YYYY-MM-DD')
    const response = await getDailySummaries({ start, end })
    const map = new Map()
    for (const row of response.data || []) {
      const dateKey = dayjs(row.date).format('YYYY-MM-DD')
      const summary = (row.summary || '').trim()
      if (summary.length) {
        map.set(dateKey, summary)
      }
    }
    summaryYearMap.value = map
  } catch (error) {
    message.error('获取年度总结失败')
  }
}

const handleSummarySelect = (date) => {
  selectedSummaryDate.value = date
  selectedSummaryText.value = dailySummaryMap.value.get(date.format('YYYY-MM-DD')) || ''
  if (!date.isSame(summaryPanelDate.value, 'month')) {
    fetchMonthSummaries(date)
  }
  if (date.year() !== summaryYearLoaded.value) {
    fetchYearSummaries(date)
  }
}

const handleSummaryPanelChange = (date) => {
  fetchMonthSummaries(date)
  if (date.year() !== summaryYearLoaded.value) {
    fetchYearSummaries(date)
  }
}

const hasSummary = (date) => {
  const dateKey = dayjs(date).format('YYYY-MM-DD')
  const monthSummary = dailySummaryMap.value.get(dateKey)
  if (typeof monthSummary === 'string' && monthSummary.trim().length > 0) return true
  const yearSummary = summaryYearMap.value.get(dateKey)
  return typeof yearSummary === 'string' && yearSummary.trim().length > 0
}

const monthHasSummary = (monthIndex) => {
  const year = summaryYearLoaded.value
  const monthKeyPrefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}-`
  for (const dateKey of summaryYearMap.value.keys()) {
    if (dateKey.startsWith(monthKeyPrefix)) return true
  }
  return false
}

const calendarYearOptions = computed(() => {
  const current = summaryYearLoaded.value
  return [current - 2, current - 1, current, current + 1, current + 2]
})

const handleCalendarYearChange = (year, value, onChange) => {
  const next = dayjs(value).year(year)
  onChange(next)
  fetchMonthSummaries(next)
  fetchYearSummaries(next)
}

const handleCalendarMonthChange = (month, value, onChange) => {
  const next = dayjs(value).month(month)
  onChange(next)
  fetchMonthSummaries(next)
}

const savedSummaryList = computed(() => {
  return Array.from(dailySummaryMap.value.entries())
    .map(([date, summary]) => ({ date, summary: summary || '' }))
    .filter(item => item.summary.trim().length > 0)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(item => ({
      date: item.date,
      excerpt: item.summary.trim().replace(/\s+/g, ' ').slice(0, 20)
    }))
})

const selectSummaryDate = (date) => {
  const next = dayjs(date)
  selectedSummaryDate.value = next
  selectedSummaryText.value = dailySummaryMap.value.get(next.format('YYYY-MM-DD')) || ''
}

const saveSelectedSummary = async () => {
  try {
    savingSummary.value = true
    const dateKey = selectedDateKey.value
    const summary = selectedSummaryText.value || ''
    await saveDailySummary(dateKey, summary)
    if (summary.trim().length > 0) {
      dailySummaryMap.value.set(dateKey, summary)
    } else {
      dailySummaryMap.value.delete(dateKey)
    }
    message.success('总结已保存')
  } catch (error) {
    message.error('保存失败')
  } finally {
    savingSummary.value = false
  }
}

const showAddModal = () => {
  isEdit.value = false
  currentId.value = null
  formState.date = null
  formState.medicineName = ''
  formState.breakfast = 0
  formState.lunch = 0
  formState.dinner = 0
  modalVisible.value = true
}

const editRecord = (record) => {
  isEdit.value = true
  currentId.value = record.id
  formState.date = dayjs(record.date)
  formState.medicineName = record.medicine_name
  formState.breakfast = record.breakfast
  formState.lunch = record.lunch
  formState.dinner = record.dinner
  modalVisible.value = true
}

const handleOk = async () => {
  try {
    await formRef.value.validate()
    confirmLoading.value = true
    
    const data = {
      date: formState.date.format('YYYY-MM-DD'),
      medicineName: formState.medicineName,
      breakfast: formState.breakfast,
      lunch: formState.lunch,
      dinner: formState.dinner
    }

    if (isEdit.value) {
      await updateRecord(currentId.value, data)
      message.success('更新成功')
    } else {
      await addRecord(data)
      message.success('添加成功')
    }

    await fetchRecords()

    if (!isEdit.value && keepAdding.value) {
      formState.medicineName = ''
      formState.breakfast = 0
      formState.lunch = 0
      formState.dinner = 0
      formRef.value?.clearValidate?.()
      return
    }

    modalVisible.value = false
  } catch (error) {
    console.error('操作失败:', error)
    message.error('操作失败')
  } finally {
    confirmLoading.value = false
  }
}

const deleteRecordHandler = async (id) => {
  try {
    await deleteRecord(id)
    message.success('删除成功')
    fetchRecords()
  } catch (error) {
    message.error('删除失败')
  }
}

const exportData = () => {
  const headers = ['日期', '药品名称', '早餐用量', '午餐用量', '晚餐用量']
  const data = medicationList.value.map(item => ({
    日期: formatDate(item.date),
    药品名称: item.medicine_name,
    早餐用量: item.breakfast,
    午餐用量: item.lunch,
    晚餐用量: item.dinner
  }))
  exportToCSV(data, 'medication_records.csv', headers)
}

const downloadTemplate = () => {
  // 创建Excel工作簿
  const wb = XLSX.utils.book_new()
  
  // 创建工作表数据（只包含表头和数据行）
  const wsData = [
    ['date', 'medicineName', 'breakfast', 'lunch', 'dinner'],
    ['2023-01-01', '示例药品', 1, 1, 1],
    ['2023-01-02', '另一个药品', 2, 0, 1]
  ]
  
  // 将数据转换为工作表
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  
  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(wb, ws, '药品记录')
  
  // 生成Excel文件并下载
  XLSX.writeFile(wb, 'medication_template.xlsx')
  
  message.success('Excel模板下载成功！')
}

const beforeUpload = (file) => {
  const fileExtension = file.name.split('.').pop().toLowerCase()
  
  if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    // 处理Excel文件
    parseExcel(file, async (data) => {
      try {
        console.log('解析的Excel数据:', data) // 调试信息
        
        for (const item of data) {
          console.log('处理的数据项:', item) // 调试信息
          
          // 兼容中英文字段名
          const dateValue = item.date || item.日期
          const medicineNameValue = item.medicineName || item.药品名称
          const breakfastValue = item.breakfast || item.早餐用量
          const lunchValue = item.lunch || item.午餐用量
          const dinnerValue = item.dinner || item.晚餐用量
          
          // 验证日期字段
          if (!dateValue) {
            message.error(`导入失败：日期字段不能为空`)
            return
          }
          
          // 转换日期格式，确保是YYYY-MM-DD格式
          const dateObj = dayjs(dateValue)
          if (!dateObj.isValid()) {
            message.error(`导入失败：日期格式不正确 - ${dateValue}`)
            return
          }
          
          await addRecord({
            date: dateObj.format('YYYY-MM-DD'),
            medicineName: medicineNameValue || '',
            breakfast: parseInt(breakfastValue) || 0,
            lunch: parseInt(lunchValue) || 0,
            dinner: parseInt(dinnerValue) || 0
          })
        }
        message.success('Excel导入成功')
        fetchRecords()
      } catch (error) {
        console.error('Excel导入失败:', error)
        message.error('Excel导入失败：' + (error.response?.data?.error || error.message))
      }
    })
  } else {
    // 处理CSV文件
    parseCSV(file, async (data) => {
      try {
        console.log('解析的CSV数据:', data) // 调试信息
        
        for (const item of data) {
          console.log('处理的数据项:', item) // 调试信息
          
          // 兼容中英文字段名
          const dateValue = item.date || item.日期
          const medicineNameValue = item.medicineName || item.药品名称
          const breakfastValue = item.breakfast || item.早餐用量
          const lunchValue = item.lunch || item.午餐用量
          const dinnerValue = item.dinner || item.晚餐用量
          
          // 验证日期字段
          if (!dateValue) {
            message.error(`导入失败：日期字段不能为空`)
            return
          }
          
          // 转换日期格式，确保是YYYY-MM-DD格式
          const dateObj = dayjs(dateValue)
          if (!dateObj.isValid()) {
            message.error(`导入失败：日期格式不正确 - ${dateValue}`)
            return
          }
          
          await addRecord({
            date: dateObj.format('YYYY-MM-DD'),
            medicineName: medicineNameValue || '',
            breakfast: parseInt(breakfastValue) || 0,
            lunch: parseInt(lunchValue) || 0,
            dinner: parseInt(dinnerValue) || 0
          })
        }
        message.success('CSV导入成功')
        fetchRecords()
      } catch (error) {
        console.error('CSV导入失败:', error)
        message.error('CSV导入失败：' + (error.response?.data?.error || error.message))
      }
    })
  }
  return false
}


</script>

<style scoped>
.home {
  padding: 20px;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 24px;
}

.filter-card {
  padding: 12px 14px;
}

.table-card {
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.filter-card {
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.summary-card {
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.calendar-wrap :deep(.ant-picker-calendar) {
  background: #fff;
  border-radius: 10px;
}

.calendar-wrap :deep(.summary-marker) {
  display: none;
}

.calendar-wrap :deep(.ant-picker-cell:not(.ant-picker-cell-selected) .ant-picker-cell-inner:has(.summary-marker) .ant-picker-calendar-date-value) {
  color: #ff4d4f;
  font-weight: 600;
}

.calendar-header {
  display: flex;
  justify-content: flex-end;
  padding: 4px 8px 0;
}

.month-has-summary {
  color: #ff4d4f;
  font-weight: 600;
}

.summary-dates {
  margin-top: 12px;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.summary-dates__title {
  font-weight: 600;
  color: #262626;
  margin-bottom: 8px;
}

.summary-dates__item {
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
}

.summary-dates__item:hover {
  background: rgba(22, 119, 255, 0.06);
}

.summary-dates__date {
  font-weight: 600;
  color: #262626;
}

.summary-dates__excerpt {
  color: #8c8c8c;
  font-size: 12px;
  margin-top: 2px;
  padding-right: 4px;
}

.summary-editor {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 12px;
  height: 100%;
}

.summary-editor__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.summary-editor__title {
  font-weight: 600;
  color: #262626;
}

.summary-editor__meta {
  color: #8c8c8c;
  font-size: 12px;
  white-space: nowrap;
}

.summary-editor__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.quick-add-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.filter-form {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-form--single {
  flex-wrap: nowrap;
}

.filter-card :deep(.ant-form-item) {
  margin-right: 12px;
  margin-bottom: 8px;
}

.filter-card :deep(.ant-form-item:last-child) {
  margin-right: 0;
}

.filter-actions {
  margin-left: auto;
  margin-right: 0;
}

.dosage-range {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.dosage-range--nowrap {
  flex-wrap: nowrap;
}

.separator {
  margin: 0 8px;
  color: #d9d9d9;
}

.text-danger {
  color: #ff4d4f;
}

@media (max-width: 1200px) {
  .filter-form--single {
    flex-wrap: wrap;
  }

  .filter-actions {
    margin-left: 0;
  }
}

@media (max-width: 992px) {
  .filter-card {
    padding: 10px 12px;
  }

  .filter-card :deep(.ant-form-item) {
    margin-right: 8px;
  }
}

@media (max-width: 768px) {
  .filter-form {
    width: 100%;
  }

  .filter-card :deep(.ant-form-item) {
    width: 100%;
    margin-right: 0;
  }

  .filter-actions :deep(.ant-form-item-control) {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
