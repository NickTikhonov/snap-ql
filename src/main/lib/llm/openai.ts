import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import type { LLMAdapter, LLMGenOptions } from './types'
import { stripMarkdownCodeBlocks } from './types'

export class OpenAIAdapter implements LLMAdapter {
  name = 'openai' as const
  private client
  
  constructor(apiKey: string, baseUrl?: string) {
    this.client = createOpenAI({
      apiKey,
      baseURL: baseUrl || undefined
    })
  }

  async generateText({ prompt, model = 'gpt-4o', temperature, maxTokens }: LLMGenOptions): Promise<string> {
    // Check if this is a SQL query generation prompt (contains schema information)
    if (prompt.includes('table schema') || prompt.includes('SQL') || prompt.includes('postgres')) {
      const result = await generateObject({
        model: this.client(model),
        prompt,
        schema: z.object({
          query: z.string()
        }),
        ...(temperature && { temperature }),
        ...(maxTokens && { maxTokens })
      })
      return stripMarkdownCodeBlocks(result.object.query)
    } else {
      // For general text generation, use a simpler approach
      const result = await generateObject({
        model: this.client(model),
        prompt,
        schema: z.object({
          text: z.string()
        }),
        ...(temperature && { temperature }),
        ...(maxTokens && { maxTokens })
      })
      return stripMarkdownCodeBlocks(result.object.text)
    }
  }

  // Note: Stream support can be added later if needed
  async *generateTextStream(opts: LLMGenOptions): AsyncIterable<string> {
    // For now, yield the complete response (already cleaned by generateText)
    const result = await this.generateText(opts)
    yield result
  }
} 