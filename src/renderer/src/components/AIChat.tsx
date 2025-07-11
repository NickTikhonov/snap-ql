import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card } from '../components/ui/card'
import { Switch } from '../components/ui/switch'
import { Label } from '../components/ui/label'
import { Bot, Send, Sparkles, Play } from 'lucide-react'
import { motion } from 'framer-motion'

interface AIChatProps {
  onUserQuery: (query: string, autoRun: boolean) => void
  isGenerating: boolean
}

export const AIChat = ({ onUserQuery, isGenerating }: AIChatProps) => {
  const [prompt, setPrompt] = useState('')
  const [autoRun, setAutoRun] = useState(() => {
    const saved = localStorage.getItem('snapql-auto-run')
    return saved !== null ? saved === 'true' : true
  })

  useEffect(() => {
    localStorage.setItem('snapql-auto-run', String(autoRun))
  }, [autoRun])

  const handleGenerateQuery = async () => {
    onUserQuery(prompt, autoRun)
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

        <div className="flex items-center space-x-2 ml-auto">
          <Label htmlFor="auto-run" className="text-xs text-muted-foreground">
            Auto-run:
          </Label>
          <Switch
            id="auto-run"
            checked={autoRun}
            onCheckedChange={setAutoRun}
            className="scale-75"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 mt-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe what you want to query (e.g., 'show me all users from last week')"
          className="flex-1 h-8 text-xs"
        />

        <Button
          onClick={handleGenerateQuery}
          disabled={isGenerating || !prompt.trim()}
          size="sm"
          className="flex items-center space-x-1.5 h-8 px-3 text-xs"
        >
          {isGenerating ? (
            <div className="flex items-center space-x-1">
              <motion.div
                className="w-1 h-1 bg-current rounded-full"
                animate={{ scale: [0.8, 1.2, 0.8] }}
                transition={{ 
                  duration: 1.2, 
                  repeat: Infinity, 
                  delay: 0,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="w-1 h-1 bg-current rounded-full"
                animate={{ scale: [0.8, 1.2, 0.8] }}
                transition={{ 
                  duration: 1.2, 
                  repeat: Infinity, 
                  delay: 0.2,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="w-1 h-1 bg-current rounded-full"
                animate={{ scale: [0.8, 1.2, 0.8] }}
                transition={{ 
                  duration: 1.2, 
                  repeat: Infinity, 
                  delay: 0.4,
                  ease: "easeInOut"
                }}
              />
            </div>
          ) : autoRun ? (
            <Play className="w-3.5 h-3.5" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>{isGenerating ? 'Generating...' : autoRun ? 'Generate & Run' : 'Generate'}</span>
        </Button>
      </div>
    </Card>
  )
}
