import { app, shell, BrowserWindow, ipcMain, globalShortcut, clipboard } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

let mainWindow = null

// 中文时间解析
function parseChineseDate(text) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let date = null
  let matchedTexts = []
  let title = text

  // 匹配模式及对应的日期计算
  const patterns = [
    { regex: /今天/, getDate: () => new Date(today) },
    { regex: /明天/, getDate: () => { const d = new Date(today); d.setDate(d.getDate() + 1); return d; } },
    { regex: /后天/, getDate: () => { const d = new Date(today); d.setDate(d.getDate() + 2); return d; } },
    { regex: /大后天/, getDate: () => { const d = new Date(today); d.setDate(d.getDate() + 3); return d; } },
    { regex: /下周([一二三四五六日])/, getDate: (m) => { 
      const dayMap = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 7 };
      const targetDay = dayMap[m[1]];
      const currentDay = now.getDay() || 7;
      const d = new Date(today);
      d.setDate(d.getDate() + (targetDay - currentDay + 7));
      return d;
    }},
    { regex: /周([一二三四五六日])/, getDate: (m) => {
      const dayMap = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 7 };
      const targetDay = dayMap[m[1]];
      const currentDay = now.getDay() || 7;
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7;
      const d = new Date(today);
      d.setDate(d.getDate() + daysToAdd);
      return d;
    }},
    { regex: /(\d{1,2})月(\d{1,2})日/, getDate: (m) => new Date(now.getFullYear(), parseInt(m[1]) - 1, parseInt(m[2])) },
    { regex: /(\d+)号/, getDate: (m) => { const d = new Date(today); d.setDate(parseInt(m[1])); return d; } },
  ]

  // 查找所有匹配的时间表达式
  for (const p of patterns) {
    const match = text.match(p.regex)
    if (match) {
      matchedTexts.push(match[0])
      if (!date) {
        date = p.getDate(match)
      }
    }
  }

  // 去掉时间相关词汇来生成标题
  for (const mt of matchedTexts) {
    title = title.replace(mt, '').trim()
  }
  // 去掉一些常见的连接词
  title = title.replace(/^[之内以内之前之前]/, '').replace(/[之内以内之前]/, '').trim()

  return { date, matchedText: matchedTexts.join(' '), title: title || text }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.grab.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  // 注册全局快捷键 Ctrl+Shift+T (Mac: Cmd+Shift+T)
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    console.log('[Grab] 快捷键触发')
    if (mainWindow) {
      // 读取剪贴板内容
      const selectedText = clipboard.readText()
      console.log('[Grab] 剪贴板内容:', selectedText)
      if (selectedText && selectedText.trim()) {
        // 解析中文时间
        const { date, title } = parseChineseDate(selectedText)
        let deadline = ''

        if (date) {
          // 格式化日期为 YYYY-MM-DD
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          deadline = `${year}-${month}-${day}`
          console.log('[Grab] 解析日期:', deadline, '标题:', title)
        }

        // 发送到渲染进程
        mainWindow.webContents.send('quick-add-task', {
          title,
          deadline,
          text: selectedText
        })
        console.log('[Grab] 发送数据:', { title, deadline, text: selectedText })
        
        // 聚焦窗口
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    }
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
