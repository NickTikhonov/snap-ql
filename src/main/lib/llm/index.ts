import { OpenAIAdapter } from './openai'
import { GeminiAdapter } from './gemini'
import { getOpenAiKey, getOpenAiBaseUrl, getGeminiKey } from '../state'
import type { LLMAdapter } from './types'

export async function getLLM(provider: 'openai' | 'gemini'): Promise<LLMAdapter> {
  let adapter: LLMAdapter
  switch (provider) {
    case 'openai': {
      const key = await getOpenAiKey()
      const url = await getOpenAiBaseUrl()
      if (!key) {
        throw new Error('OpenAI API key is required')
      }
      adapter = new OpenAIAdapter(key, url)
      break
    }
    case 'gemini': {
      const key = await getGeminiKey()
      if (!key) {
        throw new Error('Gemini API key is required')
      }
      adapter = new GeminiAdapter(key)
      break
    }
    default:
      throw new Error(`Provider ${provider} not supported`)
  }
  return adapter
}

export type { LLMAdapter, LLMGenOptions, QueryResponse } from './types' 