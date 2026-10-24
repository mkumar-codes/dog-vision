# 🐶 Dog Vision

Upload a photo of a dog and Dog Vision tells you which of **120 dog breeds** it is, along with how confident the model is and the 5 most likely breeds.

<img width="1123" height="755" alt="image" src="https://github.com/user-attachments/assets/b618f131-00b7-4513-9528-27279aa49549" />


- **Backend:** a FastAPI service that runs a TensorFlow image classifier.
- **Frontend:** a responsive React app with drag-and-drop upload, a scanning animation while it predicts, and confidence bars for the results.

## How it works

1. You upload a photo in the browser.
2. The frontend sends it to the API.
3. The API resizes the image to 224×224 pixels, scales the pixel values to 0–1, and runs it through the model.
4. The model returns a probability for each of the 120 breeds. The API returns the most likely breed (`/predict`) or the top 5 (`/predict/top5`).

### The model

The model uses **transfer learning**. It starts from **MobileNetV2**, a network from TensorFlow Hub that was already trained on millions of everyday images, and adds one new output layer that learns to tell the 120 dog breeds apart.

It was trained on the [Kaggle Dog Breed Identification](https://www.kaggle.com/competitions/dog-breed-identification/data) dataset, about 10,000 labeled dog photos. The full training process is in [`backend/dog-vision.ipynb`](backend/dog-vision.ipynb).

## Tech stack

| Part | Tools |
|---|---|
| Model | TensorFlow 2.20, TensorFlow Hub (MobileNetV2), Keras 2 (`tf-keras`) |
| Backend | Python 3.12, FastAPI, Uvicorn |
| Frontend | React 19, Vite, CSS Modules (no UI library) |
| Containers | Docker, Docker Compose, nginx (serves the built frontend) |

## Project structure

```
dog-vision/
├── docker-compose.yml       # runs the backend and frontend together
├── netlify.toml             # build settings for hosting the frontend on Netlify
│
├── backend/
│   ├── app.py               # FastAPI app: loads the model, exposes the API
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── dog-vision.ipynb     # notebook used to train the model
│   └── models/
│       ├── 20260920-171051-full-dog-vision.h5   # model used by the API
│       └── labels.npy                           # the 120 breed names
│
└── frontend/
    ├── Dockerfile           # builds the app, then serves it with nginx
    ├── nginx.conf
    └── src/
        ├── api/             # calls to the backend
        ├── hooks/           # useAsync (loading/error state), useImagePreview
        ├── components/
        │   ├── ui/          # reusable pieces: Button, Card, Spinner, Skeleton, ProgressBar…
        │   ├── upload/      # ImageDropzone, ImagePreview (scanning animation)
        │   └── prediction/  # PredictionRow, PredictionResult, TopPredictions
        ├── styles/          # theme colors and global styles
        └── utils/           # formatting helpers
```

## Run it with Docker (recommended)

You only need [Docker](https://docs.docker.com/get-docker/) with Docker Compose. You don't need Python or Node.js installed.

```bash
git clone https://github.com/mkumar-codes/dog-vision.git
cd dog-vision
docker compose up --build
```

The first build takes several minutes, because it downloads TensorFlow (about 600 MB) and the MobileNetV2 module. Later builds reuse the cache and are much faster.

When you see `Application startup complete` in the logs, open:

| What | URL |
|---|---|
| App | http://localhost:3000 |
| API | http://localhost:8000 |
| Interactive API docs | http://localhost:8000/docs |

### Useful Docker commands

```bash
docker compose up --build -d     # start in the background
docker compose logs -f backend   # follow the backend logs
docker compose ps                # see what's running
docker compose down              # stop and remove the containers
docker compose build --no-cache  # rebuild from scratch
```

### Running one container on its own

```bash
# Backend
docker build -t dog-vision-backend ./backend
docker run -p 8000:8000 -e ALLOWED_ORIGINS=http://localhost:3000 dog-vision-backend

# Frontend (VITE_API_URL is the backend address as your browser sees it)
docker build -t dog-vision-frontend --build-arg VITE_API_URL=http://localhost:8000 ./frontend
docker run -p 3000:80 dog-vision-frontend
```

## Run it without Docker (for development)

You need **Python 3.12** and **Node.js 20 or newer**.

**Backend:**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # on Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload          # runs on http://localhost:8000
```

**Frontend** (in a second terminal):

```bash
cd frontend
echo "VITE_API_URL=http://localhost:8000" > .env
npm install
npm run dev                       # runs on http://localhost:3000
```

## API reference

Both prediction endpoints take a `multipart/form-data` upload with the image in a field named `file`. They accept JPEG, PNG, GIF and BMP.

### `POST /predict`: the most likely breed

```bash
curl -F file=@my-dog.jpg http://localhost:8000/predict
```

```json
{ "breed": "basset", "confidence": 0.979 }
```

### `POST /predict/top5`: the 5 most likely breeds

```bash
curl -F file=@my-dog.jpg http://localhost:8000/predict/top5
```

```json
{
  "predictions": [
    { "rank": 1, "breed": "cairn", "confidence": 0.703 },
    { "rank": 2, "breed": "soft-coated_wheaten_terrier", "confidence": 0.142 },
    { "rank": 3, "breed": "dandie_dinmont", "confidence": 0.134 },
    { "rank": 4, "breed": "norfolk_terrier", "confidence": 0.017 },
    { "rank": 5, "breed": "scottish_deerhound", "confidence": 0.001 }
  ]
}
```

`confidence` is a probability from 0 to 1. The confidences of all 120 breeds add up to 1, so a large gap between rank 1 and rank 2 means the model is sure.

If the file isn't a valid image, the API returns **400** with `{"detail": "The uploaded file is not a valid image."}`.

## Configuration

| Variable | Used by | Default | Purpose |
|---|---|---|---|
| `ALLOWED_ORIGINS` | backend | `http://localhost:3000` | Comma-separated frontend URLs allowed to call the API (CORS) |
| `PORT` | backend (Docker) | `8000` | Port the API listens on. Most hosting providers set this for you. |
| `VITE_API_URL` | frontend | `http://localhost:8000` | Backend URL. It's baked into the app **at build time**, so rebuild after changing it. |

## Deployment

The frontend and backend are hosted separately.

### Backend: Hugging Face Spaces (free)

TensorFlow needs about 1–2 GB of RAM. Most free tiers, such as Render and Koyeb, only give 512 MB, so the API runs out of memory there. Hugging Face Spaces gives 16 GB free and builds the Dockerfile directly.

1. Create a new Space at https://huggingface.co/new-space and choose **Docker** as the SDK.
2. Push the **contents of `backend/`** to the Space's git repository.
3. Add this block to the top of the Space's `README.md`, so it routes traffic to port 8000:
   ```yaml
   ---
   title: Dog Vision API
   sdk: docker
   app_port: 8000
   ---
   ```
4. Under **Settings → Variables**, set `ALLOWED_ORIGINS` to your Netlify URL, e.g. `https://your-site.netlify.app`.
5. Your API is now at `https://<username>-<space-name>.hf.space`.

### Frontend: Netlify (free)

Netlify doesn't run Docker. It builds the React app from this repository using [`netlify.toml`](netlify.toml).

1. In Netlify, choose **Add new site → Import an existing project** and pick this GitHub repository. The build settings are read from `netlify.toml`.
2. Under **Site configuration → Environment variables**, set `VITE_API_URL` to your backend URL, e.g. `https://<username>-<space-name>.hf.space`.
3. Deploy. If you change `VITE_API_URL` later, trigger a new deploy, because the value is baked in at build time.

## Troubleshooting

| Problem | Fix |
|---|---|
| "Could not reach the server" in the app | Make sure the backend is running and `VITE_API_URL` points to it. |
| CORS error in the browser console | Add the frontend's exact URL (no trailing `/`) to `ALLOWED_ORIGINS` and restart the backend. |
| Port 3000 or 8000 is already in use | Stop the other process, or change the left side of the port mapping in `docker-compose.yml`, e.g. `"3001:80"`. If you change the frontend port, add the new URL to `ALLOWED_ORIGINS` too. |
| The same breed for every photo | Use real photos of dogs. Screenshots, banners or very wide images give poor results, because every image is squashed to a 224×224 square. |
| The first prediction is slow | That's expected: TensorFlow warms up on the first request. Later requests are much faster. |
