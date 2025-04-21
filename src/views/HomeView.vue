<template>
  <div class="home">
    <a-page-header
      title="药品记录"
      sub-title="记录每日用药情况"
    >
      <template #extra>
        <a-button type="primary" @click="showAddModal">添加记录</a-button>
        <a-button @click="exportData">导出数据</a-button>
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
        <a-form layout="inline" :model="filterForm">
          <a-form-item label="日期范围">
            <a-range-picker
              v-model:value="filterForm.dateRange"
              @change="handleFilterChange"
            />
          </a-form-item>
          <a-form-item label="药品名称">
            <a-input
              v-model:value="filterForm.medicineName"
              placeholder="请输入药品名称"
              @change="handleFilterChange"
            />
          </a-form-item>
          <a-form-item label="用量范围">
            <a-input-number
              v-model:value="filterForm.minDosage"
              placeholder="最小用量"
              :min="0"
              @change="handleFilterChange"
            />
            <span class="separator">-</span>
            <a-input-number
              v-model:value="filterForm.maxDosage"
              placeholder="最大用量"
              :min="0"
              @change="handleFilterChange"
            />
          </a-form-item>
        </a-form>
      </a-card>

      <MedicationStats :data="filteredMedicationList" />

      <a-card class="table-card" :bordered="false">
        <a-table
          :columns="columns"
          :data-source="filteredMedicationList"
          :pagination="{ pageSize: 10 }"
          :loading="loading"
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

      <a-card class="chart-card" title="用药趋势" :bordered="false">
        <medication-chart :data="filteredMedicationList" />
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
        <a-form-item label="早餐用量" name="breakfast">
          <a-input-number v-model:value="formState.breakfast" :min="0" />
        </a-form-item>
        <a-form-item label="午餐用量" name="lunch">
          <a-input-number v-model:value="formState.lunch" :min="0" />
        </a-form-item>
        <a-form-item label="晚餐用量" name="dinner">
          <a-input-number v-model:value="formState.dinner" :min="0" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { exportToCSV } from '@/utils/export'
import { parseCSV } from '@/utils/import'
import { getRecords, addRecord, updateRecord, deleteRecord } from '@/api/medication'
import MedicationChart from '@/components/MedicationChart.vue'
import MedicationStats from '@/components/MedicationStats.vue'

const columns = [
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: '药品名称',
    dataIndex: 'medicine_name',
    key: 'medicine_name',
  },
  {
    title: '早餐用量',
    dataIndex: 'breakfast',
    key: 'breakfast',
  },
  {
    title: '午餐用量',
    dataIndex: 'lunch',
    key: 'lunch',
  },
  {
    title: '晚餐用量',
    dataIndex: 'dinner',
    key: 'dinner',
  },
  {
    title: '操作',
    key: 'action',
  },
]

const medicationList = ref([])
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const loading = ref(false)
const confirmLoading = ref(false)
const currentId = ref(null)

const filterForm = reactive({
  dateRange: null,
  medicineName: '',
  minDosage: null,
  maxDosage: null
})

const filteredMedicationList = computed(() => {
  return medicationList.value.filter(item => {
    // 日期范围筛选
    if (filterForm.dateRange) {
      const [start, end] = filterForm.dateRange
      const date = dayjs(item.date)
      if (date.isBefore(start) || date.isAfter(end)) {
        return false
      }
    }

    // 药品名称筛选
    if (filterForm.medicineName && !item.medicine_name.includes(filterForm.medicineName)) {
      return false
    }

    // 用量范围筛选
    if (filterForm.minDosage !== null) {
      if (item.breakfast < filterForm.minDosage && 
          item.lunch < filterForm.minDosage && 
          item.dinner < filterForm.minDosage) {
        return false
      }
    }
    if (filterForm.maxDosage !== null) {
      if (item.breakfast > filterForm.maxDosage && 
          item.lunch > filterForm.maxDosage && 
          item.dinner > filterForm.maxDosage) {
        return false
      }
    }

    return true
  })
})

const handleFilterChange = () => {
  // 筛选条件变化时自动更新数据
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
    
    modalVisible.value = false
    fetchRecords()
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

const beforeUpload = (file) => {
  parseCSV(file, async (data) => {
    try {
      for (const item of data) {
        await addRecord({
          date: item.日期,
          medicineName: item.药品名称,
          breakfast: parseInt(item.早餐用量),
          lunch: parseInt(item.午餐用量),
          dinner: parseInt(item.晚餐用量)
        })
      }
      message.success('导入成功')
      fetchRecords()
    } catch (error) {
      message.error('导入失败')
    }
  })
  return false
}

onMounted(() => {
  fetchRecords()
})
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
  padding: 16px;
}

.filter-card :deep(.ant-form-item) {
  margin-right: 24px;
  margin-bottom: 16px;
}

.filter-card :deep(.ant-form-item:last-child) {
  margin-right: 0;
}

.separator {
  margin: 0 8px;
  color: #d9d9d9;
}

.text-danger {
  color: #ff4d4f;
}
</style> 