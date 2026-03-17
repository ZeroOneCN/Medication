<template>
  <div class="purchase-view">
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-title">
          <h1>药品购买记录</h1>
          <p>记录每次药品购买的数量、渠道、价格等信息</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" @click="showAddModal">
            <PlusOutlined />
            <span>添加记录</span>
          </button>
          <button class="btn btn-secondary" @click="exportData">导出数据</button>
        </div>
      </div>
    </div>

    <div class="page-content">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon stat-icon--blue">
            <ShoppingCartOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-label">购买次数</div>
            <div class="stat-value">{{ stats.totalRecords }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--green">
            <ToolOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-label">总数量</div>
            <div class="stat-value">{{ stats.totalQuantity }} {{ defaultUnit }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--purple">
            <DollarOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-label">总花费</div>
            <div class="stat-value">¥{{ stats.totalAmount?.toFixed(2) }}</div>
          </div>
        </div>
      </div>

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
          <div class="filter-actions">
            <button class="btn btn-primary btn-sm" @click="applyFilters">搜索</button>
            <button class="btn btn-secondary btn-sm" @click="resetFilters">重置</button>
          </div>
        </div>
      </div>

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
                <th>购买日期</th>
                <th>药品名称</th>
                <th>数量</th>
                <th>单位</th>
                <th>单价</th>
                <th>总价</th>
                <th>购买渠道</th>
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
                <td>{{ formatDate(item.purchase_date) }}</td>
                <td>{{ item.medicine_name }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.unit }}</td>
                <td>¥{{ parseFloat(item.unit_price).toFixed(2) }}</td>
                <td>¥{{ parseFloat(item.total_price).toFixed(2) }}</td>
                <td>{{ item.channel || '-' }}</td>
                <td class="col-action">
                  <button class="btn-link" @click="editRecord(item)">编辑</button>
                  <button class="btn-link btn-link--danger" @click="confirmDelete(item.id)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="filteredPurchaseList.length === 0" class="empty-state">
            暂无数据
          </div>
        </div>
        <div v-if="filteredPurchaseList.length > pageSize" class="card-footer">
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
    </div>

    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑记录' : '添加记录'"
      @ok="handleOk"
      :confirm-loading="confirmLoading"
      width="700px"
    >
      <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="购买日期" name="purchaseDate">
              <a-date-picker v-model:value="formState.purchaseDate" style="width: 100%" size="large" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="药品名称" name="medicineName">
              <a-auto-complete
                v-model:value="formState.medicineName"
                :options="medicineOptions"
                placeholder="选择或输入药品名称"
                size="large"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="数量" name="quantity">
              <a-input-number v-model:value="formState.quantity" :min="0" style="width: 100%" size="large" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="单位" name="unit">
              <a-select v-model:value="formState.unit" size="large" style="width: 100%">
                <a-select-option value="盒">盒</a-select-option>
                <a-select-option value="瓶">瓶</a-select-option>
                <a-select-option value="支">支</a-select-option>
                <a-select-option value="袋">袋</a-select-option>
                <a-select-option value="板">板</a-select-option>
                <a-select-option value="粒">粒</a-select-option>
                <a-select-option value="其他">其他</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="购买渠道" name="channel">
              <a-select v-model:value="formState.channel" placeholder="选择购买渠道" size="large" style="width: 100%">
                <a-select-option value="药店">药店</a-select-option>
                <a-select-option value="京东">京东</a-select-option>
                <a-select-option value="淘宝">淘宝</a-select-option>
                <a-select-option value="拼多多">拼多多</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="单价 (元)" name="unitPrice">
              <a-input-number v-model:value="formState.unitPrice" :min="0" :step="0.1" style="width: 100%" size="large" @change="calculateTotal" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="总价 (元)" name="totalPrice">
              <a-input-number v-model:value="formState.totalPrice" :min="0" :step="0.1" style="width: 100%" size="large" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="备注" name="notes">
          <a-textarea v-model:value="formState.notes" placeholder="可选" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined, ShoppingCartOutlined, ToolOutlined, DollarOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import {
  getPurchaseRecords, addPurchaseRecord, updatePurchaseRecord, deletePurchaseRecord,
  getPurchaseStats, batchDeletePurchaseRecords
} from '@/api/purchase'
import { useMedicineStore } from '@/stores'
import * as XLSX from 'xlsx'

const medicineStore = useMedicineStore()

const purchaseList = ref([])
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const loading = ref(false)
const confirmLoading = ref(false)
const currentId = ref(null)
const stats = ref({ totalRecords: 0, totalQuantity: 0, totalAmount: 0, channelStats: [], medicineStats: [] })
const defaultUnit = ref('盒')

const selectedRowKeys = ref([])
const selectAll = ref(false)
const currentPage = ref(1)
const pageSize = 10

const indeterminate = computed(() => {
  return selectedRowKeys.value.length > 0 && selectedRowKeys.value.length < filteredPurchaseList.value.length
})

const totalPages = computed(() => Math.ceil(filteredPurchaseList.value.length / pageSize))

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredPurchaseList.value.slice(start, start + pageSize)
})

const toggleSelect = (id) => {
  const index = selectedRowKeys.value.indexOf(id)
  if (index > -1) {
    selectedRowKeys.value.splice(index, 1)
  } else {
    selectedRowKeys.value.push(id)
  }
  selectAll.value = selectedRowKeys.value.length === filteredPurchaseList.value.length
}

