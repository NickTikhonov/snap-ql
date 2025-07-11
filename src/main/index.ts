import { app, shell, BrowserWindow, ipcMain, Menu, MenuItemConstructorOptions } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../logo.png?asset'
import { runQuery, testConnectionString, getDatabaseSchema } from './lib/db'
import {
  getOpenAiKey,
  setOpenAiKey,
  getOpenAiBaseUrl,
  setOpenAiBaseUrl,
  getOpenAiModel,
  setOpenAiModel,
  getAiProvider,
  setAiProvider,
  getClaudeApiKey,
  setClaudeApiKey,
  getClaudeModel,
  setClaudeModel,
  getGeminiApiKey,
  setGeminiApiKey,
  getGeminiModel,
  setGeminiModel,
  // Connection management functions
  createConnection,
  editConnection,
  listConnections,
  getConnection,
  deleteConnection,
  getConnectionHistory,
  addQueryToConnectionHistory,
  updateConnectionHistory,
  getConnectionFavorites,
  addConnectionFavorite,
  removeConnectionFavorite,
  updateConnectionFavorite,
  getConnectionPromptExtension,
  setConnectionPromptExtension,
  getConnectionStringForConnection,
  getConnectionDatabaseType
} from './lib/state'
import { generateQuery } from './lib/ai'

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

  ipcMain.handle('getGeminiApiKey', async () => {
    return (await getGeminiApiKey()) ?? ''
  })

  ipcMain.handle('setGeminiApiKey', async (_, geminiApiKey) => {
    await setGeminiApiKey(geminiApiKey)
  })

  ipcMain.handle('getGeminiModel', async () => {
    return (await getGeminiModel()) ?? ''
  })

  ipcMain.handle('setGeminiModel', async (_, geminiModel) => {
    await setGeminiModel(geminiModel)
  })

  // Connection management handlers
  ipcMain.handle('createConnection', async (_, name, connectionMetadata) => {
    try {
      await testConnectionString(connectionMetadata.connectionString)
      await createConnection(name, connectionMetadata)
    } catch (error: any) {
      throw new Error(error.message)
    }
  })

  ipcMain.handle('editConnection', async (_, name, connectionMetadata) => {
    try {
      await testConnectionString(connectionMetadata.connectionString)
      await editConnection(name, connectionMetadata)
    } catch (error: any) {
      throw new Error(error.message)
    }
  })

  ipcMain.handle('listConnections', async () => {
    try {
      const connections = await listConnections()
      return connections
    } catch (error: any) {
      console.error('Error listing connections:', error)
      return []
    }
  })

  ipcMain.handle('getConnection', async (_, name) => {
    try {
      const connection = await getConnection(name)
      return connection
    } catch (error: any) {
      throw new Error(error.message)
    }
  })

  ipcMain.handle('deleteConnection', async (_, name) => {
    try {
      await deleteConnection(name)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('getConnectionHistory', async (_, name) => {
    try {
      const history = await getConnectionHistory(name)
      return history
    } catch (error: any) {
      console.error('Error loading connection history:', error)
      return []
    }
  })

  ipcMain.handle('addQueryToConnectionHistory', async (_, name, queryEntry) => {
    try {
      await addQueryToConnectionHistory(name, queryEntry)
      return true
    } catch (error: any) {
      console.error('Error saving query to connection history:', error)
      return false
    }
  })

  ipcMain.handle('updateConnectionHistory', async (_, name, queryId, updates) => {
    try {
      await updateConnectionHistory(name, queryId, updates)
      return true
    } catch (error: any) {
      console.error('Error updating connection history:', error)
      return false
    }
  })

  ipcMain.handle('getConnectionFavorites', async (_, name) => {
    try {
      const favorites = await getConnectionFavorites(name)
      return favorites
    } catch (error: any) {
      console.error('Error loading connection favorites:', error)
      return []
    }
  })

  ipcMain.handle('addConnectionFavorite', async (_, name, favorite) => {
    try {
      await addConnectionFavorite(name, favorite)
      return true
    } catch (error: any) {
      console.error('Error adding connection favorite:', error)
      return false
    }
  })

  ipcMain.handle('removeConnectionFavorite', async (_, name, favoriteId) => {
    try {
      await removeConnectionFavorite(name, favoriteId)
      return true
    } catch (error: any) {
      console.error('Error removing connection favorite:', error)
      return false
    }
  })

  ipcMain.handle('updateConnectionFavorite', async (_, name, favoriteId, updates) => {
    try {
      await updateConnectionFavorite(name, favoriteId, updates)
      return true
    } catch (error: any) {
      console.error('Error updating connection favorite:', error)
      return false
    }
  })

  ipcMain.handle('getConnectionPromptExtension', async (_, name) => {
    try {
      const promptExtension = await getConnectionPromptExtension(name)
      return promptExtension ?? ''
    } catch (error: any) {
      console.error('Error loading connection prompt extension:', error)
      return ''
    }
  })

  ipcMain.handle('setConnectionPromptExtension', async (_, name, promptExtension) => {
    try {
      await setConnectionPromptExtension(name, promptExtension)
      return true
    } catch (error: any) {
      console.error('Error setting connection prompt extension:', error)
      return false
    }
  })

  ipcMain.handle('runQueryForConnection', async (_, name, query) => {
    try {
      const connectionString = await getConnectionStringForConnection(name)
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

  ipcMain.handle('generateQueryForConnection', async (_, name, input, existingQuery) => {
    try {
      console.log('Generating query for connection:', name, 'with input:', input)
      const connectionString = await getConnectionStringForConnection(name)
      const aiProvider = await getAiProvider()
      const promptExtension = await getConnectionPromptExtension(name)

      let apiKey: string
      let model: string | undefined
      let openAiBaseUrl: string | undefined

      if (aiProvider === 'openai') {
        apiKey = (await getOpenAiKey()) ?? ''
        model = await getOpenAiModel()
        openAiBaseUrl = await getOpenAiBaseUrl()
      } else if (aiProvider === 'claude') {
        apiKey = (await getClaudeApiKey()) ?? ''
        model = await getClaudeModel()
      } else {
        apiKey = (await getGeminiApiKey()) ?? ''
        model = await getGeminiModel()
      }

      const query = await generateQuery(
        input,
        connectionString,
        aiProvider,
        apiKey,
        existingQuery,
        promptExtension ?? '',
        openAiBaseUrl,
        model
      )
      return {
        error: null,
        data: query
      }
    } catch (error: any) {
      return {
        error: error.message,
        data: null
      }
    }
  })

  ipcMain.handle('testConnectionString', async (_, connectionString) => {
    try {
      await testConnectionString(connectionString)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('getDatabaseSchema', async (_, connectionName) => {
    try {
      const connectionString = await getConnectionStringForConnection(connectionName)
      const schema = await getDatabaseSchema(connectionString)
      return {
        error: null,
        data: schema
      }
    } catch (error: any) {
      return {
        error: error.message,
        data: null
      }
    }
  })

  ipcMain.handle('getConnectionDatabaseType', async (_, connectionName) => {
    try {
      const dbType = await getConnectionDatabaseType(connectionName)
      return dbType
    } catch (error: any) {
      console.error('Failed to get database type:', error)
      return null
    }
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
