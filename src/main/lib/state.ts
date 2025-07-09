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

export async function getOpenAiKey() {
  const settings = await getSettings()
  return settings.openAiKey
}

export async function getOpenAiBaseUrl() {
  const settings = await getSettings()
  return settings.openAiBaseUrl
}

export async function getOpenAiModel() {
  const settings = await getSettings()
  return settings.openAiModel
}

export async function setConnectionString(connectionString: string) {
  const settings = await getSettings()
  settings.connectionString = connectionString
  await setSettings(settings)
}

export async function setOpenAiKey(openAiKey: string) {
  const settings = await getSettings()
  settings.openAiKey = openAiKey
  await setSettings(settings)
}

export async function setOpenAiBaseUrl(openAiBaseUrl: string) {
  const settings = await getSettings()
  settings.openAiBaseUrl = openAiBaseUrl
  await setSettings(settings)
}

export async function setOpenAiModel(openAiModel: string) {
  const settings = await getSettings()
  settings.openAiModel = openAiModel
  await setSettings(settings)
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
  const settings = await getSettings()
  return settings.aiProvider || 'openai'
}

export async function setAiProvider(aiProvider: 'openai' | 'claude') {
  const settings = await getSettings()
  settings.aiProvider = aiProvider
  await setSettings(settings)
}

export async function getClaudeApiKey() {
  const settings = await getSettings()
  return settings.claudeApiKey
}

export async function setClaudeApiKey(claudeApiKey: string) {
  const settings = await getSettings()
  settings.claudeApiKey = claudeApiKey
  await setSettings(settings)
}

export async function getClaudeModel() {
  const settings = await getSettings()
  return settings.claudeModel
}

export async function setClaudeModel(claudeModel: string) {
  const settings = await getSettings()
  settings.claudeModel = claudeModel
  await setSettings(settings)
}
