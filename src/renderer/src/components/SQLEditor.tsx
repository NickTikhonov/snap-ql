import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Loader2 } from 'lucide-react'
import CodeMirror from '@uiw/react-codemirror'
import { sql, SQLDialect } from '@codemirror/lang-sql'
import { useTheme } from './ui/theme-provider'
import { motion } from 'framer-motion'

interface SQLEditorProps {
  value: string
  onChange: (value: string) => void
  onRun: () => void
  isLoading: boolean
}

export const SQLEditor = ({ value, onChange, onRun, isLoading }: SQLEditorProps) => {
  const { theme } = useTheme()
  return (
    <div className="rounded-lg">
      <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">SQL Query Editor</CardTitle>
        <Button
          onClick={onRun}
          disabled={isLoading || !value.trim()}
          className="flex items-center space-x-1.5 h-8 px-3 text-xs"
          size="sm"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          <span>{isLoading ? 'Running...' : 'Run Query'}</span>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <CodeMirror
          value={value}
          onChange={(value) => onChange(value)}
          extensions={[sql()]}
          height="160px"
          theme={theme === 'dark' ? 'dark' : 'light'}
        />

        {/* <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your SQL query here..."
          className="min-h-[160px] font-mono text-xs leading-4"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          }} */}
        {/* /> */}
      </CardContent>
    </Card>
    </div>
  )
}
