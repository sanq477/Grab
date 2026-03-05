"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
let mainWindow = null;
function parseChineseDate(text) {
  const now = /* @__PURE__ */ new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let date = null;
  let matchedTexts = [];
  let title = text;
  const patterns = [
    { regex: /今天/, getDate: () => new Date(today) },
    { regex: /明天/, getDate: () => {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      return d;
    } },
    { regex: /后天/, getDate: () => {
      const d = new Date(today);
      d.setDate(d.getDate() + 2);
      return d;
    } },
    { regex: /大后天/, getDate: () => {
      const d = new Date(today);
      d.setDate(d.getDate() + 3);
      return d;
    } },
    { regex: /下周([一二三四五六日])/, getDate: (m) => {
      const dayMap = { "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "日": 7 };
      const targetDay = dayMap[m[1]];
      const currentDay = now.getDay() || 7;
      const d = new Date(today);
      d.setDate(d.getDate() + (targetDay - currentDay + 7));
      return d;
    } },
    { regex: /周([一二三四五六日])/, getDate: (m) => {
      const dayMap = { "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "日": 7 };
      const targetDay = dayMap[m[1]];
      const currentDay = now.getDay() || 7;
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7;
      const d = new Date(today);
      d.setDate(d.getDate() + daysToAdd);
      return d;
    } },
    { regex: /(\d{1,2})月(\d{1,2})日/, getDate: (m) => new Date(now.getFullYear(), parseInt(m[1]) - 1, parseInt(m[2])) },
    { regex: /(\d+)号/, getDate: (m) => {
      const d = new Date(today);
      d.setDate(parseInt(m[1]));
      return d;
    } }
  ];
  for (const p of patterns) {
    const match = text.match(p.regex);
    if (match) {
      matchedTexts.push(match[0]);
      if (!date) {
        date = p.getDate(match);
      }
    }
  }
  for (const mt of matchedTexts) {
    title = title.replace(mt, "").trim();
  }
  title = title.replace(/^[之内以内之前之前]/, "").replace(/[之内以内之前]/, "").trim();
  return { date, matchedText: matchedTexts.join(" "), title: title || text };
}
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.grab.app");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  createWindow();
  electron.globalShortcut.register("CommandOrControl+Shift+T", () => {
    console.log("[Grab] 快捷键触发");
    if (mainWindow) {
      const selectedText = electron.clipboard.readText();
      console.log("[Grab] 剪贴板内容:", selectedText);
      if (selectedText && selectedText.trim()) {
        const { date, title } = parseChineseDate(selectedText);
        let deadline = "";
        if (date) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          deadline = `${year}-${month}-${day}`;
          console.log("[Grab] 解析日期:", deadline, "标题:", title);
        }
        mainWindow.webContents.send("quick-add-task", {
          title,
          deadline,
          text: selectedText
        });
        console.log("[Grab] 发送数据:", { title, deadline, text: selectedText });
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    }
  });
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
