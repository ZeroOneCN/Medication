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

/* 响应式布局 */
@media (max-width: 768px) {
  .content {
    padding: 16px 20px;
  }
}
</style> 