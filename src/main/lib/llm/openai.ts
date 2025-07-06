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

  async generateQuery({ prompt, model = 'gpt-4o', temperature, maxTokens }: LLMGenOptions): Promise<string> {
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
  }

  // Note: Stream support can be added later if needed
  async *generateQueryStream(opts: LLMGenOptions): AsyncIterable<string> {
    const result = await this.generateQuery(opts)
    yield result
  }
} 