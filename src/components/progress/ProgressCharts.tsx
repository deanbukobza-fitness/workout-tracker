'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatDate } from '@/lib/date-utils'

interface Session {
  id: string
  loggedAt: string
  totalVolume: number
  estimated1RM: number
  isVolumePR: boolean
}

interface Props {
  sessions: Session[]
}

export default function ProgressCharts({ sessions }: Props) {
  const data = sessions.map((s) => ({
    date: formatDate(s.loggedAt),
    volume: Math.round(s.totalVolume),
    oneRM: Math.round(s.estimated1RM * 10) / 10,
    pr: s.isVolumePR,
  }))

  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <div className="text-4xl mb-3">📊</div>
        <p>עוד אין נתונים. בצעי אימון ראשון כדי לראות את הגרף!</p>
      </div>
    )
  }

  const CustomDot = (props: { cx?: number; cy?: number; payload?: { pr: boolean } }) => {
    const { cx, cy, payload } = props
    if (!payload?.pr) return null
    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill="#f59e0b" stroke="white" strokeWidth={2} />
        <text x={(cx ?? 0) + 8} y={(cy ?? 0) - 8} fill="#f59e0b" fontSize={12}>
          🏆
        </text>
      </g>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3 text-sm text-muted-foreground">נפח אימון (ק״ג)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(v: unknown) => [`${v} ק״ג`, 'נפח'] as [string, string]}
              labelFormatter={(l) => `תאריך: ${l}`}
            />
            <Line
              type="monotone"
              dataKey="volume"
              stroke="#ec4899"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="font-semibold mb-3 text-sm text-muted-foreground">1RM משוערת (ק״ג)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(v: unknown) => [`${v} ק״ג`, '1RM משוערת'] as [string, string]}
              labelFormatter={(l) => `תאריך: ${l}`}
            />
            <Line
              type="monotone"
              dataKey="oneRM"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
