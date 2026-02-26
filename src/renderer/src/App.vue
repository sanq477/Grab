<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="4" fill="#007AFF"/>
            <path d="M8 12h8M12 8v8" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="app-name">Grab</span>
      </div>
      
      <nav class="sidebar-nav">
        <button 
          v-for="item in menuItems" 
          :key="item.key"
          :class="['nav-item', { active: activeMenu === item.key }]"
          @click="activeMenu = item.key"
        >
          <component :is="item.icon" class="nav-icon" />
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </nav>
      
      <div class="sidebar-footer">
        <div class="task-summary">
          <div class="summary-item">
            <span class="summary-dot pending"></span>
            <span class="summary-text">{{ pendingCount }} 待处理</span>
          </div>
          <div class="summary-item">
            <span class="summary-dot completed"></span>
            <span class="summary-text">{{ completedCount }} 已完成</span>
          </div>
        </div>
      </div>
    </aside>
    
    <main class="main-content">
      <Transition name="fade" mode="out-in">
        <TaskList v-if="activeMenu === 'task'" key="task" />
        <Statistics v-else-if="activeMenu === 'statistics'" key="statistics" />
      </Transition>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import TaskList from './components/TaskList.vue'
import Statistics from './components/Statistics.vue'

const activeMenu = ref('task')
const tasks = ref([])

const ListIcon = {
  render: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none' }, [
    h('path', { d: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
  ])
}

const ChartIcon = {
  render: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none' }, [
    h('path', { d: 'M18 20V10M12 20V4M6 20v-6', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
  ])
}

const menuItems = [
  { key: 'task', label: '任务列表', icon: ListIcon },
  { key: 'statistics', label: '数据统计', icon: ChartIcon }
]

const pendingCount = computed(() => tasks.value.filter(t => t.status === 'pending' || t.status === 'in_progress').length)
const completedCount = computed(() => tasks.value.filter(t => t.status === 'completed').length)

onMounted(() => {
  const stored = localStorage.getItem('tasks')
  if (stored) {
    tasks.value = JSON.parse(stored)
  }
  
  window.addEventListener('storage', () => {
    const stored = localStorage.getItem('tasks')
    if (stored) {
      tasks.value = JSON.parse(stored)
    }
  })
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --sidebar-bg: #f5f5f7;
  --sidebar-active: #e8e8ed;
  --accent-blue: #007AFF;
  --text-primary: #1d1d1f;
  --text-secondary: #86868b;
  --border-color: #d2d2d7;
  --card-bg: #ffffff;
  --hover-bg: #f5f5f7;
  --pending-color: #ff9500;
  --completed-color: #34c759;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #f5f5f7;
  color: var(--text-primary);
}

.app-container {
  display: flex;
  height: 100vh;
  background: #f5f5f7;
}

.sidebar {
  width: 240px;
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
  border-right: 1px solid var(--border-color);
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  margin-bottom: 24px;
}

.logo {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
}

.nav-item:hover {
  background: var(--hover-bg);
}

.nav-item.active {
  background: var(--sidebar-active);
}

.nav-item.active .nav-icon,
.nav-item.active .nav-label {
  color: var(--accent-blue);
}

.nav-icon {
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  transition: color 0.2s ease;
}

.sidebar-footer {
  padding: 16px 14px;
  border-top: 1px solid var(--border-color);
}

.task-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.summary-dot.pending {
  background: var(--pending-color);
}

.summary-dot.completed {
  background: var(--completed-color);
}

.summary-text {
  font-size: 12px;
  color: var(--text-secondary);
}

.main-content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  background: #ffffff;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.el-button--primary {
  --el-button-bg-color: var(--accent-blue);
  --el-button-border-color: var(--accent-blue);
  --el-button-hover-bg-color: #0066d6;
  --el-button-hover-border-color: #0066d6;
  border-radius: 8px;
}

.el-button {
  border-radius: 8px;
}

.el-dialog {
  border-radius: 14px;
}

.el-dialog__header {
  padding: 20px 24px 16px;
}

.el-dialog__body {
  padding: 0 24px 20px;
}

.el-dialog__footer {
  padding: 0 24px 20px;
}

.el-input__wrapper {
  border-radius: 8px;
}

.el-select .el-input__wrapper {
  border-radius: 8px;
}

.el-textarea__inner {
  border-radius: 8px;
}

.el-table {
  --el-table-border-color: var(--border-color);
  --el-table-header-bg-color: var(--hover-bg);
  border-radius: 12px;
  overflow: hidden;
}

.el-table th.el-table__cell {
  font-weight: 600;
  color: var(--text-secondary);
}

.el-card {
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.el-tag {
  border-radius: 6px;
}
</style>
