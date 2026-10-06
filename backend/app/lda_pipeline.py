"""
Regenerates data/topics_output.json from data/sample_tweets.csv using LDA.

Usage (from the backend/ directory, with venv active):
    python -m app.lda_pipeline
"""
import json
import os
import re
import string
from collections import defaultdict

import nltk
import pandas as pd
from gensim import corpora
from gensim.models import LdaModel
from gensim.models.coherencemodel import CoherenceModel
from nltk.corpus import stopwords

nltk.download("stopwords", quiet=True)
STOP_WORDS = set(stopwords.words("english"))

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
CSV_PATH = os.path.join(DATA_DIR, "sample_tweets.csv")
OUT_PATH = os.path.join(DATA_DIR, "topics_output.json")


def clean(text: str) -> list[str]:
    text = re.sub(r"http\S+|@\w+|#", "", str(text).lower())
    text = text.translate(str.maketrans("", "", string.punctuation))
    return [t for t in text.split() if t not in STOP_WORDS and len(t) > 2]


def main(num_topics: int = 5) -> None:
    df = pd.read_csv(CSV_PATH)
    df["tokens"] = df["text"].apply(clean)

    dictionary = corpora.Dictionary(df["tokens"])
    dictionary.filter_extremes(no_below=2, no_above=0.6)
    corpus = [dictionary.doc2bow(tokens) for tokens in df["tokens"]]

    lda = LdaModel(
        corpus=corpus,
        id2word=dictionary,
        num_topics=num_topics,
        passes=15,
        random_state=42,
    )

    coherence = CoherenceModel(
        model=lda, texts=df["tokens"], dictionary=dictionary, coherence="c_v"
    ).get_coherence()
    print(f"Coherence score: {coherence:.3f}")

    df["dominant_topic"] = [
        max(lda.get_document_topics(bow), key=lambda x: x[1])[0] if bow else -1
        for bow in corpus
    ]

    df["date"] = pd.to_datetime(df["date"])
    df["week"] = df["date"].dt.to_period("W").astype(str)
    weeks = sorted(df["week"].unique())

    topics_out = []
    for tid in range(num_topics):
        terms = lda.show_topic(tid, topn=10)
        counts = defaultdict(int)
        for week in weeks:
            counts[week] = int(
                ((df["week"] == week) & (df["dominant_topic"] == tid)).sum()
            )

        topics_out.append(
            {
                "id": tid,
                "label": ", ".join(w for w, _ in terms[:3]),
                "terms": [{"word": w, "weight": round(float(wt), 4)} for w, wt in terms],
                "trend": [{"period": wk, "count": counts[wk]} for wk in weeks],
            }
        )

    with open(OUT_PATH, "w") as f:
        json.dump({"coherence_score": round(coherence, 3), "topics": topics_out}, f, indent=2)

    print(f"Wrote {OUT_PATH}")


if __name__ == "__main__":
    main()
