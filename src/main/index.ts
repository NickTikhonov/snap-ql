import { app, shell, BrowserWindow, ipcMain } from 'electron'
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
  setConnectionString,
  getPromptExtension,
  setPromptExtension,
  getGeminiKey,
  setGeminiKey,
  getGeminiModel,
  setGeminiModel,
  getLLMProvider,
  setLLMProvider
} from './lib/state'
import { getLLM } from './lib/llm'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    minWidth: 600,
    height: 670,
    show: false,
    autoHideMenuBar: true,
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
      const provider = await getLLMProvider()
      
      // Get table schema for context
      const { getTableSchema } = await import('./lib/db')
      const tableSchema = await getTableSchema(connectionString ?? '')
      
      const existing = existingQuery?.trim() || ''
      
      // Get the prompt extension for additional user instructions
      const promptExtension = (await getPromptExtension()) || ''
      
      const dbType = 'postgres' // You can make this configurable later
      
      const llm = await getLLM(provider)
      
      // Combine system and prompt into a single prompt for the LLM adapter
      const combinedPrompt = `You are a SQL (${dbType}) and data visualization expert. Your job is to help the user write or modify a SQL query to retrieve the data they need. The table schema is as follows:
      ${tableSchema}
      Only retrieval queries are allowed.

      ${existing.length > 0 ? `The user's existing query is: ${existing}` : ``}

      ${promptExtension.length > 0 ? `Extra information: ${promptExtension}` : ``}

      format the query in a way that is easy to read and understand.
      ${dbType === 'postgres' ? 'wrap table names in double quotes' : ''}
      if the query results can be effectively visualized using a graph, specify which column should be used for the x-axis (domain) and which column(s) should be used for the y-axis (range).

      Generate the query necessary to retrieve the data the user wants: ${input}`
      
      const queryResponse = await llm.generateQuery({
        prompt: combinedPrompt,
        model: provider === 'openai' ? (await getOpenAiModel()) || 'gpt-4o' : (await getGeminiModel()) || 'gemini-2.5-flash'
      })
      
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

  ipcMain.handle('getPromptExtension', async () => {
    return (await getPromptExtension()) ?? ''
  })

  ipcMain.handle('setPromptExtension', async (_, promptExtension) => {
    await setPromptExtension(promptExtension)
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
