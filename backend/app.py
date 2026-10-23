import logging
import os
import time

# Must be set before TensorFlow is imported, so tf.keras uses Keras 2 (tf_keras),
# the version the model was saved with
os.environ["TF_USE_LEGACY_KERAS"] = "1"

import numpy as np
import tensorflow as tf
import tensorflow_hub as hub
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Paths are resolved relative to this file, so the app works from any directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Same model the notebook predicts with (trained on the full dataset)
MODEL_PATH = os.path.join(BASE_DIR, "models", "20260920-171051-full-dog-vision.h5")
LABELS_PATH = os.path.join(BASE_DIR, "models", "labels.npy")

IMG_SIZE = 224
TOP_K = 5
ALLOWED_ORIGINS = ["http://localhost:3000"]


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("dog_vision")


# ---------------------------------------------------------------------------
# Model loading (runs once, when the server starts)
# ---------------------------------------------------------------------------

def load_model(model_path):
    logger.info("Loading model from %s", model_path)
    start = time.perf_counter()

    model = tf.keras.models.load_model(
        model_path,
        custom_objects={"KerasLayer": hub.KerasLayer},
    )

    logger.info("Model loaded in %.1f s", time.perf_counter() - start)
    return model


def load_labels(labels_path):
    labels = np.load(labels_path, allow_pickle=True)
    logger.info("Loaded %d breed labels from %s", len(labels), labels_path)
    return labels


model = load_model(MODEL_PATH)
unique_breeds = load_labels(LABELS_PATH)


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(title="Dog Vision API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Prediction helpers
# ---------------------------------------------------------------------------

def preprocess_image(image_bytes):
    """Turns raw image bytes into a (1, 224, 224, 3) float tensor, like the notebook."""
    # Decodes JPEG, PNG, GIF or BMP into 3 RGB channels
    image = tf.io.decode_image(image_bytes, channels=3, expand_animations=False)
    image = tf.image.convert_image_dtype(image, tf.float32)  # 0-255 -> 0-1
    image = tf.image.resize(image, [IMG_SIZE, IMG_SIZE])

    return tf.expand_dims(image, 0)  # add the batch dimension


async def predict_probabilities(file: UploadFile):
    """Reads an uploaded image and returns the model's probability for every breed."""
    start = time.perf_counter()
    image_bytes = await file.read()

    logger.info(
        "Received image: name=%s type=%s size=%.1f KB",
        file.filename, file.content_type, len(image_bytes) / 1024,
    )

    try:
        image = preprocess_image(image_bytes)
    except tf.errors.InvalidArgumentError:
        logger.warning("Could not decode image: name=%s", file.filename)
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid image.")

    probabilities = model.predict(image, verbose=0)[0]

    logger.info("Inference took %.0f ms", (time.perf_counter() - start) * 1000)
    return probabilities


def to_prediction(probabilities, index):
    return {
        "breed": str(unique_breeds[index]),
        "confidence": float(probabilities[index]),
    }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
async def root():
    return {"message": "Welcome to the Dog Breed Prediction API!"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    probabilities = await predict_probabilities(file)
    prediction = to_prediction(probabilities, np.argmax(probabilities))

    logger.info("Prediction: %s (%.1f%%)", prediction["breed"], prediction["confidence"] * 100)
    return prediction


@app.post("/predict/top5")
async def predict_top5(file: UploadFile = File(...)):
    probabilities = await predict_probabilities(file)

    # Indexes of the highest probabilities, highest first
    top_indexes = np.argsort(probabilities)[-TOP_K:][::-1]
    predictions = [
        {"rank": rank, **to_prediction(probabilities, index)}
        for rank, index in enumerate(top_indexes, start=1)
    ]

    logger.info(
        "Top %d: %s",
        TOP_K,
        ", ".join(f"{p['breed']} ({p['confidence'] * 100:.1f}%)" for p in predictions),
    )
    return {"predictions": predictions}
