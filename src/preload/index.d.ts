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
      ) => Promise<{ error: string | null; data: string }>
      generateWithLLM: (
        provider: 'openai' | 'gemini',
        prompt: string,
        opts?: Partial<{
          model: string
          temperature: number
          maxTokens: number
          stream: boolean
        }>
      ) => Promise<{ error: string | null; data: string }>
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
    }
  }
}

export {}
