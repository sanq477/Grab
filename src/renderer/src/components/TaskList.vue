<template>
  <div class="task-list">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">任务列表</h1>
        <p class="page-subtitle">管理您的所有任务</p>
      </div>
      <div class="header-actions">
        <div class="filter-pill" :class="{ active: filterStatus === '' }" @click="filterStatus = ''">
          全部
        </div>
        <div class="filter-pill" :class="{ active: filterStatus === 'pending' }" @click="filterStatus = 'pending'">
          待处理
        </div>
        <div class="filter-pill" :class="{ active: filterStatus === 'in_progress' }" @click="filterStatus = 'in_progress'">
          进行中
        </div>
        <div class="filter-pill" :class="{ active: filterStatus === 'completed' }" @click="filterStatus = 'completed'">
          已完成
        </div>
      </div>
      <el-button type="primary" class="add-btn" @click="addTask">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        新建任务
      </el-button>
    </div>

    <div class="quick-add">
      <div class="quick-add-input-wrapper">
        <svg class="quick-add-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input 
          v-model="quickAddTitle" 
          type="text" 
          class="quick-add-input" 
          placeholder="快速添加任务... (⌘N)"
          @keydown.enter="quickAdd"
        />
        <span class="quick-add-hint">按回车添加</span>
      </div>
    </div>

    <TransitionGroup name="task" tag="div" class="task-cards">
      <div v-for="task in filteredTasks" :key="task.id" class="task-card">
        <div class="task-card-header">
          <div class="task-priority" :class="task.priority"></div>
          <div class="task-info">
            <h3 class="task-title">{{ task.title }}</h3>
            <p v-if="task.description" class="task-desc">{{ task.description }}</p>
          </div>
          <div class="task-status" :class="task.status">
            {{ getStatusText(task.status) }}
          </div>
        </div>
        <div class="task-card-footer">
          <div class="task-meta">
            <span v-if="task.deadline" class="task-deadline">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ task.deadline }}
            </span>
            <span class="task-priority-tag" :class="task.priority">
              {{ getPriorityText(task.priority) }}
            </span>
          </div>
          <div class="task-actions">
            <button class="action-btn" @click="editTask(task)" title="编辑">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="action-btn delete" @click="deleteTask(task.id)" title="删除">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <div v-if="filteredTasks.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" class="empty-icon">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#d1d1d6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <p class="empty-text">暂无任务</p>
      <el-button type="primary" @click="addTask">创建第一个任务</el-button>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑任务' : '新建任务'" width="480px" class="task-dialog">
      <el-form :model="taskForm" label-position="top" class="task-form">
        <el-form-item label="任务标题">
          <el-input v-model="taskForm.title" placeholder="请输入任务标题" size="large" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="taskForm.description" type="textarea" rows="3" placeholder="请输入任务描述（可选）" size="large" />
        </el-form-item>
        <div class="form-row">
          <el-form-item label="状态" class="form-item-half">
            <el-select v-model="taskForm.status" placeholder="选择状态" size="large" style="width: 100%;">
              <el-option label="待处理" value="pending" />
              <el-option label="进行中" value="in_progress" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </el-form-item>
          <el-form-item label="优先级" class="form-item-half">
            <el-select v-model="taskForm.priority" placeholder="选择优先级" size="large" style="width: 100%;">
              <el-option label="低优先级" value="low" />
              <el-option label="中优先级" value="medium" />
              <el-option label="高优先级" value="high" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="截止日期">
          <el-date-picker v-model="taskForm.deadline" type="date" placeholder="选择日期" size="large" style="width: 100%;" value-format="YYYY-MM-DD" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" size="large">取消</el-button>
          <el-button type="primary" @click="saveTask" size="large">{{ isEdit ? '保存' : '创建' }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const tasks = ref([])
const filterStatus = ref('')
const quickAddTitle = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref(null)

const taskForm = ref({
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  deadline: ''
})

const filteredTasks = computed(() => {
  if (!filterStatus.value) return tasks.value
  return tasks.value.filter(task => task.status === filterStatus.value)
})

const getStatusText = (status) => {
  const texts = { pending: '待处理', in_progress: '进行中', completed: '已完成' }
  return texts[status] || status
}

const getPriorityText = (priority) => {
  const texts = { low: '低', medium: '中', high: '高' }
  return texts[priority] || priority
}

const loadTasks = () => {
  const stored = localStorage.getItem('tasks')
  if (stored) {
    tasks.value = JSON.parse(stored)
  }
}

const saveTasks = () => {
  localStorage.setItem('tasks', JSON.stringify(tasks.value))
  window.dispatchEvent(new Event('storage'))
}

const addTask = () => {
  isEdit.value = false
  editingId.value = null
  taskForm.value = {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    deadline: ''
  }
  dialogVisible.value = true
}

const editTask = (task) => {
  isEdit.value = true
  editingId.value = task.id
  taskForm.value = { ...task }
  dialogVisible.value = true
}

const saveTask = () => {
  if (!taskForm.value.title) {
    ElMessage.warning('请输入任务标题')
    return
  }

  if (isEdit.value) {
    const index = tasks.value.findIndex(t => t.id === editingId.value)
    if (index !== -1) {
      tasks.value[index] = { ...taskForm.value, id: editingId.value }
    }
  } else {
    tasks.value.push({ ...taskForm.value, id: Date.now() })
  }
  saveTasks()
  dialogVisible.value = false
  ElMessage.success(isEdit.value ? '修改成功' : '创建成功')
}

const deleteTask = (id) => {
  ElMessageBox.confirm('确定要删除这个任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    tasks.value = tasks.value.filter(t => t.id !== id)
    saveTasks()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

onMounted(() => {
  loadTasks()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const handleKeydown = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
    e.preventDefault()
    addTask()
  }
}

const quickAdd = () => {
  if (!quickAddTitle.value.trim()) return
  tasks.value.unshift({
    id: Date.now(),
    title: quickAddTitle.value.trim(),
    description: '',
    status: 'pending',
    priority: 'medium',
    deadline: ''
  })
  saveTasks()
  quickAddTitle.value = ''
  ElMessage.success('任务添加成功')
}
</script>

<style scoped>
.task-list {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;
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

.quick-add {
  margin-bottom: 20px;
}

.quick-add-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.2s ease;
}

.quick-add-input-wrapper:focus-within {
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.quick-add-icon {
  color: var(--accent-blue);
  flex-shrink: 0;
}

.quick-add-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: var(--text-primary);
  background: transparent;
}

.quick-add-input::placeholder {
  color: var(--text-secondary);
}

.quick-add-hint {
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.quick-add-input-wrapper:focus-within .quick-add-hint {
  opacity: 1;
}

.header-actions {
  display: flex;
  gap: 8px;
  background: var(--hover-bg);
  padding: 4px;
  border-radius: 10px;
}

.filter-pill {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-pill:hover {
  color: var(--text-primary);
}

.filter-pill.active {
  background: white;
  color: var(--accent-blue);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  font-weight: 500;
}

.task-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px 20px;
  transition: all 0.2s ease;
}

.task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.task-card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.task-priority {
  width: 4px;
  height: 40px;
  border-radius: 2px;
  flex-shrink: 0;
}

.task-priority.high {
  background: #ff3b30;
}

.task-priority.medium {
  background: #ff9500;
}

.task-priority.low {
  background: #34c759;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px;
}

.task-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-status {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.task-status.pending {
  background: #f5f5f7;
  color: #86868b;
}

.task-status.in_progress {
  background: #fff4e6;
  color: #ff9500;
}

.task-status.completed {
  background: #e6f7ed;
  color: #34c759;
}

.task-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-deadline {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.task-priority-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.task-priority-tag.high {
  background: #ffe5e5;
  color: #ff3b30;
}

.task-priority-tag.medium {
  background: #fff4e6;
  color: #ff9500;
}

.task-priority-tag.low {
  background: #e6f7ed;
  color: #34c759;
}

.task-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.action-btn.delete:hover {
  background: #ffe5e5;
  color: #ff3b30;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-text {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0 0 20px;
}

.task-form .el-form-item__label {
  font-weight: 500;
  color: var(--text-primary);
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-item-half {
  flex: 1;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.task-enter-active,
.task-leave-active {
  transition: all 0.3s ease;
}

.task-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.task-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
