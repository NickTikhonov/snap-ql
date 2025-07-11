import { contextBridge, ipcRenderer } from 'electron'

if (!process.contextIsolated) {
  throw new Error('Context isolation must be enabled!')
}

try {
  contextBridge.exposeInMainWorld('context', {
    locale: navigator.language,
    // AI Provider settings
    getOpenAiKey: async () => await ipcRenderer.invoke('getOpenAiKey'),
    setOpenAiKey: async (openAiKey: string) => await ipcRenderer.invoke('setOpenAiKey', openAiKey),
    getOpenAiBaseUrl: async () => await ipcRenderer.invoke('getOpenAiBaseUrl'),
    setOpenAiBaseUrl: async (openAiBaseUrl: string) =>
      await ipcRenderer.invoke('setOpenAiBaseUrl', openAiBaseUrl),
    getOpenAiModel: async () => await ipcRenderer.invoke('getOpenAiModel'),
    setOpenAiModel: async (openAiModel: string) =>
      await ipcRenderer.invoke('setOpenAiModel', openAiModel),
    getAiProvider: async () => await ipcRenderer.invoke('getAiProvider'),
    setAiProvider: async (aiProvider: 'openai' | 'claude' | 'gemini') =>
      await ipcRenderer.invoke('setAiProvider', aiProvider),
    getClaudeApiKey: async () => await ipcRenderer.invoke('getClaudeApiKey'),
    setClaudeApiKey: async (claudeApiKey: string) =>
      await ipcRenderer.invoke('setClaudeApiKey', claudeApiKey),
    getClaudeModel: async () => await ipcRenderer.invoke('getClaudeModel'),
    setClaudeModel: async (claudeModel: string) =>
      await ipcRenderer.invoke('setClaudeModel', claudeModel),
    getGeminiApiKey: async () => await ipcRenderer.invoke('getGeminiApiKey'),
    setGeminiApiKey: async (geminiApiKey: string) =>
      await ipcRenderer.invoke('setGeminiApiKey', geminiApiKey),
    getGeminiModel: async () => await ipcRenderer.invoke('getGeminiModel'),
    setGeminiModel: async (geminiModel: string) =>
      await ipcRenderer.invoke('setGeminiModel', geminiModel),

    // Connection management
    createConnection: async (name: string, connectionMetadata: any) =>
      await ipcRenderer.invoke('createConnection', name, connectionMetadata),
    editConnection: async (name: string, connectionMetadata: any) =>
      await ipcRenderer.invoke('editConnection', name, connectionMetadata),
    listConnections: async () => await ipcRenderer.invoke('listConnections'),
    getConnection: async (name: string) => await ipcRenderer.invoke('getConnection', name),
    deleteConnection: async (name: string) => await ipcRenderer.invoke('deleteConnection', name),
    getConnectionHistory: async (name: string) =>
      await ipcRenderer.invoke('getConnectionHistory', name),
    addQueryToConnectionHistory: async (name: string, queryEntry: any) =>
      await ipcRenderer.invoke('addQueryToConnectionHistory', name, queryEntry),
    updateConnectionHistory: async (name: string, queryId: string, updates: any) =>
      await ipcRenderer.invoke('updateConnectionHistory', name, queryId, updates),
    getConnectionFavorites: async (name: string) =>
      await ipcRenderer.invoke('getConnectionFavorites', name),
    addConnectionFavorite: async (name: string, favorite: any) =>
      await ipcRenderer.invoke('addConnectionFavorite', name, favorite),
    removeConnectionFavorite: async (name: string, favoriteId: string) =>
      await ipcRenderer.invoke('removeConnectionFavorite', name, favoriteId),
    updateConnectionFavorite: async (name: string, favoriteId: string, updates: any) =>
      await ipcRenderer.invoke('updateConnectionFavorite', name, favoriteId, updates),
    getConnectionPromptExtension: async (name: string) =>
      await ipcRenderer.invoke('getConnectionPromptExtension', name),
    setConnectionPromptExtension: async (name: string, promptExtension: string) =>
      await ipcRenderer.invoke('setConnectionPromptExtension', name, promptExtension),
    runQueryForConnection: async (name: string, query: string) =>
      await ipcRenderer.invoke('runQueryForConnection', name, query),
    generateQueryForConnection: async (name: string, input: string, existingQuery: string) =>
      await ipcRenderer.invoke('generateQueryForConnection', name, input, existingQuery),
    testConnectionString: async (connectionString: string) =>
      await ipcRenderer.invoke('testConnectionString', connectionString),
    getDatabaseSchema: async (connectionName: string) =>
      await ipcRenderer.invoke('getDatabaseSchema', connectionName),
    getConnectionDatabaseType: async (connectionName: string) =>
      await ipcRenderer.invoke('getConnectionDatabaseType', connectionName)
  })
} catch (error) {
  console.error(error)
}
