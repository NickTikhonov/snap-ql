import { GoogleGenAI } from '@google/genai'
import type { LLMAdapter, LLMGenOptions } from './types'
import { stripMarkdownCodeBlocks } from './types'

export class GeminiAdapter implements LLMAdapter {
  name = 'gemini' as const
  private client
  
  constructor(apiKey: string) {
     
    this.client = new GoogleGenAI({ apiKey })
  }

  async generateQuery({ prompt, model = 'gemini-2.5-flash', temperature, maxTokens }: LLMGenOptions): Promise<string> {
    const config =
      temperature !== undefined || maxTokens !== undefined
        ? {
            ...(temperature !== undefined && { temperature }),
            ...(maxTokens   !== undefined && { maxOutputTokens: maxTokens }),
          }
        : undefined

    const contents = [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ]

    const response = await this.client.models.generateContent({
      model,
      contents,
      ...(config && { config }),
    })

    const text = response.text.trim()
    return stripMarkdownCodeBlocks(text)
  }

  async *generateQueryStream({ prompt, model = 'gemini-2.5-flash', temperature, maxTokens }: LLMGenOptions): AsyncIterable<string> {
    const config =
      temperature !== undefined || maxTokens !== undefined
        ? {
            ...(temperature !== undefined && { temperature }),
            ...(maxTokens   !== undefined && { maxOutputTokens: maxTokens }),
          }
        : undefined

    const contents = [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ]

    const stream = await this.client.models.generateContentStream({
      model,
      contents,
      ...(config && { config }),
    })
    
    let buffer = ''
    for await (const chunk of stream) {
      const chunkText = chunk.text
      if (chunkText) {
        buffer += chunkText
        yield chunkText
      }
    }
    
    // For streaming, we'll clean up the final result if needed
    // This is a simple approach - for more complex streaming cleanup,
    // we'd need to implement state tracking
    if (buffer.includes('```')) {
      const cleaned = stripMarkdownCodeBlocks(buffer)
      // If the cleaned version is significantly different, yield the difference
      if (cleaned !== buffer) {
        yield '\n--- Cleaned Response ---\n' + cleaned
      }
    }
  }
} 