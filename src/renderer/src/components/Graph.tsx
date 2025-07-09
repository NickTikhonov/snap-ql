import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  BarChart,
  Bar
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { useTheme } from '../components/ui/theme-provider'
import { GraphEditDialog } from './GraphEditDialog'
import { Button } from '../components/ui/button'
import { X } from 'lucide-react'

export type GraphMetadata = {
  graphXColumn: string
  graphYColumns: string[]
}

interface GraphProps {
  data: any[]
  graphMetadata: GraphMetadata
  onMetadataChange?: (metadata: GraphMetadata) => void
  onRemove?: () => void
}

function guessDataType(data: any[]): 'date' | 'number' | 'string' {
  if (data.length === 0) return 'string'
  const firstRow = data[0]
  if (typeof firstRow === 'string') {
    const parsedDate = Date.parse(firstRow)
    if (!isNaN(parsedDate)) return 'date'
    return 'string'
  }
  if (typeof firstRow === 'number') return 'number'
  if (typeof firstRow === 'object' && firstRow !== null && 'date' in firstRow) return 'date'
  return 'string'
}

export const Graph = ({ data, graphMetadata, onMetadataChange, onRemove }: GraphProps) => {
  const { theme } = useTheme()

  const orangeColors = [
    '#ff5e00',
    '#005eff',
    '#11ff7f',
    '#1c9fff',
    '#ff007f',
    '#7f00ff',
    '#00ff7f',
    '#ffbf00',
    '#00bfff',
    '#ff00bf',
    '#7fff00',
    '#bf00ff',
    '#ff7f00',
    '#00ffbf'
  ]

  const xAxisType = guessDataType(data.map((row) => row[graphMetadata.graphXColumn]))
  let chartCmp = <></>
  if (xAxisType === 'date' || xAxisType === 'number') {
    chartCmp = (
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <Legend style={{ fontSize: '8px' }} />
        <XAxis dataKey={graphMetadata?.graphXColumn} tick={{ fontSize: '12px' }} />
        <YAxis tick={{ fontSize: '12px' }} domain={['auto', 'auto']} />
        <Tooltip
          formatter={(_: any, name: string, props: { payload?: any }) => {
            const { payload } = props || {}
            const value = payload && payload[name] !== undefined ? payload[name] : ''
            return [`${name}: ${value}`]
          }}
          contentStyle={{
            backgroundColor: theme === 'dark' ? 'black' : 'white',
            color: theme === 'dark' ? 'white' : 'black',
            borderRadius: '10px',
            padding: '10px'
          }}
        />
        {graphMetadata?.graphYColumns.map((column, i) => {
          const color = orangeColors[i % orangeColors.length]
          return (
            <Line key={column} type="monotone" dataKey={column} stroke={color} strokeWidth={3} />
          )
        })}
      </LineChart>
    )
  } else {
    chartCmp = (
      <BarChart data={data}>
        <Legend style={{ fontSize: '8px' }} />
        <XAxis dataKey={graphMetadata?.graphXColumn} tick={{ fontSize: '12px' }} />
        <YAxis tick={{ fontSize: '12px' }} domain={['auto', 'auto']} />
        <Tooltip
          formatter={(_: any, name: string, props: { payload?: any }) => {
            const { payload } = props || {}
            const value = payload && payload[name] !== undefined ? payload[name] : ''
            return [`${name}: ${value}`]
          }}
          contentStyle={{
            backgroundColor: theme === 'dark' ? 'black' : 'white',
            color: theme === 'dark' ? 'white' : 'black',
            borderRadius: '10px',
            padding: '10px'
          }}
        />
        {graphMetadata?.graphYColumns.map((column, i) => {
          const color = orangeColors[i % orangeColors.length]
          return <Bar key={column} type="monotone" dataKey={column} fill={color} />
        })}
      </BarChart>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Graph</CardTitle>
        <div className="flex items-center gap-2">
          {onMetadataChange && (
            <GraphEditDialog
              data={data}
              currentMetadata={graphMetadata}
              onSave={onMetadataChange}
            />
          )}
          {onRemove && (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {chartCmp}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default Graph
