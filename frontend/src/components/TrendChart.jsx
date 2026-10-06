import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function TrendChart({ trend }) {
  const data = trend.map((p) => ({ period: p.period, mentions: p.count }))

  return (
    <div style={{ width: '100%', height: 160 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="period"
            tick={{ fill: '#a9a69e', fontSize: 10 }}
            tickFormatter={(v) => v.split('/')[0]}
          />
          <YAxis tick={{ fill: '#a9a69e', fontSize: 10 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#1f2429', border: '1px solid #3a4249', fontSize: 12 }}
            labelStyle={{ color: '#f2efe9' }}
          />
          <Line
            type="monotone"
            dataKey="mentions"
            stroke="#d4a24c"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#d4a24c' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
