<template>
  <Transition name="float">
    <div v-if="visible" class="float-panel" :class="panelType">
      <div class="float-header">
        <span class="float-title">{{ title }}</span>
        <button class="float-close" @click="close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
        <div class="float-content">
          <div v-if="tasks.length === 0" class="float-empty">
            <p>暂无任务</p>
          </div>
          <div v-else class="float-tasks">
            <div 
              v-for="(task, index) in tasks" 
              :key="task.id" 
              class="float-task"
              @click="handleClick(task)"
            >
              <div class="float-task-priority" :class="task.priority"></div>
              <div class="float-task-info">
                <span class="float-task-title">{{ task.title }}</span>
                <span class="float-task-meta">
                  <span v-if="task.deadline" class="float-task-deadline">
                    {{ formatDate(task.deadline) }}
                  </span>
                  <span class="float-task-status" :class="task.status">
                    {{ getStatusText(task.status) }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="float-footer">
          <span class="float-hint">按 Esc 关闭</span>
        </div>
      </div>
    </Transition>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'current' // 'current' | 'today'
  }
})

const emit = defineEmits(['close', 'taskClick'])

const visible = ref(false)
const title = ref('')
const tasks = ref([])
const panelType = ref('current')

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (dateStr === today.toISOString().split('T')[0]) return '今天'
  if (dateStr === tomorrow.toISOString().split('T')[0]) return '明天'
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const getStatusText = (status) => {
  const texts = { pending: '待处理', in_progress: '进行中', completed: '已完成' }
  return texts[status] || status
}

const show = (taskList, panelTitle, type) => {
  tasks.value = taskList
  title.value = panelTitle
  panelType.value = type
  visible.value = true
}

const close = () => {
  visible.value = false
  emit('close')
}

const handleClick = (task) => {
  emit('taskClick', task)
  close()
}

// 监听键盘事件
const handleKeydown = (e) => {
  if (e.key === 'Escape' && visible.value) {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

defineExpose({ show, close, visible })
</script>

<style scoped>
.float-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  max-height: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.float-panel.today {
  width: 500px;
}

.float-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.float-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.float-close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.float-close:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.float-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  max-height: 360px;
}

.float-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-secondary);
}

.float-tasks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.float-task {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.float-task:hover {
  background: var(--hover-bg);
}

.float-task-priority {
  width: 4px;
  height: 36px;
  border-radius: 2px;
  flex-shrink: 0;
}

.float-task-priority.high {
  background: #ff3b30;
}

.float-task-priority.medium {
  background: #ff9500;
}

.float-task-priority.low {
  background: #34c759;
}

.float-task-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.float-task-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.float-task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.float-task-deadline {
  color: var(--text-secondary);
}

.float-task-status {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.float-task-status.pending {
  background: #f5f5f7;
  color: #86868b;
}

.float-task-status.in_progress {
  background: #fff4e6;
  color: #ff9500;
}

.float-task-status.completed {
  background: #e6f7ed;
  color: #34c759;
}

.float-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border-color);
}

.float-hint {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 动画 */
.float-enter-active,
.float-leave-active {
  transition: all 0.2s ease;
}

.float-enter-from,
.float-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}
</style>
