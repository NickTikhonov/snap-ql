import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { getTableSchema, parseConnectionString } from './db'

export type QueryResponse = {
  query: string
  graphXColumn?: string
  graphYColumns?: string[]
}

export async function generateQuery(
  input: string,
  connectionString: string,
  aiProvider: 'openai' | 'claude',
  apiKey: string,
  existingQuery: string,
  promptExtension: string,
  openAiUrl?: string,
  model?: string
): Promise<QueryResponse> {
  try {
    const tableSchema = await getTableSchema(connectionString)
    const existing = existingQuery.trim()
    const dbType = parseConnectionString(connectionString)
    if (!dbType) {
      throw new Error('Invalid connection string')
    }

    // Configure AI provider
    let aiModel: any
    let modelToUse: string

    if (aiProvider === 'openai') {
      const openai = createOpenAI({
        apiKey: apiKey,
        baseURL: openAiUrl || undefined
      })
      modelToUse = model || 'gpt-4o'
      aiModel = openai(modelToUse)
    } else if (aiProvider === 'claude') {
      const anthropic = createAnthropic({
        apiKey: apiKey
      })
      modelToUse = model || 'claude-sonnet-4-20250514'
      aiModel = anthropic(modelToUse)
    } else {
      throw new Error(`Unsupported AI provider: ${aiProvider}`)
    }

    const systemPrompt = `
      You are a SQL (${dbType}) and data visualization expert. Your job is to help the user write or modify a SQL query to retrieve the data they need. The table schema is as follows:

      ${tableSchema}

      Only retrieval queries are allowed.

      ${existing.length > 0 ? `The user's existing query is: ${existing}` : ``}

      ${promptExtension.length > 0 ? `Extra information: ${promptExtension}` : ``}

      format the query in a way that is easy to read and understand.
      ${dbType === 'postgres' ? 'wrap table names in double quotes' : ''}
      if the query results can be effectively visualized using a graph, specify which column should be used for the x-axis (domain) and which column(s) should be used for the y-axis (range).
    `

    console.log('System prompt: ', systemPrompt)

    const result = await generateObject({
      model: aiModel,
      system: systemPrompt,
      prompt: input,
      schema: z.object({
        query: z.string(),
        graphXColumn: z.string().optional(),
        graphYColumns: z.array(z.string()).optional()
      })
    })
    return result.object as QueryResponse
  } catch (e: any) {
    console.error(e)
    throw new Error('Failed to generate query: ' + e.message)
  }
}
