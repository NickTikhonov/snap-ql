import { QueryResponse } from '../main/lib/llm/types'

declare global {
  interface Window {
    context: {
      locale: string
      getConnectionString: () => Promise<string>
      setConnectionString: (connectionString: string) => Promise<boolean>
      runQuery: (query: string) => Promise<{ error: string | null; data: any }>
      generateQuery: (
        input: string,
        sqlQuery: string
      ) => Promise<{ error: string | null; data: QueryResponse }>
      generateWithLLM: (
        provider: 'openai' | 'gemini',
        prompt: string,
        opts?: Partial<{
          model: string
          temperature: number
          maxTokens: number
          stream: boolean
        }>
      ) => Promise<{ error: string | null; data: QueryResponse }>
      getOpenAiKey: () => Promise<string>
      setOpenAiKey: (openAiKey: string) => Promise<boolean>
      getOpenAiBaseUrl: () => Promise<string>
      setOpenAiBaseUrl: (openAiBaseUrl: string) => Promise<boolean>
      getOpenAiModel: () => Promise<string>
      setOpenAiModel: (openAiModel: string) => Promise<boolean>
      getGeminiKey: () => Promise<string>
      setGeminiKey: (geminiKey: string) => Promise<boolean>
      getGeminiModel: () => Promise<string>
      setGeminiModel: (geminiModel: string) => Promise<boolean>
      getLLMProvider: () => Promise<'openai' | 'gemini'>
      setLLMProvider: (provider: 'openai' | 'gemini') => Promise<boolean>
      getQueryHistory: () => Promise<any[]>
      addQueryToHistory: (queryEntry: any) => Promise<boolean>
      updateQueryHistory: (queryId: string, updates: any) => Promise<boolean>
      getFavorites: () => Promise<any[]>
      addFavorite: (favorite: any) => Promise<boolean>
      removeFavorite: (favoriteId: string) => Promise<boolean>
      updateFavorite: (favoriteId: string, updates: any) => Promise<boolean>
      getPromptExtension: () => Promise<string>
      setPromptExtension: (promptExtension: string) => Promise<boolean>
      getAiProvider: () => Promise<'openai' | 'claude'>
      setAiProvider: (aiProvider: 'openai' | 'claude') => Promise<boolean>
      getClaudeApiKey: () => Promise<string>
      setClaudeApiKey: (claudeApiKey: string) => Promise<boolean>
      getClaudeModel: () => Promise<string>
      setClaudeModel: (claudeModel: string) => Promise<boolean>
    }
  }
}

export {}
