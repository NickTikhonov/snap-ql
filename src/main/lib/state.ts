import { homedir } from 'os'
import fs from 'fs-extra'

import { z } from 'zod'

const queryHistorySchema = z.object({
  id: z.string(),
  query: z.string(),
  results: z.array(z.any()),
  graph: z
    .object({
      graphXColumn: z.string(),
      graphYColumns: z.array(z.string())
    })
    .optional(),
  timestamp: z.string() // ISO string format
})

const favoritesSchema = z.object({
  id: z.string(),
  query: z.string(),
  results: z.array(z.any()),
  graph: z
    .object({
      graphXColumn: z.string(),
      graphYColumns: z.array(z.string())
    })
    .optional(),
  timestamp: z.string() // ISO string format
})

// Global settings schema (AI provider settings only)
const globalSettingsSchema = z.object({
  aiProvider: z.enum(['openai', 'claude']).optional(),
  openAiKey: z.string().optional(),
  openAiBaseUrl: z.string().optional(),
  openAiModel: z.string().optional(),
  claudeApiKey: z.string().optional(),
  claudeModel: z.string().optional()
})

// Connection settings schema
const connectionSettingsSchema = z.object({
  connectionString: z.string(),
  promptExtension: z.string().optional()
})

// Legacy settings schema for backward compatibility
const settingsSchema = z.object({
  connectionString: z.string().optional(),
  aiProvider: z.enum(['openai', 'claude']).optional(),
  openAiKey: z.string().optional(),
  openAiBaseUrl: z.string().optional(),
  openAiModel: z.string().optional(),
  claudeApiKey: z.string().optional(),
  claudeModel: z.string().optional(),
  promptExtension: z.string().optional()
})

const defaultGlobalSettings: z.infer<typeof globalSettingsSchema> = {
  aiProvider: 'openai',
  openAiKey: undefined,
  openAiBaseUrl: undefined,
  openAiModel: undefined,
  claudeApiKey: undefined,
  claudeModel: undefined
}

const defaultSettings: z.infer<typeof settingsSchema> = {
  connectionString: undefined,
  aiProvider: 'openai',
  openAiKey: undefined,
  openAiBaseUrl: undefined,
  openAiModel: undefined,
  claudeApiKey: undefined,
  claudeModel: undefined,
  promptExtension: undefined
}

function rootDir() {
  // Allow tests to override the root directory
  if (process.env.SNAPQL_TEST_ROOT) {
    return process.env.SNAPQL_TEST_ROOT
  }
  return `${homedir()}/SnapQL`
}

function connectionsDir() {
  return `${rootDir()}/connections`
}

function connectionDir(connectionName: string) {
  return `${connectionsDir()}/${connectionName}`
}

async function settingsPath() {
  const root = rootDir()
  await fs.ensureDir(root)
  return `${root}/settings.json`
}

async function historyPath() {
  const root = rootDir()
  await fs.ensureDir(root)
  return `${root}/history.json`
}

async function favoritesPath() {
  const root = rootDir()
  await fs.ensureDir(root)
  return `${root}/favorites.json`
}

async function connectionSettingsPath(connectionName: string) {
  const connDir = connectionDir(connectionName)
  await fs.ensureDir(connDir)
  return `${connDir}/settings.json`
}

async function connectionHistoryPath(connectionName: string) {
  const connDir = connectionDir(connectionName)
  await fs.ensureDir(connDir)
  return `${connDir}/history.json`
}

async function connectionFavoritesPath(connectionName: string) {
  const connDir = connectionDir(connectionName)
  await fs.ensureDir(connDir)
  return `${connDir}/favorites.json`
}

async function getSettings(): Promise<z.infer<typeof settingsSchema>> {
  const path = await settingsPath()
  let settings
  try {
    settings = await fs.readJson(path)
    settings = settingsSchema.parse(settings)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(error.message)
    }
    settings = defaultSettings
    await fs.writeJson(path, settings, { spaces: 2 })
  }
  return settings
}

async function getGlobalSettings(): Promise<z.infer<typeof globalSettingsSchema>> {
  const path = await settingsPath()
  let settings
  try {
    settings = await fs.readJson(path)
    settings = globalSettingsSchema.parse(settings)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(error.message)
    }
    settings = defaultGlobalSettings
    await fs.writeJson(path, settings, { spaces: 2 })
  }
  return settings
}

