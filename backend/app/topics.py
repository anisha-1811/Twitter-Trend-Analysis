import json
import os

from fastapi import APIRouter, Depends

from . import models
from .auth import get_current_user

router = APIRouter(prefix="/topics", tags=["topics"])

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "topics_output.json")


def load_topics():
    if not os.path.exists(DATA_PATH):
        return {
            "coherence_score": None,
            "topics": [],
            "note": "Run `python -m app.lda_pipeline` to generate topic data first.",
        }
    with open(DATA_PATH) as f:
        return json.load(f)


@router.get("")
def get_topics(current_user: models.User = Depends(get_current_user)):
    return load_topics()
