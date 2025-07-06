export interface LLMGenOptions {
  prompt: string
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface LLMAdapter {
  name: 'openai' | 'gemini'
  generateQuery(opts: LLMGenOptions): Promise<string>
  generateQueryStream?(opts: LLMGenOptions): AsyncIterable<string>
}

/**
 * Strips markdown code blocks from text, specifically targeting SQL blocks
 * Removes ```sql, ```, and ``` patterns while preserving the inner content
 */
export function stripMarkdownCodeBlocks(text: string): string {
  return text
    .trim()
    // Remove ```sql ... ``` blocks
    .replace(/```sql\s*\n?([\s\S]*?)\n?```/gi, '$1')
    // Remove ``` ... ``` blocks (generic code blocks)
    .replace(/```\s*\n?([\s\S]*?)\n?```/gi, '$1')
    // Remove inline ` ... ` if it wraps the entire content
    .replace(/^`([^`]+)`$/, '$1')
    .trim()
} 