async function setGlobalSettings(settings: z.infer<typeof globalSettingsSchema>) {
  const path = await settingsPath()

  // Read existing settings to preserve legacy fields like connectionString
  let existingSettings = {}
  try {
    existingSettings = await fs.readJson(path)
  } catch (error) {
    // File doesn't exist, that's okay
  }

  // Merge global settings with existing settings
  const mergedSettings = { ...existingSettings, ...settings }
  await fs.writeJson(path, mergedSettings, { spaces: 2 })
}

async function getConnectionSettings(
  connectionName: string
): Promise<z.infer<typeof connectionSettingsSchema>> {
  const path = await connectionSettingsPath(connectionName)
  let settings
  try {
    settings = await fs.readJson(path)
    settings = connectionSettingsSchema.parse(settings)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(error.message)
    }
    throw new Error(`Connection '${connectionName}' not found`)
  }
  return settings
}

async function setConnectionSettings(
  connectionName: string,
  settings: z.infer<typeof connectionSettingsSchema>
) {
  const path = await connectionSettingsPath(connectionName)
  await fs.writeJson(path, settings, { spaces: 2 })
}

async function setSettings(settings: z.infer<typeof settingsSchema>) {
  const path = await settingsPath()
  await fs.writeJson(path, settings, { spaces: 2 })
}

async function getHistory(): Promise<z.infer<typeof queryHistorySchema>[]> {
  await migrateHistoryFromSettings()

  const path = await historyPath()
  let history
  try {
    history = await fs.readJson(path)
    history = z.array(queryHistorySchema).parse(history)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(error.message)
    }
    history = []
    await fs.writeJson(path, history, { spaces: 2 })
  }
  return history
}

async function setHistory(history: z.infer<typeof queryHistorySchema>[]) {
  const path = await historyPath()
  await fs.writeJson(path, history, { spaces: 2 })
}

// Migrates history from settings.json to history.json (to support pre 7 july 2025)
async function migrateHistoryFromSettings() {
  const settingsFile = await settingsPath()
  const historyFile = await historyPath()

  // Check if history file already exists
  if (await fs.pathExists(historyFile)) {
    return
  }

  // Check if settings file exists and contains history
  if (await fs.pathExists(settingsFile)) {
    try {
      const settingsData = await fs.readJson(settingsFile)
      if (settingsData.queryHistory && Array.isArray(settingsData.queryHistory)) {
        // Migrate history to new file
        await fs.writeJson(historyFile, settingsData.queryHistory, { spaces: 2 })

        // Remove history from settings
        delete settingsData.queryHistory
        await fs.writeJson(settingsFile, settingsData, { spaces: 2 })

        console.log('Migrated query history from settings.json to history.json')
      }
    } catch (error) {
      console.error('Error migrating history:', error)
    }
  }
}

export async function getConnectionString() {
  const settings = await getSettings()
  return settings.connectionString
}

export async function getConnectionStringForConnection(name: string): Promise<string> {
  const settings = await getConnectionSettings(name)
  return settings.connectionString
}

export async function getOpenAiKey() {
  const settings = await getGlobalSettings()
  return settings.openAiKey
}

export async function getOpenAiBaseUrl() {
  const settings = await getGlobalSettings()
  return settings.openAiBaseUrl
}

export async function getOpenAiModel() {
  const settings = await getGlobalSettings()
  return settings.openAiModel
}

export async function setConnectionString(connectionString: string) {
  const settings = await getSettings()
  settings.connectionString = connectionString
  await setSettings(settings)
}

export async function setOpenAiKey(openAiKey: string) {
  const settings = await getGlobalSettings()
  settings.openAiKey = openAiKey
  await setGlobalSettings(settings)
}

export async function setOpenAiBaseUrl(openAiBaseUrl: string) {
  const settings = await getGlobalSettings()
  settings.openAiBaseUrl = openAiBaseUrl
  await setGlobalSettings(settings)
}

export async function setOpenAiModel(openAiModel: string) {
  const settings = await getGlobalSettings()
  settings.openAiModel = openAiModel
  await setGlobalSettings(settings)
}

