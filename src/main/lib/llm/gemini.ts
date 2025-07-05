import { GoogleGenerativeAI } from '@google/generative-ai'
import type { LLMAdapter, LLMGenOptions } from './types'
import { stripMarkdownCodeBlocks } from './types'

export class GeminiAdapter implements LLMAdapter {
  name = 'gemini' as const
  private client
  
  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey)
  }

  async generateText({ prompt, model = 'gemini-2.5-flash', temperature, maxTokens }: LLMGenOptions): Promise<string> {
    const generativeModel = this.client.getGenerativeModel({ 
      model,
      generationConfig: {
        ...(temperature !== undefined && { temperature }),
        ...(maxTokens !== undefined && { maxOutputTokens: maxTokens })
      }
    })
    
    const systemPrompt = `You are a SQL (postgres) and data visualization expert. Your job is to help the user write or modify a SQL query to retrieve the data they need.
    Only retrieval queries are allowed.
    Format the query in a way that is easy to read and understand.
    Wrap table names in double quotes.
    
    IMPORTANT: Please respond with ONLY the SQL query as plain text. Do NOT use markdown formatting, code blocks, or any other formatting. Just return the raw SQL query.`
    
    const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`
    
    const result = await generativeModel.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text().trim()
    return stripMarkdownCodeBlocks(text)
  }

  async *generateTextStream({ prompt, model = 'gemini-2.5-flash', temperature, maxTokens }: LLMGenOptions): AsyncIterable<string> {
    const generativeModel = this.client.getGenerativeModel({ 
      model,
      generationConfig: {
        ...(temperature !== undefined && { temperature }),
        ...(maxTokens !== undefined && { maxOutputTokens: maxTokens })
      }
    })
    
    const systemPrompt = `You are a SQL (postgres) and data visualization expert. Your job is to help the user write or modify a SQL query to retrieve the data they need.
    Only retrieval queries are allowed.
    Format the query in a way that is easy to read and understand.
    Wrap table names in double quotes.
    
    IMPORTANT: Please respond with ONLY the SQL query as plain text. Do NOT use markdown formatting, code blocks, or any other formatting. Just return the raw SQL query.`
    
    const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`
    
    const result = await generativeModel.generateContentStream(fullPrompt)
    
    let buffer = ''
    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
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