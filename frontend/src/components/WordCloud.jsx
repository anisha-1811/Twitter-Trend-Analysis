export default function WordCloud({ terms }) {
  const maxW = Math.max(...terms.map((t) => t.weight))
  const minSize = 0.85
  const maxSize = 2.1

  return (
    <div className="cloud">
      {terms.map((t) => {
        const scale = t.weight / maxW
        const fontSize = (minSize + scale * (maxSize - minSize)).toFixed(2)
        return (
          <span key={t.word} style={{ fontSize: `${fontSize}rem` }}>
            {t.word}
          </span>
        )
      })}
    </div>
  )
}