export async function getQueryHistory() {
  return await getHistory()
}

export async function setQueryHistory(queryHistory: z.infer<typeof queryHistorySchema>[]) {
  await setHistory(queryHistory)
}

export async function addQueryToHistory(query: z.infer<typeof queryHistorySchema>) {
  const currentHistory = await getHistory()
  const newHistory = [query, ...currentHistory.slice(0, 19)] // Keep last 20 queries
  await setHistory(newHistory)
}

export async function updateQueryHistory(
  queryId: string,
  updates: Partial<z.infer<typeof queryHistorySchema>>
) {
  const currentHistory = await getHistory()
  const updatedHistory = currentHistory.map((query) =>
    query.id === queryId ? { ...query, ...updates } : query
  )
  await setHistory(updatedHistory)
}

// Favorites management
async function getFavoritesData() {
  try {
    const path = await favoritesPath()
    const exists = await fs.pathExists(path)
    if (!exists) {
      return []
    }
    const data = await fs.readJson(path)
    const parsed = z.array(favoritesSchema).safeParse(data)
    if (!parsed.success) {
      console.error('Invalid favorites data:', parsed.error)
      return []
    }
    return parsed.data
  } catch (error) {
    console.error('Error reading favorites:', error)
    return []
  }
}

async function setFavoritesData(favorites: z.infer<typeof favoritesSchema>[]) {
  try {
    const path = await favoritesPath()
    await fs.writeJson(path, favorites, { spaces: 2 })
  } catch (error) {
    console.error('Error writing favorites:', error)
  }
}

export async function getFavorites() {
  return await getFavoritesData()
}

export async function addFavorite(favorite: z.infer<typeof favoritesSchema>) {
  const currentFavorites = await getFavoritesData()
  const newFavorites = [favorite, ...currentFavorites]
  await setFavoritesData(newFavorites)
}

export async function removeFavorite(favoriteId: string) {
  const currentFavorites = await getFavoritesData()
  const newFavorites = currentFavorites.filter((fav) => fav.id !== favoriteId)
  await setFavoritesData(newFavorites)
}

export async function updateFavorite(
  favoriteId: string,
  updates: Partial<z.infer<typeof favoritesSchema>>
) {
  const currentFavorites = await getFavoritesData()
  const updatedFavorites = currentFavorites.map((favorite) =>
    favorite.id === favoriteId ? { ...favorite, ...updates } : favorite
  )
  await setFavoritesData(updatedFavorites)
}

export async function getPromptExtension() {
  const settings = await getSettings()
  return settings.promptExtension
}

export async function setPromptExtension(promptExtension: string) {
  const settings = await getSettings()
  let val: string | undefined = promptExtension.trim()
  if (val.length === 0) {
    val = undefined
  }
  settings.promptExtension = val
  await setSettings(settings)
}

export async function getAiProvider() {
  const settings = await getGlobalSettings()
  return settings.aiProvider || 'openai'
}

export async function setAiProvider(aiProvider: 'openai' | 'claude') {
  const settings = await getGlobalSettings()
  settings.aiProvider = aiProvider
  await setGlobalSettings(settings)
}

export async function getClaudeApiKey() {
  const settings = await getGlobalSettings()
  return settings.claudeApiKey
}

export async function setClaudeApiKey(claudeApiKey: string) {
  const settings = await getGlobalSettings()
  settings.claudeApiKey = claudeApiKey
  await setGlobalSettings(settings)
}

export async function getClaudeModel() {
  const settings = await getGlobalSettings()
  return settings.claudeModel
}

export async function setClaudeModel(claudeModel: string) {
  const settings = await getGlobalSettings()
  settings.claudeModel = claudeModel
  await setGlobalSettings(settings)
}

// Connection management
export async function createConnection(
  name: string,
  connectionMetadata: z.infer<typeof connectionSettingsSchema>
): Promise<void> {
  const connectionPath = connectionDir(name)

  // Check if connection already exists
  if (await fs.pathExists(connectionPath)) {
    throw new Error(`Connection '${name}' already exists`)
  }

  // Create connection directory and settings
  await fs.ensureDir(connectionPath)
  await setConnectionSettings(name, connectionMetadata)

  // Initialize empty history and favorites
  await fs.writeJson(await connectionHistoryPath(name), [], { spaces: 2 })
  await fs.writeJson(await connectionFavoritesPath(name), [], { spaces: 2 })
}

