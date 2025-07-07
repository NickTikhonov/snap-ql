import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card } from '../components/ui/card'
import { Bot, Send, Sparkles } from 'lucide-react'

interface AIChatProps {
  onUserQuery: (query: string) => void
  isGenerating: boolean
}

export const AIChat = ({ onUserQuery, isGenerating }: AIChatProps) => {
  const [prompt, setPrompt] = useState('')

  const handleGenerateQuery = async () => {
    onUserQuery(prompt)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerateQuery()
    }
  }

  return (
    <Card className="p-3">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 text-xs font-medium text-muted-foreground">
          <Bot className="w-3.5 h-3.5" />
          <span>Ask AI</span>
        </div>

        <div className="flex-1 flex items-center space-x-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              "Describe what you want to query (e.g., 'show me all users from last week')"
            }
            className="flex-1 h-8 text-xs"
          />

          <Button
            onClick={handleGenerateQuery}
            disabled={isGenerating || !prompt.trim()}
            size="sm"
            className="flex items-center space-x-1.5 h-8 px-3 text-xs"
          >
            {isGenerating ? (
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}
