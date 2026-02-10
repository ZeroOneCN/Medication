<template>
  <a-config-provider :locale="zhCN">
    <a-layout class="layout">
      <a-layout-content class="content">
        <router-view></router-view>
      </a-layout-content>
    </a-layout>
  </a-config-provider>
</template>

<script setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN'
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
}

.layout {
  min-height: 100vh;
  background: #f0f2f5;
}

.content {
  padding: 24px 50px;
  min-height: 280px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* 响应式布局 - 平板设备 */
@media (max-width: 1024px) {
  .content {
    padding: 20px 30px;
  }
}

/* 响应式布局 - 移动设备 */
@media (max-width: 768px) {
  .content {
    padding: 16px 16px;
  }
  
  /* 优化移动端表格显示 */
  .ant-table-wrapper {
    overflow-x: auto;
  }
  
  .ant-table {
    font-size: 12px;
  }
  
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 8px 4px;
  }
  
  /* 优化表单布局 */
  .ant-form-item {
    margin-bottom: 12px;
  }
  
  /* 优化按钮间距 */
  .ant-space {
    gap: 8px !important;
  }
  
  .ant-btn {
    font-size: 12px;
    padding: 4px 8px;
    height: auto;
  }
  
  /* 优化筛选卡片 */
  .filter-card .ant-form-item {
    margin-right: 12px;
    margin-bottom: 12px;
  }
  
  .filter-card .ant-form-item:last-child {
    margin-right: 0;
  }
  
  /* 优化日期选择器 */
  .ant-picker {
    width: 100% !important;
  }
  
  /* 优化输入框 */
  .ant-input,
  .ant-input-number {
    width: 100% !important;
  }
}

/* 超小屏幕设备 */
@media (max-width: 480px) {
  .content {
    padding: 12px 8px;
  }
  
  .ant-page-header {
    padding: 12px 8px;
  }
  
  .ant-page-header-heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .ant-page-header-heading-title {
    font-size: 16px;
  }
  
  .ant-page-header-heading-sub-title {
    font-size: 12px;
  }
  
  .ant-page-header-extra {
    margin-top: 8px;
    width: 100%;
  }
  
  .ant-page-header-extra .ant-space {
    width: 100%;
    justify-content: space-between;
  }
  
  .ant-page-header-extra .ant-btn {
    flex: 1;
    min-width: 0;
    font-size: 11px;
    padding: 2px 4px;
  }
  
  /* 优化表格操作按钮 */
  .ant-table-tbody .ant-space {
    flex-wrap: wrap;
    gap: 4px !important;
  }
  
  .ant-table-tbody .ant-btn {
    font-size: 11px;
    padding: 2px 4px;
  }
}
</style>