export async function editConnection(
  name: string,
  connectionMetadata: z.infer<typeof connectionSettingsSchema>
): Promise<void> {
  const connectionPath = connectionDir(name)

  // Check if connection exists
  if (!(await fs.pathExists(connectionPath))) {
    throw new Error(`Connection '${name}' not found`)
  }

  await setConnectionSettings(name, connectionMetadata)
}

export async function listConnections(): Promise<string[]> {
  const connectionsPath = connectionsDir()

  if (!(await fs.pathExists(connectionsPath))) {
    return []
  }

  const entries = await fs.readdir(connectionsPath)
  const connections: string[] = []

  for (const entry of entries) {
    const entryPath = `${connectionsPath}/${entry}`
    const stat = await fs.stat(entryPath)
    if (stat.isDirectory()) {
      // Check if it has a settings.json file
      const settingsPath = `${entryPath}/settings.json`
      if (await fs.pathExists(settingsPath)) {
        connections.push(entry)
      }
    }
  }

  return connections
}

export async function getConnection(
  name: string
): Promise<z.infer<typeof connectionSettingsSchema>> {
  return await getConnectionSettings(name)
}

export async function deleteConnection(name: string): Promise<void> {
  const connectionPath = connectionDir(name)

  // Check if connection exists
  if (!(await fs.pathExists(connectionPath))) {
    throw new Error(`Connection '${name}' not found`)
  }

  await fs.remove(connectionPath)
}

export async function getConnectionHistory(
  name: string
): Promise<z.infer<typeof queryHistorySchema>[]> {
  const path = await connectionHistoryPath(name)

  if (!(await fs.pathExists(path))) {
    return []
  }

  try {
    const history = await fs.readJson(path)
    return z.array(queryHistorySchema).parse(history)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(error.message)
    }
    return []
  }
}

export async function setConnectionHistory(
  name: string,
  history: z.infer<typeof queryHistorySchema>[]
): Promise<void> {
  const path = await connectionHistoryPath(name)
  await fs.writeJson(path, history, { spaces: 2 })
}

export async function addQueryToConnectionHistory(
  name: string,
  query: z.infer<typeof queryHistorySchema>
): Promise<void> {
  const currentHistory = await getConnectionHistory(name)
  const newHistory = [query, ...currentHistory.slice(0, 19)] // Keep last 20 queries
  await setConnectionHistory(name, newHistory)
}

export async function getConnectionFavorites(
  name: string
): Promise<z.infer<typeof favoritesSchema>[]> {
  const path = await connectionFavoritesPath(name)

  if (!(await fs.pathExists(path))) {
    return []
  }

  try {
    const favorites = await fs.readJson(path)
    return z.array(favoritesSchema).parse(favorites)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(error.message)
    }
    return []
  }
}

export async function setConnectionFavorites(
  name: string,
  favorites: z.infer<typeof favoritesSchema>[]
): Promise<void> {
  const path = await connectionFavoritesPath(name)
  await fs.writeJson(path, favorites, { spaces: 2 })
}

export async function addConnectionFavorite(
  name: string,
  favorite: z.infer<typeof favoritesSchema>
): Promise<void> {
  const currentFavorites = await getConnectionFavorites(name)
  const newFavorites = [favorite, ...currentFavorites]
  await setConnectionFavorites(name, newFavorites)
}

export async function removeConnectionFavorite(name: string, favoriteId: string): Promise<void> {
  const currentFavorites = await getConnectionFavorites(name)
  const newFavorites = currentFavorites.filter((fav) => fav.id !== favoriteId)
  await setConnectionFavorites(name, newFavorites)
}

export async function getConnectionPromptExtension(name: string): Promise<string | undefined> {
  const settings = await getConnectionSettings(name)
  return settings.promptExtension
}

export async function setConnectionPromptExtension(
  name: string,
  promptExtension: string
): Promise<void> {
  const settings = await getConnectionSettings(name)
  let val: string | undefined = promptExtension.trim()
  if (val.length === 0) {
    val = undefined
  }
  settings.promptExtension = val
  await setConnectionSettings(name, settings)
}
