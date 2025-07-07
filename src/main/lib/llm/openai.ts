import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import type { LLMAdapter, LLMGenOptions, QueryResponse } from './types'
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

  async generateQuery({ prompt, model = 'gpt-4o', temperature, maxTokens }: LLMGenOptions): Promise<QueryResponse> {
    const result = await generateObject({
      model: this.client(model),
      prompt,
      schema: z.object({
        query: z.string(),
        graphXColumn: z.string().optional(),
        graphYColumns: z.array(z.string()).optional()
      }),
      ...(temperature && { temperature }),
      ...(maxTokens && { maxTokens })
    })
    
    return {
      query: stripMarkdownCodeBlocks(result.object.query),
      graphXColumn: result.object.graphXColumn,
      graphYColumns: result.object.graphYColumns
    }
  }

  // Note: Stream support can be added later if needed
  async *generateQueryStream(opts: LLMGenOptions): AsyncIterable<string> {
    const result = await this.generateQuery(opts)
    yield result.query
  }
} 