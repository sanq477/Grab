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
          @compositionstart="isComposing = true"
          @compositionend="isComposing = false"
        />
        <button class="quick-add-btn" @click="quickAdd" :disabled="!quickAddTitle.trim()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <TransitionGroup :name="'task-' + filterStatus" tag="div" class="task-cards">
      <div v-for="(task, index) in filteredTasks" :key="task.id" 
           class="task-card" 
           draggable="true"
           @dragstart="dragStart(index, $event)"
           @dragenter="dragEnter(index)"
           @dragend="dragEnd"
           @dragover.prevent
           @drop="drop(index)"
           :class="{ 
             dragging: dragIndex === index,
             'drag-over': dragOverIndex === index && dragIndex !== index
           }">
        <div class="drag-handle" title="拖动排序">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M8 6h2M8 12h2M8 18h2M14 6h2M14 12h2M14 18h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="task-card-content">
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
import { ElMessageBox } from 'element-plus'

const tasks = ref([])
const filterStatus = ref('')
const quickAddTitle = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const dragIndex = ref(-1)
const dragOverIndex = ref(-1)
const isComposing = ref(false) // 中文输入状态
const lastQuickAddText = ref('') // 记录失焦时的内容

const taskForm = ref({
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  deadline: ''
})

const filteredTasks = computed(() => {
  let result = [...tasks.value]
  
  // 按 sortOrder 排序（手动排序），然后按优先级，最后按截止日期
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  result.sort((a, b) => {
    // 先按手动排序序号
    if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
      return a.sortOrder - b.sortOrder
    }
    // 再按优先级
    const pa = priorityOrder[a.priority] ?? 1
    const pb = priorityOrder[b.priority] ?? 1
    if (pa !== pb) return pa - pb
    // 再按截止日期（近的在前）
    if (a.deadline && b.deadline) {
      return new Date(a.deadline) - new Date(b.deadline)
    }
    if (a.deadline) return -1
    if (b.deadline) return 1
    return 0
  })
  
  if (!filterStatus.value) return result
  return result.filter(task => task.status === filterStatus.value)
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

const dragStart = (index, event) => {
  dragIndex.value = index
  dragOverIndex.value = -1
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', index.toString())
}

const dragEnter = (index) => {
  if (dragIndex.value === -1) return
  dragOverIndex.value = index
}

const drop = (index) => {
  if (dragIndex.value === -1 || dragIndex.value === index) {
    dragIndex.value = -1
    dragOverIndex.value = -1
    return
  }
  
  // 从 filteredTasks 获取要移动的任务
  const filtered = filteredTasks.value
  const taskToMove = filtered[dragIndex.value]
  if (!taskToMove) {
    dragIndex.value = -1
    dragOverIndex.value = -1
    return
  }
  
  // 找到这个任务在 tasks 中的位置
  const fromIndex = tasks.value.findIndex(t => t.id === taskToMove.id)
  if (fromIndex === -1) {
    dragIndex.value = -1
    dragOverIndex.value = -1
    return
  }
  
  // 计算目标位置
  let toIndex = index
  if (index >= filtered.length) {
    toIndex = tasks.value.length - 1
  } else {
    const targetTask = filtered[index]
    toIndex = tasks.value.findIndex(t => t.id === targetTask?.id)
  }
  
  if (toIndex === -1) toIndex = tasks.value.length - 1
  
  // 移动任务
  const items = [...tasks.value]
  const [moved] = items.splice(fromIndex, 1)
  items.splice(toIndex, 0, moved)
  
  // 更新 sortOrder
  items.forEach((task, i) => {
    task.sortOrder = i
  })
  
  tasks.value = items
  dragIndex.value = -1
  dragOverIndex.value = -1
  saveTasks()
}

const dragEnd = () => {
  dragIndex.value = -1
  dragOverIndex.value = -1
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
    // 计算新的 sortOrder（放在最前面）
    const newSortOrder = tasks.value.length > 0 
      ? Math.min(...tasks.value.map(t => t.sortOrder ?? 0)) - 1 
      : 0
    tasks.value.push({ ...taskForm.value, id: Date.now(), sortOrder: newSortOrder })
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
  
  // 监听主进程快捷键添加任务 - 直接创建，不弹窗
  if (window.api && window.api.onQuickAddTask) {
    window.api.onQuickAddTask((data) => {
      // 智能识别优先级
      let priority = 'medium'
      const lowerText = data.text.toLowerCase()
      if (lowerText.includes('紧急') || lowerText.includes('立即') || lowerText.includes('马上') || lowerText.includes('急')) {
        priority = 'high'
      } else if (lowerText.includes('不急') || lowerText.includes('有空') || lowerText.includes('慢慢') || lowerText.includes('不急')) {
        priority = 'low'
      }
      
      // 智能识别状态
      let status = 'pending'
      if (lowerText.includes('已完成') || lowerText.includes('做完了') || lowerText.includes('完成')) {
        status = 'completed'
      } else if (lowerText.includes('进行中') || lowerText.includes('正在') || lowerText.includes('处理中')) {
        status = 'in_progress'
      }
      
      // 直接创建任务
      const newTask = {
        id: Date.now(),
        title: data.title,
        description: data.text,
        status,
        priority,
        deadline: data.deadline || ''
      }
      tasks.value.unshift(newTask)
      saveTasks()
      ElMessage.success('任务添加成功')
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const handleKeydown = (e) => {
  // 获取保存的快捷键设置
  const storedShortcuts = localStorage.getItem('shortcutSettings')
  let shortcuts = [
    { key: 'quickAdd', keys: ['CommandOrControl', 'n'] },
    { key: 'toggleComplete', keys: ['Enter'] }
  ]
  if (storedShortcuts) {
    try {
      const parsed = JSON.parse(storedShortcuts)
      shortcuts = parsed
    } catch (e) {
      // 使用默认
    }
  }
  
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  
  // 检查快速添加任务快捷键
  const quickAddShortcut = shortcuts.find(s => s.key === 'quickAdd')
  if (quickAddShortcut && quickAddShortcut.keys && quickAddShortcut.keys.length) {
    const hasCtrl = quickAddShortcut.keys.some(k => k === 'Control' || k === 'CommandOrControl' || (isMac && k === 'Command'))
    const hasKey = quickAddShortcut.keys.some(k => k.toLowerCase() === e.key.toLowerCase())
    
    if (hasCtrl && hasKey) {
      e.preventDefault()
      // 聚焦到快速添加输入框
      const input = document.querySelector('.quick-add-input')
      if (input) input.focus()
      return
    }
  }
}

const quickAdd = () => {
  // 如果正在中文输入，不处理
  if (isComposing.value) return
  
  const text = quickAddTitle.value.trim()
  if (!text) return
  let title = text
  let deadline = ''
  let priority = 'medium'
  
  const today = new Date()
  const currentYear = today.getFullYear()
  const todayStr = today.toISOString().split('T')[0]
  
  const lowerText = text.toLowerCase()
  
  // 先检查是否指定了日期
  let hasDate = false
  
  // 检查"今天"
  if (lowerText.includes('今天')) {
    deadline = todayStr
    title = text.replace(/今天/gi, '').trim()
    hasDate = true
  }
  // 检查"明天"
  else if (lowerText.includes('明天')) {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    deadline = tomorrow.toISOString().split('T')[0]
    title = text.replace(/明天/gi, '').trim()
    hasDate = true
  }
  // 检查"后天"
  else if (lowerText.includes('后天')) {
    const dayAfter = new Date(today)
    dayAfter.setDate(dayAfter.getDate() + 2)
    deadline = dayAfter.toISOString().split('T')[0]
    title = text.replace(/后天/gi, '').trim()
    hasDate = true
  }
  // 检查"几月几号"格式
  else {
    const monthDayMatch = text.match(/(\d{1,2})[月\-\/](\d{1,2})[号日]?/)
    if (monthDayMatch) {
      const month = parseInt(monthDayMatch[1])
      const day = parseInt(monthDayMatch[2])
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const date = new Date(currentYear, month - 1, day)
        // 如果日期已过，默认明年
        if (date < today) {
          date.setFullYear(currentYear + 1)
        }
        deadline = date.toISOString().split('T')[0]
        title = text.replace(monthDayMatch[0], '').trim()
        hasDate = true
      }
    }
  }
  
  // 如果没有指定日期，默认今天
  if (!hasDate) {
    deadline = todayStr
  }
  
  // 智能识别优先级
  if (lowerText.includes('紧急') || lowerText.includes('立即') || lowerText.includes('马上') || lowerText.includes('急') || lowerText.includes('重要') || lowerText.includes('高')) {
    priority = 'high'
    title = title.replace(/紧急|立即|马上|急|重要|高/gi, '').trim()
  } else if (lowerText.includes('不急') || lowerText.includes('有空') || lowerText.includes('慢慢') || lowerText.includes('低')) {
    priority = 'low'
    title = title.replace(/不急|有空|慢慢|低/gi, '').trim()
  }
  
  // 智能识别状态
  let status = 'pending'
  
  // 只有明确表示"已完成"的才标记为完成
  // 排除"要完成"、"明天完成"等未来时态
  const completedPatterns = [/已完成/, /做完了/, /已经完成/, /已完成/]
  const hasExplicitComplete = completedPatterns.some(pattern => pattern.test(text))
  
  if (hasExplicitComplete) {
    status = 'completed'
    title = text.replace(/已完成|做完了|已经完成/gi, '').trim()
  } else if (lowerText.includes('进行中') || lowerText.includes('正在') || lowerText.includes('处理中')) {
    status = 'in_progress'
    title = title.replace(/进行中|正在|处理中/gi, '').trim()
  }
  
  // 清理可能剩余的介词
  title = title.replace(/^完成|^开始|^做/gi, '').trim()
  
  // 计算新的 sortOrder（放在最前面）
  const newSortOrder = tasks.value.length > 0 
    ? Math.min(...tasks.value.map(t => t.sortOrder ?? 0)) - 1 
    : 0
  
  tasks.value.unshift({
    id: Date.now(),
    title: title || text,
    description: '',
    status,
    priority,
    deadline,
    sortOrder: newSortOrder
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

.quick-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--accent-blue);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.quick-add-btn:hover:not(:disabled) {
  background: #0077ed;
  transform: scale(1.05);
}

.quick-add-btn:disabled {
  background: #c7c7cc;
  cursor: not-allowed;
}

.quick-add-input::placeholder {
  color: var(--text-secondary);
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
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.task-card.dragging {
  opacity: 0.5;
  background: #f0f7ff;
  transform: scale(1.02);
}

.task-card.drag-over {
  border-top: 3px solid var(--accent-blue);
  margin-top: -3px;
}

.drag-handle {
  cursor: grab;
  color: var(--text-secondary);
  padding: 4px;
  border-radius: 4px;
  flex-shrink: 0;
  margin-top: 2px;
}

.drag-handle:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.drag-handle:active {
  cursor: grabbing;
}

.task-card-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
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
.task-leave-active,
.task--enter-active,
.task--leave-active {
  transition: all 0.3s ease;
}

.task-enter-from,
.task--enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.task-leave-to,
.task--leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
