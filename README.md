# Twitter Trend Analysis Using LDA

Full-stack project: JWT-authenticated FastAPI backend + React dashboard,
with a real LDA topic-modeling pipeline (gensim) behind it. Ships with a
sample dataset and pre-generated topic output, so it runs immediately —
re-run the pipeline any time to regenerate topics from new data.

## Project structure

```
twitter-trend-lda/
├── backend/
│   ├── app/
│   │   ├── main.py          FastAPI app, auth routes
│   │   ├── auth.py          JWT + password hashing
│   │   ├── database.py      SQLite setup
│   │   ├── models.py        User table
│   │   ├── schemas.py       Pydantic request/response models
│   │   ├── topics.py        Protected /topics endpoint
│   │   └── lda_pipeline.py  Run this to (re)generate topic data
│   ├── data/
│   │   ├── sample_tweets.csv      139-row sample dataset, 5 topics over 8 weeks
│   │   └── topics_output.json     Pre-generated — already included
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/        Login, Register, Dashboard
    │   ├── components/   TopicCard, WordCloud, TrendChart
    │   └── api.js        Fetch wrapper + token handling
    ├── package.json
    └── .env.example
```

## 1. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # optionally edit SECRET_KEY

uvicorn app.main:app --reload --port 8000
```

API is now live at `http://localhost:8000` (interactive docs at `/docs`).

The repo already includes `data/topics_output.json` generated from the
sample dataset, so `/topics` works immediately. To regenerate it (e.g.
after swapping in a new CSV):

```bash
python -m app.lda_pipeline
```

Your dataset just needs `text` and `date` columns — point
`lda_pipeline.py`'s `CSV_PATH` at it, or replace `data/sample_tweets.csv`.

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. Register an account, log in, and the
dashboard fetches topics from the backend using your JWT.

## How auth works

- `POST /auth/register` — creates a user, password hashed with bcrypt
- `POST /auth/login` — returns a JWT access token (24h expiry)
- Frontend stores the token in `localStorage` and sends it as
  `Authorization: Bearer <token>` on every request
- `GET /topics` and `GET /me` are protected — they reject requests
  without a valid token

## How the LDA pipeline works

1. Loads `sample_tweets.csv`, cleans text (strip URLs/mentions/punctuation,
   remove stopwords, drop short tokens)
2. Builds a gensim `Dictionary` + bag-of-words corpus
3. Fits `LdaModel` with 5 topics
4. Scores topic quality with `CoherenceModel` (c_v) — printed to console
5. Assigns each tweet's dominant topic, buckets by week, and writes
   `topics_output.json` with per-topic terms (for the word cloud) and
   weekly counts (for the trend chart)

## Swapping in real data

The sample CSV is synthetic (election/sports/tech/weather/movies, with
deliberately shifting weekly volume so the trend charts move). To use a
real dataset:

1. Get a tweet dataset from Kaggle (X's API no longer has a free tier —
   see note below) with at least `text` and a date/timestamp column
2. Rename/alias columns to `text` and `date`, save as `data/sample_tweets.csv`
   (or update `CSV_PATH` in `lda_pipeline.py`)
3. Re-run `python -m app.lda_pipeline`
4. Refresh the dashboard — no backend restart needed, it reads the JSON
   fresh on every request

> Note: the official X (Twitter) API moved to pay-per-use pricing in 2026
> with no free tier, so this project is built around static datasets
> (Kaggle, or any CSV export) rather than a live API connection.

## Deployment notes (optional, for your presentation)

- Backend: Render or Railway, both have free tiers that work for FastAPI
- Frontend: Vercel — set `VITE_API_BASE` to your deployed backend URL
- Swap SQLite for Postgres if you deploy the backend somewhere ephemeral
  (SQLite's file won't persist across redeploys on most free hosts)
