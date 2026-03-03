<template>
  <div class="home-view">
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-title">
          <h1>药品记录</h1>
          <p>记录每日用药情况</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" @click="showAddModal">
            <PlusOutlined />
            <span>添加记录</span>
          </button>
          <button class="btn btn-secondary" @click="exportData">导出数据</button>
          <button class="btn btn-secondary" @click="downloadTemplate">下载模板</button>
          <label class="btn btn-secondary">
            <input type="file" accept=".csv,.xlsx,.xls" @change="handleFileSelect" hidden />
            导入数据
          </label>
        </div>
      </div>
    </div>

    <div class="page-content">
      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-item">
            <label>日期范围</label>
            <a-range-picker v-model:value="filterForm.dateRange" size="large" />
          </div>
          <div class="filter-item">
            <label>药品名称</label>
            <input 
              v-model="filterForm.medicineName" 
              type="text" 
              placeholder="输入药品名称"
              class="input"
            />
          </div>
          <div class="filter-item filter-item--dosage">
            <label>用量范围</label>
            <div class="dosage-inputs">
              <input 
                v-model.number="filterForm.minDosage" 
                type="number" 
                placeholder="最小"
                class="input"
              />
              <span class="dosage-separator">-</span>
              <input 
                v-model.number="filterForm.maxDosage" 
                type="number" 
                placeholder="最大"
                class="input"
              />
            </div>
          </div>
          <div class="filter-actions">
            <button class="btn btn-primary btn-sm" @click="applyFilters">搜索</button>
            <button class="btn btn-secondary btn-sm" @click="resetFilters">重置</button>
          </div>
        </div>
      </div>

      <MedicationStats :data="filteredMedicationList" />

      <div class="card">
        <div class="card-header">
          <div class="card-header-left">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                :checked="selectAll" 
                :indeterminate="indeterminate"
                @change="handleSelectAll"
              />
              <span>全选</span>
            </label>
            <span v-if="selectedRowKeys.length > 0" class="selected-count">
              已选 {{ selectedRowKeys.length }} 项
            </span>
          </div>
          <div class="card-header-right">
            <button 
              v-if="selectedRowKeys.length > 0"
              class="btn btn-danger btn-sm"
              @click="batchDeleteHandler"
            >
              批量删除
            </button>
          </div>
        </div>
        <div class="card-body card-body--no-padding">
          <table class="data-table">
            <thead>
              <tr>
                <th class="col-checkbox"></th>
                <th>日期</th>
                <th>药品名称</th>
                <th>早餐</th>
                <th>午餐</th>
                <th>晚餐</th>
                <th class="col-action">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in paginatedList" :key="item.id">
                <td class="col-checkbox">
                  <input 
                    type="checkbox" 
                    :checked="selectedRowKeys.includes(item.id)"
                    @change="toggleSelect(item.id)"
                  />
                </td>
                <td>{{ formatDate(item.date) }}</td>
                <td>{{ item.medicine_name }}</td>
                <td>{{ item.breakfast }}</td>
                <td>{{ item.lunch }}</td>
                <td>{{ item.dinner }}</td>
                <td class="col-action">
                  <button class="btn-link" @click="editRecord(item)">编辑</button>
                  <button class="btn-link btn-link--danger" @click="confirmDelete(item.id)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="filteredMedicationList.length === 0" class="empty-state">
            暂无数据
          </div>
        </div>
        <div v-if="filteredMedicationList.length > pageSize" class="card-footer">
          <div class="pagination">
            <button 
              class="btn btn-secondary btn-sm"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              上一页
            </button>
            <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
            <button 
              class="btn btn-secondary btn-sm"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <EditOutlined />
            用药总结
          </h3>
        </div>
        <div class="card-body">
          <div class="summary-grid">
            <div class="summary-calendar">
              <a-calendar
                v-model:value="selectedSummaryDate"
                :fullscreen="false"
                @select="handleSummarySelect"
                @panelChange="handleSummaryPanelChange"
              />
              <div v-if="savedSummaryList.length" class="summary-list">
                <div class="summary-list-title">本月已写（{{ savedSummaryList.length }}）</div>
                <div 
                  v-for="item in savedSummaryList" 
                  :key="item.date"
                  class="summary-list-item"
                  @click="selectSummaryDate(item.date)"
                >
                  <span class="summary-list-date">{{ item.date }}</span>
                  <span class="summary-list-excerpt">{{ item.excerpt }}</span>
                </div>
              </div>
            </div>
            <div class="summary-editor">
              <div class="summary-editor-header">
                <span class="summary-date">{{ selectedSummaryDate.format('YYYY-MM-DD') }}</span>
                <span class="summary-total">当日总用量：{{ selectedDateTotal }} 颗</span>
              </div>
              <textarea 
                v-model="selectedSummaryText"
                class="textarea"
                placeholder="可记录当天用药情况、症状变化、注意事项等"
                rows="8"
              ></textarea>
              <div class="summary-editor-actions">
                <button 
                  class="btn btn-primary"
                  :disabled="savingSummary"
                  @click="saveSelectedSummary"
                >
                  {{ savingSummary ? '保存中...' : '保存总结' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑记录' : '添加记录'"
      @ok="handleOk"
      :confirm-loading="confirmLoading"
    >
      <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical">
        <a-form-item label="日期" name="date">
          <a-date-picker v-model:value="formState.date" style="width: 100%" size="large" />
        </a-form-item>
        <a-form-item label="药品名称" name="medicineName">
          <a-auto-complete
            v-model:value="formState.medicineName"
            :options="medicineOptions"
            placeholder="选择或输入药品名称"
            size="large"
          />
        </a-form-item>
        <div class="form-row">
          <div class="form-col">
            <a-form-item label="早餐用量" name="breakfast">
              <a-input-number v-model:value="formState.breakfast" :min="0" style="width: 100%" size="large" />
            </a-form-item>
          </div>
          <div class="form-col">
            <a-form-item label="午餐用量" name="lunch">
              <a-input-number v-model:value="formState.lunch" :min="0" style="width: 100%" size="large" />
            </a-form-item>
          </div>
          <div class="form-col">
            <a-form-item label="晚餐用量" name="dinner">
              <a-input-number v-model:value="formState.dinner" :min="0" style="width: 100%" size="large" />
            </a-form-item>
          </div>
        </div>
      </a-form>
      <div v-if="!isEdit" class="form-footer">
        <label class="checkbox-label">
          <input type="checkbox" v-model="keepAdding" />
          <span>确定后继续添加</span>
        </label>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined, EditOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { exportToCSV } from '@/utils/export'
import { parseCSV, parseExcel } from '@/utils/import'
import { 
  getRecords, addRecord, updateRecord, deleteRecord, 
  getDailySummaries, saveDailySummary, batchDeleteRecords
} from '@/api/medication'
import MedicationStats from '@/components/MedicationStats.vue'
import { useMedicineStore } from '@/stores'
import * as XLSX from 'xlsx'

const medicineStore = useMedicineStore()

const medicationList = ref([])
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const loading = ref(false)
const confirmLoading = ref(false)
const currentId = ref(null)
const keepAdding = ref(false)
const dailySummaryMap = ref(new Map())
const selectedSummaryDate = ref(dayjs())
const selectedSummaryText = ref('')
const savingSummary = ref(false)
const summaryPanelDate = ref(selectedSummaryDate.value)
const summaryYearMap = ref(new Map())

const selectedRowKeys = ref([])
const selectAll = ref(false)
const currentPage = ref(1)
const pageSize = 10

const indeterminate = computed(() => {
  return selectedRowKeys.value.length > 0 && selectedRowKeys.value.length < filteredMedicationList.value.length
})

const totalPages = computed(() => Math.ceil(filteredMedicationList.value.length / pageSize))

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredMedicationList.value.slice(start, start + pageSize)
})

