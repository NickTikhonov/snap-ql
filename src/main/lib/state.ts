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

const settingsSchema = z.object({
  connectionString: z.string().optional(),
  openAiKey: z.string().optional(),
  openAiBaseUrl: z.string().optional(),
  openAiModel: z.string().optional(),
  queryHistory: z.array(queryHistorySchema).optional(),
  promptExtension: z.string().optional(),
  geminiKey: z.string().optional(),
  geminiModel: z.string().optional(),
  llmProvider: z.enum(['openai', 'gemini']).optional()
})

const defaultSettings: z.infer<typeof settingsSchema> = {
  connectionString: undefined,
  openAiKey: undefined,
  openAiBaseUrl: undefined,
  openAiModel: undefined,
  geminiKey: undefined,
  geminiModel: undefined,
  llmProvider: 'openai',
  queryHistory: [],
  promptExtension: undefined
}

function rootDir() {
  return `${homedir()}/SnapQL`
}

async function settingsPath() {
  const root = rootDir()
  await fs.ensureDir(root)
  return `${root}/settings.json`
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
    await fs.writeJson(path, settings)
  }
  return settings
}

async function setSettings(settings: z.infer<typeof settingsSchema>) {
  const path = await settingsPath()
  await fs.writeJson(path, settings)
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

export async function getGeminiKey() {
  const settings = await getSettings()
  return settings.geminiKey
}

export async function setGeminiKey(geminiKey: string) {
  const settings = await getSettings()
  settings.geminiKey = geminiKey
  await setSettings(settings)
}

export async function getGeminiModel() {
  const settings = await getSettings()
  return settings.geminiModel
}

export async function setGeminiModel(geminiModel: string) {
  const settings = await getSettings()
  settings.geminiModel = geminiModel
  await setSettings(settings)
}

export async function getLLMProvider() {
  const settings = await getSettings()
  return settings.llmProvider || 'openai'
}

export async function setLLMProvider(provider: 'openai' | 'gemini') {
  const settings = await getSettings()
  settings.llmProvider = provider
  await setSettings(settings)
}

export async function getQueryHistory() {
  const settings = await getSettings()
  return settings.queryHistory || []
}

export async function setQueryHistory(queryHistory: z.infer<typeof queryHistorySchema>[]) {
  const settings = await getSettings()
  settings.queryHistory = queryHistory
  await setSettings(settings)
}

export async function addQueryToHistory(query: z.infer<typeof queryHistorySchema>) {
  const settings = await getSettings()
  const currentHistory = settings.queryHistory || []
  const newHistory = [query, ...currentHistory.slice(0, 19)] // Keep last 20 queries
  settings.queryHistory = newHistory
  await setSettings(settings)
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
