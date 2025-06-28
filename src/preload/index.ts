import { contextBridge, ipcRenderer } from 'electron'

if (!process.contextIsolated) {
  throw new Error('Context isolation must be enabled!')
}

try {
  contextBridge.exposeInMainWorld('context', {
    locale: navigator.language,
    getConnectionString: async () => await ipcRenderer.invoke('getConnectionString'),
    setConnectionString: async (connectionString: string) =>
      await ipcRenderer.invoke('setConnectionString', connectionString),
    runQuery: async (query: string) => await ipcRenderer.invoke('runQuery', query),
    generateQuery: async (input: string, sqlQuery: string) =>
      await ipcRenderer.invoke('generateQuery', input, sqlQuery),
    generateWithLLM: async (
      provider: 'openai' | 'gemini',
      prompt: string,
      opts?: Partial<{
        model: string
        temperature: number
        maxTokens: number
        stream: boolean
      }>
    ) => ipcRenderer.invoke('generateWithLLM', provider, prompt, opts),
    getOpenAiKey: async () => await ipcRenderer.invoke('getOpenAiKey'),
    setOpenAiKey: async (openAiKey: string) => await ipcRenderer.invoke('setOpenAiKey', openAiKey),
    getOpenAiBaseUrl: async () => await ipcRenderer.invoke('getOpenAiBaseUrl'),
    setOpenAiBaseUrl: async (openAiBaseUrl: string) =>
      await ipcRenderer.invoke('setOpenAiBaseUrl', openAiBaseUrl),
    getOpenAiModel: async () => await ipcRenderer.invoke('getOpenAiModel'),
    setOpenAiModel: async (openAiModel: string) =>
      await ipcRenderer.invoke('setOpenAiModel', openAiModel),
    getGeminiKey: async () => await ipcRenderer.invoke('getGeminiKey'),
    setGeminiKey: async (geminiKey: string) => await ipcRenderer.invoke('setGeminiKey', geminiKey),
    getGeminiModel: async () => await ipcRenderer.invoke('getGeminiModel'),
    setGeminiModel: async (geminiModel: string) => await ipcRenderer.invoke('setGeminiModel', geminiModel),
    getLLMProvider: async () => await ipcRenderer.invoke('getLLMProvider'),
    setLLMProvider: async (provider: 'openai' | 'gemini') =>
      await ipcRenderer.invoke('setLLMProvider', provider),
 
  })
} catch (error) {
  console.error(error)
}
