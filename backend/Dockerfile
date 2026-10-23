FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TF_CPP_MIN_LOG_LEVEL=2 \
    # Where TensorFlow Hub keeps the downloaded MobileNetV2 module
    TFHUB_CACHE_DIR=/app/tfhub_cache \
    PORT=8000

# Run as a non-root user (uid 1000 is also what Hugging Face Spaces expects)
RUN useradd --create-home --uid 1000 appuser
WORKDIR /app

# Install dependencies first, so this layer is cached when only the code changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser app.py .
COPY --chown=appuser:appuser models/20260920-171051-full-dog-vision.h5 models/labels.npy models/

RUN mkdir -p "$TFHUB_CACHE_DIR" && chown appuser:appuser "$TFHUB_CACHE_DIR"
USER appuser

# Load the model once at build time, so the TF Hub module is downloaded into the
# image instead of on every container start
RUN python -c "import app"

EXPOSE 8000

# Hosting providers pass the port to listen on in $PORT
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT}"]
