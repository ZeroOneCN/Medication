<template>
  <a-config-provider :locale="zhCN">
    <div class="app-container">
      <header class="app-header">
        <div class="header-inner">
          <div class="logo" @click="$router.push('/')">
            <div class="logo-icon">
              <MedicineBoxOutlined />
            </div>
            <span class="logo-text">用药记录</span>
          </div>
          <nav class="nav-menu">
            <router-link 
              v-for="item in navItems" 
              :key="item.key"
              :to="item.path"
              class="nav-item"
              :class="{ 'nav-item--active': $route.name === item.key }"
            >
              <component :is="item.icon" class="nav-icon" />
              <span class="nav-text">{{ item.label }}</span>
            </router-link>
          </nav>
        </div>
      </header>
      <main class="app-main">
        <router-view></router-view>
      </main>
      <footer class="app-footer">
        <span>用药记录管理 © {{ new Date().getFullYear() }}</span>
      </footer>
    </div>
  </a-config-provider>
</template>

<script setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { 
  MedicineBoxOutlined, 
  HomeOutlined, 
  BarChartOutlined, 
  SettingOutlined
} from '@ant-design/icons-vue'

const navItems = [
  { key: 'home', label: '首页', path: '/', icon: HomeOutlined },
  { key: 'analysis', label: '数据分析', path: '/analysis', icon: BarChartOutlined },
  { key: 'settings', label: '设置', path: '/settings', icon: SettingOutlined }
]
</script>

<style>
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;

  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-primary-hover: hsl(221.2 83.2% 45%);
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));

  --color-success: hsl(142.1 76.2% 36.3%);
  --color-success-foreground: hsl(143.8 61.2% 20.2%);
  --color-warning: hsl(38 92% 50%);
  --color-warning-foreground: hsl(48 96% 89%);
  --color-info: hsl(262 83% 58%);

  --color-bg: hsl(210 40% 98%);
  --color-bg-secondary: hsl(210 40% 96%);
  --color-border-light: hsl(214.3 31.8% 94%);
  --color-text: hsl(222.2 84% 4.9%);
  --color-text-secondary: hsl(215.4 16.3% 46.9%);
  --color-text-muted: hsl(215.4 16.3% 60%);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;

  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;

  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: var(--font-size-base);
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-bg);
  -webkit-font-smoothing: antialiased;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: var(--color-card);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-6);
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  cursor: pointer;
  user-select: none;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: var(--color-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.logo-text {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text);
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: all 0.15s ease;
}

.nav-item:hover {
  color: var(--color-text);
  background: var(--color-secondary);
}

.nav-item--active {
  color: var(--color-primary-foreground);
  background: var(--color-primary);
  font-weight: 600;
}

.nav-icon {
  font-size: 18px;
}

.nav-text {
  font-size: var(--font-size-sm);
}

.app-main {
  flex: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--spacing-6);
  width: 100%;
}

.app-footer {
  background: var(--color-card);
  border-top: 1px solid var(--color-border);
  padding: var(--spacing-4) var(--spacing-6);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
  text-decoration: none;
  line-height: 1.5;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
  border-color: var(--color-primary);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.btn-secondary {
  background: var(--color-secondary);
  color: var(--color-secondary-foreground);
  border-color: var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-accent);
  color: var(--color-accent-foreground);
}

.btn-danger {
  background: var(--color-destructive);
  color: var(--color-destructive-foreground);
  border-color: var(--color-destructive);
}

.btn-danger:hover:not(:disabled) {
  background: hsl(0 84% 50%);
}

.btn-success {
  background: var(--color-success);
  color: white;
  border-color: var(--color-success);
}

.btn-success:hover:not(:disabled) {
  background: hsl(142.1 76% 32%);
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: transparent;
}

.btn-ghost:hover:not(:disabled) {
  background: var(--color-accent);
  color: var(--color-accent-foreground);
}

.btn-sm {
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--font-size-xs);
}

.btn-lg {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-base);
}

.btn-link {
  background: transparent;
  border: none;
  color: var(--color-primary);
  padding: var(--spacing-1) var(--spacing-2);
  font-weight: 500;
}

.btn-link:hover {
  text-decoration: underline;
}

.btn-link--danger {
  color: var(--color-destructive);
}

.card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid var(--color-border);
}

.card-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.card-body {
  padding: var(--spacing-6);
}

.card-body--no-padding {
  padding: 0;
}

.card-footer {
  padding: var(--spacing-4) var(--spacing-6);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: var(--spacing-3) var(--spacing-4);
  text-align: left;
  border-bottom: 1px solid var(--color-border-light);
}

.data-table th {
  background: var(--color-bg-secondary);
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-table td {
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.data-table tbody tr:hover {
  background: var(--color-bg);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: 9999px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  line-height: 1;
}

.badge--primary {
  background: hsl(var(--primary) / 0.1);
  color: var(--color-primary);
}

.badge--success {
  background: hsl(142.1 76% 36% / 0.1);
  color: var(--color-success);
}

.badge--warning {
  background: hsl(38 92% 50% / 0.1);
  color: hsl(38 92% 30%);
}

.badge--danger {
  background: hsl(var(--destructive) / 0.1);
  color: var(--color-destructive);
}

.badge--info {
  background: hsl(262 83% 58% / 0.1);
  color: var(--color-info);
}

.input {
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-input);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  background: var(--color-card);
  transition: all 0.15s ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-ring);
  box-shadow: 0 0 0 3px hsl(var(--ring) / 0.1);
}

