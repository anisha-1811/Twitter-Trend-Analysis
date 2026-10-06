import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, clearToken } from '../api.js'
import TopicCard from '../components/TopicCard.jsx'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api
      .topics()
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  function handleLogout() {
    clearToken()
    navigate('/login')
  }

  return (
    <div className="dash">
      <div className="dash-header">
        <h1>Discovered topics</h1>
        <button className="logout" onClick={handleLogout}>Log out</button>
      </div>
      <p className="dash-sub">Topics mined from the tweet corpus using LDA — updated by re-running the pipeline.</p>

      {error && <div className="error-msg">{error}</div>}

      {!data && !error && <div className="loading">Loading topics…</div>}

      {data && data.topics?.length > 0 && (
        <>
          <div className="status-line mono">
            COHERENCE SCORE: {data.coherence_score ?? 'n/a'} · {data.topics.length} TOPICS
          </div>
          <div className="topic-grid">
            {data.topics.map((t) => (
              <TopicCard key={t.id} topic={t} />
            ))}
          </div>
        </>
      )}

      {data && data.topics?.length === 0 && (
        <div className="empty">
          No topics yet. Run <code>python -m app.lda_pipeline</code> in the backend, then refresh.
        </div>
      )}
    </div>
  )
}
