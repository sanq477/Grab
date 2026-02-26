<template>
  <div class="statistics">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">数据统计</h1>
        <p class="page-subtitle">查看任务完成情况</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ totalTasks }}</span>
          <span class="stat-label">总任务数</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon pending">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ pendingTasks }}</span>
          <span class="stat-label">待处理</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon progress">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ inProgressTasks }}</span>
          <span class="stat-label">进行中</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon completed">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M22 4L12 14.01l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ completedTasks }}</span>
          <span class="stat-label">已完成</span>
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <h3 class="chart-title">完成进度</h3>
        <div class="progress-ring-container">
          <svg class="progress-ring" width="180" height="180">
            <circle class="progress-ring-bg" cx="90" cy="90" r="80" />
            <circle 
              class="progress-ring-fill" 
              cx="90" 
              cy="90" 
              r="80"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="progressOffset"
            />
          </svg>
          <div class="progress-ring-text">
            <span class="progress-value">{{ completionRate }}</span>
            <span class="progress-unit">%</span>
          </div>
        </div>
        <p class="progress-hint">任务完成率</p>
      </div>
      
      <div class="chart-card">
        <h3 class="chart-title">优先级分布</h3>
        <div class="priority-bars">
          <div class="priority-bar-item">
            <div class="priority-info">
              <span class="priority-dot high"></span>
              <span class="priority-name">高优先级</span>
              <span class="priority-count">{{ highPriority }} 个</span>
            </div>
            <div class="priority-bar">
              <div class="priority-bar-fill high" :style="{ width: highPriorityPercent + '%' }"></div>
            </div>
          </div>
          <div class="priority-bar-item">
            <div class="priority-info">
              <span class="priority-dot medium"></span>
              <span class="priority-name">中优先级</span>
              <span class="priority-count">{{ mediumPriority }} 个</span>
            </div>
            <div class="priority-bar">
              <div class="priority-bar-fill medium" :style="{ width: mediumPriorityPercent + '%' }"></div>
            </div>
          </div>
          <div class="priority-bar-item">
            <div class="priority-info">
              <span class="priority-dot low"></span>
              <span class="priority-name">低优先级</span>
              <span class="priority-count">{{ lowPriority }} 个</span>
            </div>
            <div class="priority-bar">
              <div class="priority-bar-fill low" :style="{ width: lowPriorityPercent + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="chart-card status-distribution">
        <h3 class="chart-title">状态分布</h3>
        <div class="status-pie">
          <div class="pie-item">
            <div class="pie-segment pending" :style="{ '--percent': pendingTasks > 0 ? (pendingTasks / totalTasks * 100) : 0 }"></div>
            <div class="pie-info">
              <span class="pie-label">待处理</span>
              <span class="pie-value">{{ pendingTasks }}</span>
            </div>
          </div>
          <div class="pie-item">
            <div class="pie-segment in_progress" :style="{ '--percent': inProgressTasks > 0 ? (inProgressTasks / totalTasks * 100) : 0 }"></div>
            <div class="pie-info">
              <span class="pie-label">进行中</span>
              <span class="pie-value">{{ inProgressTasks }}</span>
            </div>
          </div>
          <div class="pie-item">
            <div class="pie-segment completed" :style="{ '--percent': completedTasks > 0 ? (completedTasks / totalTasks * 100) : 0 }"></div>
            <div class="pie-info">
              <span class="pie-label">已完成</span>
              <span class="pie-value">{{ completedTasks }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const tasks = ref([])

const totalTasks = computed(() => tasks.value.length)
const pendingTasks = computed(() => tasks.value.filter(t => t.status === 'pending').length)
const inProgressTasks = computed(() => tasks.value.filter(t => t.status === 'in_progress').length)
const completedTasks = computed(() => tasks.value.filter(t => t.status === 'completed').length)

const circumference = 2 * Math.PI * 80

const progressOffset = computed(() => {
  return circumference - (completionRate.value / 100) * circumference
})

const completionRate = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.round((completedTasks.value / totalTasks.value) * 100)
})

const highPriority = computed(() => tasks.value.filter(t => t.priority === 'high').length)
const mediumPriority = computed(() => tasks.value.filter(t => t.priority === 'medium').length)
const lowPriority = computed(() => tasks.value.filter(t => t.priority === 'low').length)

const highPriorityPercent = computed(() => totalTasks.value === 0 ? 0 : Math.round((highPriority.value / totalTasks.value) * 100))
const mediumPriorityPercent = computed(() => totalTasks.value === 0 ? 0 : Math.round((mediumPriority.value / totalTasks.value) * 100))
const lowPriorityPercent = computed(() => totalTasks.value === 0 ? 0 : Math.round((lowPriority.value / totalTasks.value) * 100))

const loadTasks = () => {
  const stored = localStorage.getItem('tasks')
  if (stored) {
    tasks.value = JSON.parse(stored)
  }
}

onMounted(() => {
  loadTasks()
  window.addEventListener('storage', loadTasks)
})
</script>

<style scoped>
.statistics {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 4px 0 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.total {
  background: #e8f4ff;
  color: var(--accent-blue);
}

.stat-icon.pending {
  background: #fff4e6;
  color: #ff9500;
}

.stat-icon.progress {
  background: #f0f0ff;
  color: #5856d6;
}

.stat-icon.completed {
  background: #e6f7ed;
  color: #34c759;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.chart-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 24px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px;
}

.progress-ring-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: none;
  stroke: #f5f5f7;
  stroke-width: 12;
}

.progress-ring-fill {
  fill: none;
  stroke: #34c759;
  stroke-width: 12;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.progress-ring-text {
  position: absolute;
  display: flex;
  align-items: baseline;
}

.progress-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
}

.progress-unit {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-secondary);
}

.progress-hint {
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.priority-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.priority-bar-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.priority-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.priority-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.priority-dot.high {
  background: #ff3b30;
}

.priority-dot.medium {
  background: #ff9500;
}

.priority-dot.low {
  background: #34c759;
}

.priority-name {
  font-size: 13px;
  color: var(--text-primary);
  flex: 1;
}

.priority-count {
  font-size: 13px;
  color: var(--text-secondary);
}

.priority-bar {
  height: 8px;
  background: #f5f5f7;
  border-radius: 4px;
  overflow: hidden;
}

.priority-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.priority-bar-fill.high {
  background: #ff3b30;
}

.priority-bar-fill.medium {
  background: #ff9500;
}

.priority-bar-fill.low {
  background: #34c759;
}

.status-distribution {
  grid-column: span 1;
}

.status-pie {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pie-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pie-segment {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.pie-segment.pending {
  background: #ff9500;
}

.pie-segment.in_progress {
  background: #5856d6;
}

.pie-segment.completed {
  background: #34c759;
}

.pie-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.pie-label {
  font-size: 13px;
  color: var(--text-primary);
}

.pie-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
