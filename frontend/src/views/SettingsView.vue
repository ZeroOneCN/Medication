<template>
  <div class="settings-view">
    <div class="page-header">
      <div class="page-title">
        <h1>设置</h1>
        <p>应用配置与数据管理</p>
      </div>
    </div>

    <div class="page-content">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <InfoCircleOutlined />
            关于应用
          </h3>
        </div>
        <div class="card-body">
          <div class="about-content">
            <div class="about-item">
              <span class="about-label">应用名称</span>
              <span class="about-value">用药记录管理</span>
            </div>
            <div class="about-item">
              <span class="about-label">版本号</span>
              <span class="about-value">2.0.0</span>
            </div>
            <div class="about-item">
              <span class="about-label">功能说明</span>
              <span class="about-value">记录每日用药情况，支持数据导入导出和统计分析</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <DatabaseOutlined />
            数据操作
          </h3>
        </div>
        <div class="card-body">
          <div class="data-actions">
            <div class="data-action">
              <div class="data-action-icon data-action-icon--primary">
                <ExportOutlined />
              </div>
              <div class="data-action-content">
                <div class="data-action-title">导出数据</div>
                <div class="data-action-desc">将所有用药记录导出为CSV文件</div>
              </div>
              <button class="btn btn-primary" @click="exportData">导出</button>
            </div>
            <div class="data-action">
              <div class="data-action-icon data-action-icon--success">
                <ImportOutlined />
              </div>
              <div class="data-action-content">
                <div class="data-action-title">导入数据</div>
                <div class="data-action-desc">从CSV或Excel文件导入用药记录</div>
              </div>
              <label class="btn btn-secondary">
                <input type="file" accept=".csv,.xlsx,.xls" @change="importData" hidden />
                导入
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <DeleteOutlined />
            危险操作
          </h3>
        </div>
        <div class="card-body">
          <div class="danger-zone">
            <div class="danger-item">
              <div class="danger-content">
                <div class="danger-title">清空所有数据</div>
                <div class="danger-desc">此操作将删除所有用药记录和总结，且不可恢复</div>
              </div>
              <button class="btn btn-danger" @click="confirmClearData">清空数据</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { 
  InfoCircleOutlined, 
  DatabaseOutlined,
  ExportOutlined,
  ImportOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { getRecords, batchDeleteRecords } from '@/api/medication'
import { exportToCSV } from '@/utils/export'
import { parseCSV, parseExcel } from '@/utils/import'
import * as XLSX from 'xlsx'

const exportData = async () => {
  try {
    const response = await getRecords()
    const data = response.data.map(item => ({
      日期: dayjs(item.date).format('YYYY-MM-DD'),
      药品名称: item.medicine_name,
      早餐用量: item.breakfast,
      午餐用量: item.lunch,
      晚餐用量: item.dinner
    }))
    exportToCSV(data, `medication_records_${dayjs().format('YYYYMMDD')}.csv`)
    message.success('导出成功')
  } catch (error) {
    message.error('导出失败')
  }
}

const importData = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  const ext = file.name.split('.').pop().toLowerCase()
  
  if (ext === 'xlsx' || ext === 'xls') {
    parseExcel(file, async (data) => {
      try {
        message.info(`发现 ${data.length} 条记录，请使用首页的导入功能`)
      } catch (error) {
        message.error('导入失败')
      }
    })
  } else {
    parseCSV(file, async (data) => {
      try {
        message.info(`发现 ${data.length} 条记录，请使用首页的导入功能`)
      } catch (error) {
        message.error('导入失败')
      }
    })
  }
  e.target.value = ''
}

const confirmClearData = () => {
  Modal.confirm({
    title: '确认清空',
    content: '确定要清空所有数据吗？此操作不可恢复！',
    okText: '确定',
    cancelText: '取消',
    okButtonProps: { danger: true },
    onOk: async () => {
      try {
        const response = await getRecords()
        const ids = response.data.map(r => r.id)
        if (ids.length > 0) await batchDeleteRecords(ids)
        message.success('数据已清空')
      } catch (error) {
        message.error('清空失败')
      }
    }
  })
}
</script>

<style scoped>
.settings-view {
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

.about-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.about-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.about-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.about-value {
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.data-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.data-action {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-bg);
  border-radius: var(--radius-md);
}

.data-action-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  flex-shrink: 0;
}

.data-action-icon--primary { 
  background: hsl(var(--primary) / 0.1); 
  color: var(--color-primary); 
}

.data-action-icon--success { 
  background: hsl(142.1 76% 36% / 0.1); 
  color: var(--color-success); 
}

.data-action-content { 
  flex: 1; 
  min-width: 0;
}

.data-action-title { 
  font-weight: 600; 
  font-size: var(--font-size-base);
  color: var(--color-text); 
}

.data-action-desc { 
  font-size: var(--font-size-sm); 
  color: var(--color-text-secondary); 
  margin-top: var(--spacing-1); 
}

.danger-zone {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.danger-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4);
  background: hsl(var(--destructive) / 0.05);
  border: 1px solid hsl(var(--destructive) / 0.2);
  border-radius: var(--radius-md);
}

.danger-content {
  flex: 1;
}

.danger-title {
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--color-destructive);
}

.danger-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-1);
}

@media (max-width: 768px) {
  .data-action { 
    flex-direction: column; 
    text-align: center;
  }
  
  .danger-item {
    flex-direction: column;
    gap: var(--spacing-4);
    text-align: center;
  }
}
</style>