const handleSelectAll = (e) => {
  if (e.target.checked) {
    selectedRowKeys.value = filteredPurchaseList.value.map(item => item.id)
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
        await batchDeletePurchaseRecords(selectedRowKeys.value)
        message.success(`成功删除 ${selectedRowKeys.value.length} 条记录`)
        selectedRowKeys.value = []
        selectAll.value = false
        fetchRecords()
        fetchStats()
      } catch (error) {
        message.error('批量删除失败')
      }
    }
  })
}

const medicineOptions = computed(() => medicineStore.medicineOptions)

onMounted(() => {
  fetchRecords()
  fetchStats()
  medicineStore.fetchMedicines()
})

const filterForm = reactive({
  dateRange: null,
  medicineName: '',
  channel: ''
})

const filterParams = reactive({
  dateRange: null,
  medicineName: '',
  channel: ''
})

const filteredPurchaseList = computed(() => {
  return purchaseList.value.filter(item => {
    if (filterParams.dateRange) {
      const [start, end] = filterParams.dateRange
      const date = dayjs(item.purchase_date)
      if (date.isBefore(start) || date.isAfter(end)) return false
    }
    if (filterParams.medicineName && !item.medicine_name.includes(filterParams.medicineName)) {
      return false
    }
    return true
  })
})

const applyFilters = () => {
  filterParams.dateRange = filterForm.dateRange ? [...filterForm.dateRange] : null
  filterParams.medicineName = filterForm.medicineName.trim()
  filterParams.channelType = filterForm.channelType
  currentPage.value = 1
}

const resetFilters = () => {
  filterForm.dateRange = null
  filterForm.medicineName = ''
  filterForm.channel = ''
  filterParams.dateRange = null
  filterParams.medicineName = ''
  filterParams.channel = ''
  currentPage.value = 1
}

const formState = reactive({
  purchaseDate: dayjs(),
  medicineName: '',
  quantity: 1,
  unit: '盒',
  unitPrice: 0,
  totalPrice: 0,
  channel: '药店',
  notes: ''
})

const rules = {
  purchaseDate: [{ required: true, message: '请选择购买日期' }],
  medicineName: [{ required: true, message: '请输入药品名称' }],
  quantity: [{ required: true, message: '请输入数量' }],
  unitPrice: [{ required: true, message: '请输入单价' }],
  totalPrice: [{ required: true, message: '请输入总价' }]
}

const formatDate = (date) => dayjs(date).format('YYYY-MM-DD')

const fetchRecords = async () => {
  loading.value = true
  try {
    const response = await getPurchaseRecords()
    purchaseList.value = response.data
  } catch (error) {
    message.error('获取记录失败')
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const response = await getPurchaseStats()
    stats.value = response.data
  } catch (error) {
    console.error('获取统计失败')
  }
}

const calculateTotal = () => {
  if (formState.quantity && formState.unitPrice) {
    formState.totalPrice = parseFloat((formState.quantity * formState.unitPrice).toFixed(2))
  }
}

const showAddModal = () => {
  isEdit.value = false
  currentId.value = null
  formState.purchaseDate = dayjs()
  formState.medicineName = ''
  formState.quantity = 1
  formState.unit = '盒'
  formState.unitPrice = 0
  formState.totalPrice = 0
  formState.channel = ''
  formState.channelType = '药店'
  formState.notes = ''
  modalVisible.value = true
}

const editRecord = (record) => {
  isEdit.value = true
  currentId.value = record.id
  formState.purchaseDate = dayjs(record.purchase_date)
  formState.medicineName = record.medicine_name
  formState.quantity = parseInt(record.quantity)
  formState.unit = record.unit || '盒'
  formState.unitPrice = parseFloat(record.unit_price)
  formState.totalPrice = parseFloat(record.total_price)
  formState.channel = record.channel || '药店'
  formState.notes = record.notes || ''
  modalVisible.value = true
}

const handleOk = async () => {
  try {
    await formRef.value.validate()
    confirmLoading.value = true

    const data = {
      purchaseDate: formState.purchaseDate.format('YYYY-MM-DD'),
      medicineName: formState.medicineName,
      quantity: formState.quantity,
      unit: formState.unit,
      unitPrice: parseFloat(formState.unitPrice),
      totalPrice: parseFloat(formState.totalPrice),
      channel: formState.channel,
      notes: formState.notes
    }

    if (isEdit.value) {
      await updatePurchaseRecord(currentId.value, data)
      message.success('更新成功')
    } else {
      await addPurchaseRecord(data)
      message.success('添加成功')
    }

    await fetchRecords()
    await fetchStats()

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
    await deletePurchaseRecord(id)
    message.success('删除成功')
    fetchRecords()
    fetchStats()
  } catch (error) {
    message.error('删除失败')
  }
}

const exportData = () => {
  const data = purchaseList.value.map(item => ({
    购买日期: formatDate(item.purchase_date),
    药品名称: item.medicine_name,
    数量: item.quantity,
    单位: item.unit,
    单价: parseFloat(item.unit_price).toFixed(2),
    总价: parseFloat(item.total_price).toFixed(2),
    购买渠道: item.channel || '-',
    备注: item.notes || ''
  }))
  
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '购买记录')
  XLSX.writeFile(wb, 'medicine_purchase_records.xlsx')
  message.success('导出成功')
}
</script>

<style scoped>
.purchase-view {
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

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-icon--blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon--green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.stat-icon--purple {
  background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 100%);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-1);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-text);
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
</style>
