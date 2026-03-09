<template>
  <div class="settings-page">
    <div class="page-header">
      <h1 class="page-title">设置</h1>
    </div>

    <div class="settings-section">
      <h2 class="section-title">快捷键</h2>
      <p class="section-desc">自定义应用的快捷键设置</p>
      
      <div class="shortcut-list">
        <div v-for="shortcut in shortcuts" :key="shortcut.key" class="shortcut-item">
          <div class="shortcut-info">
            <span class="shortcut-label">{{ shortcut.label }}</span>
            <span class="shortcut-desc">{{ shortcut.description }}</span>
          </div>
          <div class="shortcut-key">
            <input 
              type="text" 
              class="key-input" 
              :value="getKeyDisplay(shortcut.keys)"
              readonly
              @keydown="captureKey($event, shortcut)"
              @click="startCapture(shortcut)"
              :class="{ capturing: capturingKey === shortcut.key }"
              :placeholder="capturingKey === shortcut.key ? '按下快捷键...' : '点击设置'"
            />
            <button 
              v-if="shortcut.keys && shortcut.keys.length" 
              class="clear-btn" 
              @click="clearShortcut(shortcut)"
              title="清除"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="settings-actions">
        <el-button @click="resetToDefaults">恢复默认</el-button>
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
      </div>
    </div>

    <div class="settings-section">
      <h2 class="section-title">关于</h2>
      <div class="about-info">
        <p><strong>Grab</strong> - 个人工作任务管理工具</p>
        <p>版本: 1.0.0</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

const shortcuts = ref([])
const capturingKey = ref(null)
const defaultShortcuts = [
  { key: 'quickAdd', label: '快速添加任务', description: '在任务列表页面快速添加新任务', keys: ['CommandOrControl', 'n'] },
  { key: 'toggleComplete', label: '标记完成', description: '将选中任务标记为完成', keys: ['Enter'] },
  { key: 'showCurrentTask', label: '查看当前任务', description: '显示当前正在处理的任务', keys: ['CommandOrControl', '1'] },
  { key: 'showTodayTasks', label: '查看今日任务', description: '显示今天所有的任务', keys: ['CommandOrControl', '2'] }
]

const getKeyDisplay = (keys) => {
  if (!keys || !keys.length) return ''
  return keys.map(k => {
    const map = {
      'CommandOrControl': '⌘',
      'Command': '⌘',
      'Control': '⌃',
      'Alt': '⌥',
      'Shift': '⇧',
      'Enter': '↩',
      'Space': '空格',
      'Escape': 'Esc',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'Tab': 'Tab',
      'Backspace': '⌫',
      'Delete': '⌦'
    }
    return map[k] || k
  }).join(' + ')
}

const startCapture = (shortcut) => {
  capturingKey.value = shortcut.key
}

const captureKey = (event, shortcut) => {
  event.preventDefault()
  event.stopPropagation()
  
  const keys = []
  if (event.ctrlKey) keys.push('Control')
  if (event.altKey) keys.push('Alt')
  if (event.shiftKey) keys.push('Shift')
  if (event.metaKey) keys.push('Command')
  
  const key = event.key
  if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
    keys.push(key.length === 1 ? key.toUpperCase() : key)
  }
  
  if (keys.length > 1) {
    shortcut.keys = keys
    capturingKey.value = null
  }
}

const clearShortcut = (shortcut) => {
  shortcut.keys = []
}

const loadSettings = () => {
  const stored = localStorage.getItem('shortcutSettings')
  if (stored) {
    shortcuts.value = JSON.parse(stored)
  } else {
    shortcuts.value = JSON.parse(JSON.stringify(defaultShortcuts))
  }
}

const saveSettings = () => {
  localStorage.setItem('shortcutSettings', JSON.stringify(shortcuts.value))
  ElMessage.success('设置已保存')
  
  // 触发快捷键更新事件
  window.dispatchEvent(new CustomEvent('shortcuts-updated', { 
    detail: shortcuts.value 
  }))
}

const resetToDefaults = () => {
  shortcuts.value = JSON.parse(JSON.stringify(defaultShortcuts))
  ElMessage.info('已恢复默认设置')
}

onMounted(() => {
  loadSettings()
  
  // 全局键盘监听
  const handleGlobalKeydown = (event) => {
    // 这里可以添加全局快捷键处理逻辑
  }
  window.addEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
.settings-page {
  max-width: 800px;
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

.settings-section {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.section-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 20px;
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--hover-bg);
  border-radius: 10px;
}

.shortcut-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.shortcut-label {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

.shortcut-desc {
  font-size: 13px;
  color: var(--text-secondary);
}

.shortcut-key {
  display: flex;
  align-items: center;
  gap: 8px;
}

.key-input {
  width: 160px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  background: white;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.key-input:hover {
  border-color: var(--accent-blue);
}

.key-input:focus,
.key-input.capturing {
  outline: none;
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.key-input::placeholder {
  color: var(--text-secondary);
}

.clear-btn {
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

.clear-btn:hover {
  background: #ffe5e5;
  color: #ff3b30;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.about-info {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
}

.about-info strong {
  color: var(--text-primary);
}
</style>