const toggleSelect = (id) => {
  const index = selectedRowKeys.value.indexOf(id)
  if (index > -1) {
    selectedRowKeys.value.splice(index, 1)
  } else {
    selectedRowKeys.value.push(id)
  }
  selectAll.value = selectedRowKeys.value.length === filteredMedicationList.value.length
}

const handleSelectAll = (e) => {
  if (e.target.checked) {
    selectedRowKeys.value = filteredMedicationList.value.map(item => item.id)
  } else {
    selectedRowKeys.value = []
  }
}

const batchDeleteHandler = () => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 条记录吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await batchDeleteRecords(selectedRowKeys.value)
        message.success(`成功删除 ${selectedRowKeys.value.length} 条记录`)
        selectedRowKeys.value = []
        selectAll.value = false
        fetchRecords()
      } catch (error) {
        message.error('批量删除失败')
      }
    }
  })
}

const medicineOptions = computed(() => medicineStore.medicineOptions)

onMounted(() => {
  fetchRecords()
  fetchMonthSummaries(selectedSummaryDate.value)
  fetchYearSummaries(selectedSummaryDate.value)
  medicineStore.fetchMedicines()
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
    if (filterParams.dateRange) {
      const [start, end] = filterParams.dateRange
      const date = dayjs(item.date)
      if (date.isBefore(start) || date.isAfter(end)) return false
    }
    if (filterParams.medicineName && !item.medicine_name.includes(filterParams.medicineName)) {
      return false
    }
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
  currentPage.value = 1
}

const resetFilters = () => {
  filterForm.dateRange = null
  filterForm.medicineName = ''
  filterForm.minDosage = null
  filterForm.maxDosage = null
  filterParams.dateRange = null
  filterParams.medicineName = ''
  filterParams.minDosage = null
  filterParams.maxDosage = null
  currentPage.value = 1
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

const formatDate = (date) => dayjs(date).format('YYYY-MM-DD')

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
    const start = dayjs(panelDate).startOf('year').format('YYYY-MM-DD')
    const end = dayjs(panelDate).endOf('year').format('YYYY-MM-DD')
    const response = await getDailySummaries({ start, end })
    const map = new Map()
    for (const row of response.data || []) {
      const dateKey = dayjs(row.date).format('YYYY-MM-DD')
      const summary = (row.summary || '').trim()
      if (summary.length) map.set(dateKey, summary)
    }
    summaryYearMap.value = map
  } catch (error) {
    console.error('获取年度总结失败')
  }
}

