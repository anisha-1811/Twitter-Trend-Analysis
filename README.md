# 🐦 Twitter Trend Analysis Using LDA

> Discover what people are actually talking about — without ever telling the model what to look for.

A full-stack data mining project: a **FastAPI** backend with real JWT
authentication, a **React** dashboard, and a genuine **LDA (Latent
Dirichlet Allocation)** topic-modeling pipeline using `gensim` underneath
it all. Ships with a sample dataset and pre-generated topic output, so it
runs immediately — re-run the pipeline any time to regenerate topics from
new data.

---

## 📋 Table of contents

- [What this project actually does](#-what-this-project-actually-does)
- [Project structure](#-project-structure)
- [Quick start](#-quick-start)
- [How auth works](#-how-auth-works)
- [How the LDA pipeline works](#-how-the-lda-pipeline-works)
- [Swapping in real data](#-swapping-in-real-data)
- [Troubleshooting](#-troubleshooting)
- [Deployment notes](#-deployment-notes)

---

## ✨ What this project actually does

| Layer | What it does | Tech |
|---|---|---|
| **Auth** | Register, log in, JWT-protected routes | FastAPI, bcrypt, python-jose |
| **Data mining** | Cleans tweets, builds a topic model, scores it | gensim, NLTK, pandas |
| **API** | Serves topics + trends to the frontend | FastAPI, SQLAlchemy, SQLite |
| **Dashboard** | Word clouds + trend charts per topic | React, Recharts, Vite |

Unlike a supervised prediction project, there are no labels here — the
model discovers the topics itself from raw text. That's the whole point
of LDA: it finds latent structure in unlabeled data, which is a genuinely
different data mining paradigm from classification.

---

## 🗂 Project structure

```
twitter-trend-lda/
├── backend/
│   ├── app/
│   │   ├── main.py          → FastAPI app, auth routes
│   │   ├── auth.py          → JWT + password hashing
│   │   ├── database.py      → SQLite setup
│   │   ├── models.py        → User table
│   │   ├── schemas.py       → Pydantic request/response models
│   │   ├── topics.py        → Protected /topics endpoint
│   │   └── lda_pipeline.py  → Run this to (re)generate topic data
│   ├── data/
│   │   ├── sample_tweets.csv      (139 rows, 5 topics, 8 weeks)
│   │   └── topics_output.json     (pre-generated — already included)
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/        → Login, Register, Dashboard
    │   ├── components/   → TopicCard, WordCloud, TrendChart
    │   └── api.js        → Fetch wrapper + token handling
    ├── package.json
    └── .env.example
```

**The request flow, end to end:**

```
 Browser                FastAPI                  SQLite / data/
 ───────                ───────                  ──────────────
 Register/Login ──────▶ /auth/register,login ──▶ users table
      │                        │
      ▼                        ▼
 JWT stored in          verifies + issues
 localStorage               JWT token
      │
      ▼
 GET /topics  ─────▶ checks JWT ─────▶ reads topics_output.json
 (Authorization            │                  (written by
  Bearer <token>)          ▼              lda_pipeline.py)
      │              401 if missing/invalid
      ▼
 Dashboard renders
 word clouds + charts
```

---

## 🚀 Quick start

### 1. Backend

```bash
cd backend
python3 -m venv venv
```

Activate it — **the command differs by shell**:

| Shell | Command |
|---|---|
| macOS/Linux (bash/zsh) | `source venv/bin/activate` |
| Windows **cmd.exe** | `venv\Scripts\activate` |
| Windows **PowerShell** | `venv\Scripts\Activate.ps1` |

Then:

```bash
pip install -r requirements.txt
cp .env.example .env            # optionally edit SECRET_KEY
uvicorn app.main:app --reload --port 8000
```

✅ You're live when you see `Application startup complete.` — API docs at
`http://localhost:8000/docs`.

The repo already includes `data/topics_output.json`, so `/topics` works
the moment the server starts — no need to run the pipeline first.

### 2. Frontend

Open a **second terminal** (leave the backend running in the first):

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

✅ Open `http://localhost:5173` → register an account → log in → the
dashboard fetches real topic data from your backend.

---

## 🔐 How auth works

| Endpoint | Method | Protected? | Does what |
|---|---|---|---|
| `/auth/register` | POST | No | Creates a user, hashes password with bcrypt |
| `/auth/login` | POST | No | Verifies credentials, returns a JWT (24h expiry) |
| `/me` | GET | **Yes** | Returns the logged-in user's profile |
| `/topics` | GET | **Yes** | Returns topic + trend data |

The frontend stores the JWT in `localStorage` and attaches it as
`Authorization: Bearer <token>` on every request after login. Try hitting
`http://localhost:8000/topics` directly in a browser with no token — you
should get a `401 Unauthorized`. That's the auth actually working, not a
bug.

---

## 🧠 How the LDA pipeline works

```
sample_tweets.csv
      │
      ▼
① Clean text        strip URLs/mentions/punctuation, remove stopwords
      │
      ▼
② Vectorize          gensim Dictionary + bag-of-words corpus
      │
      ▼
③ Fit LDA            LdaModel, 5 topics, 15 passes
      │
      ▼
④ Score quality      CoherenceModel (c_v) — printed to console
      │
      ▼
⑤ Track trends        bucket tweets by week, count per topic
      │
      ▼
topics_output.json   (terms → word cloud, weekly counts → trend chart)
```

Re-run it any time:

```bash
cd backend
python -m app.lda_pipeline
```

Watch the console — it prints the coherence score (currently ~0.448 on
the sample data), which is the actual metric used to judge whether the
discovered topics make semantic sense.

---

## 🔁 Swapping in real data

The sample CSV is synthetic — election/sports/tech/weather/movies, with
deliberately shifting weekly volume so the trend charts actually move.
To use a real dataset instead:

1. Get a tweet dataset from **Kaggle** (the official X/Twitter API has no
   free tier as of 2026 — pay-per-use pricing makes it impractical for a
   lab project)
2. Make sure it has `text` and `date` columns (rename if needed)
3. Save it as `backend/data/sample_tweets.csv`, or point `CSV_PATH` in
   `lda_pipeline.py` at wherever you saved it
4. Re-run `python -m app.lda_pipeline`
5. Refresh the dashboard — no backend restart needed, `/topics` reads the
   JSON fresh on every request

---

## 🛠 Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `'source' is not recognized...` | You're in cmd.exe, not bash | Use `venv\Scripts\activate` instead |
| `ReadTimeoutError` during `pip install` | Slow connection, large package (gensim) timed out mid-download | Retry with `pip install -r requirements.txt --timeout 120` |
| Install hangs at "Installing collected packages" | Normal — antivirus scanning + many packages (numpy, scipy, gensim) take time | Wait 1–3 min; check Task Manager for active CPU/disk use before assuming it's frozen |
| `The system cannot find the path specified` on `cd ..\frontend` | Wrong starting folder — you were already at project root, not inside `backend` | `cd frontend` directly instead |
| `npm warn deprecated recharts@2.15.4` | Cosmetic — Recharts nudging toward v3 | Safe to ignore |
| `X vulnerabilities (...)` after `npm install` | Normal for most npm projects via dev-dependency chains | **Don't** run `npm audit fix --force` — can break builds by jumping major versions |
| `/topics` returns `{"topics": []}` | `topics_output.json` missing or pipeline never ran | Run `python -m app.lda_pipeline` from `backend/` |
| `401 Unauthorized` on `/topics` or `/me` | No token, expired token (24h), or hitting the URL directly in a browser | Log in through the frontend first — direct browser visits don't carry the JWT |
| CORS error in browser console | Frontend not running on port 5173, or backend's allowed origin doesn't match | Backend only allows `http://localhost:5173` by default — update `main.py`'s `allow_origins` if you change ports |

---

## ☁️ Deployment notes

For your presentation or a live demo beyond `localhost`:

- **Backend** → Render or Railway (both have free tiers that work for FastAPI)
- **Frontend** → Vercel, with `VITE_API_BASE` pointed at your deployed backend URL
- **Database** → swap SQLite for Postgres if deploying somewhere ephemeral — SQLite's file won't persist across redeploys on most free hosts

---

<p align="center"><sub>Data Mining & Data Warehouse Lab Project</sub></p>