.input::placeholder {
  color: var(--color-text-muted);
}

.textarea {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--color-input);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-card);
  resize: vertical;
  transition: all 0.15s ease;
  min-height: 120px;
}

.textarea:focus {
  outline: none;
  border-color: var(--color-ring);
  box-shadow: 0 0 0 3px hsl(var(--ring) / 0.1);
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-input);
  border-radius: 9999px;
  transition: 0.2s;
}

.switch-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: 0.2s;
  box-shadow: var(--shadow);
}

.switch input:checked + .switch-slider {
  background-color: var(--color-primary);
}

.switch input:checked + .switch-slider:before {
  transform: translateX(20px);
}

.progress-bar {
  height: 8px;
  background: var(--color-secondary);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.empty-state {
  padding: var(--spacing-12);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.alert {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  border: 1px solid;
}

.alert--warning {
  background: hsl(38 92% 50% / 0.1);
  border-color: hsl(38 92% 50% / 0.3);
  color: hsl(38 92% 20%);
}

.alert--info {
  background: hsl(262 83% 58% / 0.1);
  border-color: hsl(262 83% 58% / 0.3);
  color: hsl(262 83% 30%);
}

.alert--success {
  background: hsl(142.1 76% 36% / 0.1);
  border-color: hsl(142.1 76% 36% / 0.3);
  color: hsl(142.1 76% 20%);
}

.alert--danger {
  background: hsl(var(--destructive) / 0.1);
  border-color: hsl(var(--destructive) / 0.3);
  color: hsl(var(--destructive));
}

.ant-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.ant-card-head {
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-4) var(--spacing-6);
}

.ant-card-head-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
}

.ant-card-body {
  padding: var(--spacing-6);
}

.ant-btn {
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: var(--font-size-sm);
  padding: var(--spacing-2) var(--spacing-4);
  height: auto;
  transition: all 0.15s ease;
  box-shadow: var(--shadow-sm);
}

.ant-btn-primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-primary-foreground);
}

.ant-btn-primary:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.ant-btn-default {
  background: var(--color-secondary);
  border-color: var(--color-border);
  color: var(--color-secondary-foreground);
}

.ant-btn-default:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-accent-foreground);
}

.ant-btn-dangerous {
  background: var(--color-destructive);
  border-color: var(--color-destructive);
  color: var(--color-destructive-foreground);
}

.ant-btn-dangerous:hover {
  background: hsl(0 84% 50%);
}

.ant-input,
.ant-input-number,
.ant-select-selector,
.ant-picker {
  border-radius: var(--radius-md);
  border-color: var(--color-input);
  font-size: var(--font-size-sm);
}

.ant-input:focus,
.ant-input-number:focus,
.ant-select-focused .ant-select-selector,
.ant-picker-focused {
  border-color: var(--color-ring);
  box-shadow: 0 0 0 3px hsl(var(--ring) / 0.1);
}

.ant-table {
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.ant-table-thead > tr > th {
  background: var(--color-bg-secondary);
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ant-table-tbody > tr > td {
  border-bottom: 1px solid var(--color-border-light);
  font-size: var(--font-size-sm);
}

.ant-table-tbody > tr:hover > td {
  background: var(--color-bg);
}

.ant-tag {
  border-radius: 9999px;
  font-weight: 500;
  font-size: var(--font-size-xs);
  padding: var(--spacing-1) var(--spacing-3);
  border: none;
}

.ant-modal-content {
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
}

.ant-modal-header {
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-4) var(--spacing-6);
}

.ant-modal-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.ant-modal-body {
  padding: var(--spacing-6);
}

.ant-modal-footer {
  border-top: 1px solid var(--color-border);
  padding: var(--spacing-4) var(--spacing-6);
}

.ant-page-header {
  padding: 0 0 var(--spacing-6) 0;
}

.ant-page-header-heading-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-text);
}

.ant-page-header-heading-sub-title {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.ant-form-item-label > label {
  font-weight: 500;
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.ant-checkbox-wrapper {
  font-size: var(--font-size-sm);
}

.ant-select-dropdown {
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
}

.ant-dropdown-menu {
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
}

.ant-popover-inner {
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
}

.ant-alert {
  border-radius: var(--radius-md);
}

.ant-pagination-item {
  border-radius: var(--radius-md);
}

.ant-pagination-item-active {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.ant-pagination-item-active a {
  color: var(--color-primary-foreground);
}

.ant-progress-bg {
  border-radius: 9999px;
}

.ant-switch {
  background: var(--color-input);
}

.ant-switch-checked {
  background: var(--color-primary);
}

.ant-divider {
  border-color: var(--color-border);
}

.ant-empty-description {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.ant-statistic-title {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.ant-statistic-content {
  color: var(--color-text);
  font-size: var(--font-size-2xl);
}

.ant-calendar {
  border-radius: var(--radius-lg);
}

.ant-calendar-header {
  border-bottom: 1px solid var(--color-border);
}

.ant-calendar-selected-day .ant-calendar-date {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}

.ant-calendar-date:hover {
  background: var(--color-accent);
}

@media (max-width: 768px) {
  .header-inner {
    padding: 0 var(--spacing-4);
  }

  .logo-text {
    display: none;
  }

  .nav-text {
    display: none;
  }

  .nav-item {
    padding: var(--spacing-2);
  }

  .app-main {
    padding: var(--spacing-4);
  }
}

@media (max-width: 480px) {
  .app-main {
    padding: var(--spacing-3);
  }

  .ant-card-body {
    padding: var(--spacing-4);
  }
}
</style>
