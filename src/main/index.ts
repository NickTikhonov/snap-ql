import { app, shell, BrowserWindow, ipcMain, Menu, MenuItemConstructorOptions } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../logo.png?asset'
import { runQuery, testConnectionString } from './lib/db'
import {
  getConnectionString,
  getOpenAiKey,
  setOpenAiKey,
  getOpenAiBaseUrl,
  setOpenAiBaseUrl,
  getOpenAiModel,
  setOpenAiModel,
  getQueryHistory,
  addQueryToHistory,
  updateQueryHistory,
  setConnectionString,
  getPromptExtension,
  setPromptExtension,
  getAiProvider,
  setAiProvider,
  getClaudeApiKey,
  setClaudeApiKey,
  getClaudeModel,
  setClaudeModel,
  getFavorites,
  addFavorite,
  removeFavorite,
  updateFavorite
} from './lib/state'
import { homedir } from 'os'
import { generateQuery } from './lib/ai'

function createMenu(): void {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Settings Folder',
          click: () => {
            const settingsPath = `${homedir()}/SnapQL`
            shell.openPath(settingsPath)
          }
        },
        { type: 'separator' },
        process.platform === 'darwin'
          ? { label: 'Quit SnapQL', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
          : { label: 'Exit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    }
  ]

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { label: 'About SnapQL', role: 'about' },
        { type: 'separator' },
        { label: 'Services', role: 'services', submenu: [] },
        { type: 'separator' },
        { label: 'Hide SnapQL', accelerator: 'Command+H', role: 'hide' },
        { label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideOthers' },
        { label: 'Show All', role: 'unhide' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click: () => app.quit() }
      ]
    })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    minWidth: 600,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Add context menu with copy/paste functionality
  mainWindow.webContents.on('context-menu', (_, props) => {
    const { selectionText, isEditable } = props
    const contextMenuTemplate: MenuItemConstructorOptions[] = []

    if (isEditable) {
      contextMenuTemplate.push({
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      })
      contextMenuTemplate.push({
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      })
      contextMenuTemplate.push({
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      })
    } else if (selectionText) {
      contextMenuTemplate.push({
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      })
    }

    if (contextMenuTemplate.length > 0) {
      const contextMenu = Menu.buildFromTemplate(contextMenuTemplate)
      contextMenu.popup({ window: mainWindow })
    }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('setConnectionString', async (_, connectionString) => {
    console.log('Setting connection string: ', connectionString)
    try {
      await testConnectionString(connectionString)
      await setConnectionString(connectionString)
      return true
    } catch (error) {
      console.error('Error testing connection string:', error)
      return false
    }
  })

  ipcMain.handle('getConnectionString', async () => {
    return (await getConnectionString()) ?? ''
  })

  ipcMain.handle('getOpenAiKey', async () => {
    return (await getOpenAiKey()) ?? ''
  })

  ipcMain.handle('setOpenAiKey', async (_, openAiKey) => {
    await setOpenAiKey(openAiKey)
  })

  ipcMain.handle('getOpenAiBaseUrl', async () => {
    return (await getOpenAiBaseUrl()) ?? ''
  })

  ipcMain.handle('setOpenAiBaseUrl', async (_, openAiBaseUrl) => {
    await setOpenAiBaseUrl(openAiBaseUrl)
  })

  ipcMain.handle('getOpenAiModel', async () => {
    return (await getOpenAiModel()) ?? ''
  })

  ipcMain.handle('setOpenAiModel', async (_, openAiModel) => {
    await setOpenAiModel(openAiModel)
  })

  ipcMain.handle('getGeminiKey', async () => {
    return (await getGeminiKey()) ?? ''
  })

  ipcMain.handle('setGeminiKey', async (_, geminiKey) => {
    await setGeminiKey(geminiKey)
  })

  ipcMain.handle('getGeminiModel', async () => {
    return (await getGeminiModel()) ?? ''
  })

  ipcMain.handle('setGeminiModel', async (_, geminiModel) => {
    await setGeminiModel(geminiModel)
  })

  ipcMain.handle('getLLMProvider', async () => {
    return await getLLMProvider()
  })

  ipcMain.handle('setLLMProvider', async (_, provider) => {
    await setLLMProvider(provider)
  })

  ipcMain.handle('generateWithLLM', async (_, provider, prompt, opts) => {
    try {
      const llm = await getLLM(provider)
      const queryResponse = await llm.generateQuery({ prompt, ...opts })
      return { error: null, data: queryResponse }
    } catch (e: any) {
      return { error: e.message, data: null }
    }
  })



  ipcMain.handle('generateQuery', async (_, input, existingQuery) => {
    try {
      console.log('Generating query with input: ', input, 'and existing query: ', existingQuery)
      const connectionString = await getConnectionString()
      const aiProvider = await getAiProvider()
      const promptExtension = await getPromptExtension()

      let apiKey: string
      let model: string | undefined
      let openAiBaseUrl: string | undefined

      if (aiProvider === 'openai') {
        apiKey = (await getOpenAiKey()) ?? ''
        model = await getOpenAiModel()
        openAiBaseUrl = await getOpenAiBaseUrl()
      } else {
        apiKey = (await getClaudeApiKey()) ?? ''
        model = await getClaudeModel()
      }

      const query = await generateQuery(
        input,
        connectionString ?? '',
        aiProvider,
        apiKey,
        existingQuery,
        promptExtension ?? '',
        openAiBaseUrl,
        model
      )
      return {
        error: null,
        data: queryResponse
      }
    } catch (error: any) {
      return {
        error: error.message,
        data: null
      }
    }
  })

  ipcMain.handle('runQuery', async (_, query) => {
    try {
      const connectionString = (await getConnectionString()) ?? ''
      if (connectionString.length === 0) {
        return { error: 'No connection string set' }
      }
      const rows = await runQuery(connectionString, query)
      return {
        error: null,
        data: rows
      }
    } catch (error: any) {
      return {
        error: error.message,
        data: null
      }
    }
  })

  ipcMain.handle('getQueryHistory', async () => {
    try {
      const history = await getQueryHistory()
      return history
    } catch (error: any) {
      console.error('Error loading query history:', error)
      return []
    }
  })

  ipcMain.handle('addQueryToHistory', async (_, queryEntry) => {
    try {
      await addQueryToHistory(queryEntry)
      return true
    } catch (error: any) {
      console.error('Error saving query to history:', error)
      return false
    }
  })

  ipcMain.handle('updateQueryHistory', async (_, queryId, updates) => {
    try {
      await updateQueryHistory(queryId, updates)
      return true
    } catch (error: any) {
      console.error('Error updating query history:', error)
      return false
    }
  })

  // Favorites Handlers
  ipcMain.handle('getFavorites', async () => {
    try {
      const favorites = await getFavorites()
      return favorites
    } catch (error: any) {
      console.error('Error loading favorites:', error)
      return []
    }
  })

  ipcMain.handle('addFavorite', async (_, favorite) => {
    try {
      await addFavorite(favorite)
      return true
    } catch (error: any) {
      console.error('Error adding favorite:', error)
      return false
    }
  })

  ipcMain.handle('removeFavorite', async (_, favoriteId) => {
    try {
      await removeFavorite(favoriteId)
      return true
    } catch (error: any) {
      console.error('Error removing favorite:', error)
      return false
    }
  })

  ipcMain.handle('updateFavorite', async (_, favoriteId, updates) => {
    try {
      await updateFavorite(favoriteId, updates)
      return true
    } catch (error: any) {
      console.error('Error updating favorite:', error)
      return false
    }
  })

  ipcMain.handle('getPromptExtension', async () => {
    return (await getPromptExtension()) ?? ''
  })

  ipcMain.handle('setPromptExtension', async (_, promptExtension) => {
    await setPromptExtension(promptExtension)
  })

  ipcMain.handle('getAiProvider', async () => {
    return await getAiProvider()
  })

  ipcMain.handle('setAiProvider', async (_, aiProvider) => {
    await setAiProvider(aiProvider)
  })

  ipcMain.handle('getClaudeApiKey', async () => {
    return (await getClaudeApiKey()) ?? ''
  })

  ipcMain.handle('setClaudeApiKey', async (_, claudeApiKey) => {
    await setClaudeApiKey(claudeApiKey)
  })

  ipcMain.handle('getClaudeModel', async () => {
    return (await getClaudeModel()) ?? ''
  })

  ipcMain.handle('setClaudeModel', async (_, claudeModel) => {
    await setClaudeModel(claudeModel)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