const handleSummarySelect = (date) => {
  selectedSummaryDate.value = date
  selectedSummaryText.value = dailySummaryMap.value.get(date.format('YYYY-MM-DD')) || ''
  if (!date.isSame(summaryPanelDate.value, 'month')) fetchMonthSummaries(date)
}

const handleSummaryPanelChange = (date) => {
  fetchMonthSummaries(date)
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
  formState.date = dayjs()
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

const confirmDelete = (id) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这条记录吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: () => deleteRecordHandler(id)
  })
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
  const data = medicationList.value.map(item => ({
    日期: formatDate(item.date),
    药品名称: item.medicine_name,
    早餐用量: item.breakfast,
    午餐用量: item.lunch,
    晚餐用量: item.dinner
  }))
  exportToCSV(data, 'medication_records.csv')
}

const downloadTemplate = () => {
  const wb = XLSX.utils.book_new()
  const wsData = [
    ['date', 'medicineName', 'breakfast', 'lunch', 'dinner'],
    ['2023-01-01', '示例药品', 1, 1, 1]
  ]
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  XLSX.utils.book_append_sheet(wb, ws, '药品记录')
  XLSX.writeFile(wb, 'medication_template.xlsx')
  message.success('模板下载成功')
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  const ext = file.name.split('.').pop().toLowerCase()
  
  if (ext === 'xlsx' || ext === 'xls') {
    parseExcel(file, async (data) => {
      try {
        for (const item of data) {
          const dateValue = item.date || item.日期
          if (!dateValue) {
            message.error('导入失败：日期字段不能为空')
            return
          }
          const dateObj = dayjs(dateValue)
          if (!dateObj.isValid()) {
            message.error(`导入失败：日期格式不正确 - ${dateValue}`)
            return
          }
          await addRecord({
            date: dateObj.format('YYYY-MM-DD'),
            medicineName: item.medicineName || item.药品名称 || '',
            breakfast: parseInt(item.breakfast || item.早餐用量) || 0,
            lunch: parseInt(item.lunch || item.午餐用量) || 0,
            dinner: parseInt(item.dinner || item.晚餐用量) || 0
          })
        }
        message.success('导入成功')
        fetchRecords()
      } catch (error) {
        message.error('导入失败')
      }
    })
  } else {
    parseCSV(file, async (data) => {
      try {
        for (const item of data) {
          const dateValue = item.date || item.日期
          if (!dateValue) {
            message.error('导入失败：日期字段不能为空')
            return
          }
          const dateObj = dayjs(dateValue)
          if (!dateObj.isValid()) {
            message.error(`导入失败：日期格式不正确 - ${dateValue}`)
            return
          }
          await addRecord({
            date: dateObj.format('YYYY-MM-DD'),
            medicineName: item.medicineName || item.药品名称 || '',
            breakfast: parseInt(item.breakfast || item.早餐用量) || 0,
            lunch: parseInt(item.lunch || item.午餐用量) || 0,
            dinner: parseInt(item.dinner || item.晚餐用量) || 0
          })
        }
        message.success('导入成功')
        fetchRecords()
      } catch (error) {
        message.error('导入失败')
      }
    })
  }
  e.target.value = ''
}
</script>

<style scoped>
.home-view {
  width: 100%;
}

.page-header {
  margin-bottom: var(--spacing-6);
}

.page-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-6);
  flex-wrap: wrap;
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

.page-actions {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.filter-section {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
  box-shadow: var(--shadow-sm);
}

.filter-row {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-6);
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.filter-item label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.filter-item--dosage {
  min-width: 220px;
}

.dosage-inputs {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.dosage-inputs .input {
  width: 100px;
}

.dosage-separator {
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
}

.filter-actions {
  display: flex;
  gap: var(--spacing-2);
  margin-left: auto;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.selected-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.col-checkbox {
  width: 50px;
}

.col-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.col-action {
  width: 120px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
}

.page-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-8);
}

.summary-calendar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.summary-list {
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-4);
}

.summary-list-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-2);
}

.summary-list-item {
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.15s ease;
}

.summary-list-item:hover {
  background: var(--color-accent);
}

.summary-list-date {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
}

.summary-list-excerpt {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-1);
  display: block;
}

.summary-editor {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.summary-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-date {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text);
}

.summary-total {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.summary-editor-actions {
  display: flex;
  justify-content: flex-end;
}

.form-row {
  display: flex;
  gap: var(--spacing-4);
  margin: 0 calc(-1 * var(--spacing-4));
}

.form-col {
  flex: 1;
  padding: 0 var(--spacing-4);
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-4);
}

@media (max-width: 1024px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header-content {
    flex-direction: column;
  }

  .page-actions {
    width: 100%;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-item {
    width: 100%;
  }

  .filter-actions {
    margin-left: 0;
    justify-content: flex-start;
  }

  .data-table {
    font-size: var(--font-size-xs);
  }
}
</style>
