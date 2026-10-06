import TrendChart from './TrendChart.jsx'
import WordCloud from './WordCloud.jsx'

export default function TopicCard({ topic }) {
  return (
    <div className="topic-card">
      <h3>Topic {topic.id + 1} — {topic.label}</h3>
      <WordCloud terms={topic.terms} />
      <TrendChart trend={topic.trend} />
    </div>
  )
}
