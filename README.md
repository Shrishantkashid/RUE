# Recursive Understanding Engine (RUE)

RUE is a full-stack web application designed for deep conceptual learning through recursive exploration. It doesn't just answer questions; it breaks down the answers into key conceptual terms, allowing users to explore each term recursively until full clarity is achieved.

## Features
- **Intelligent Answers**: Driven by Groq's Llama 3.3 70B (Ultra-fast inference).
- **Automated Concept Extraction**: Smartly identifies difficult or core terms within text and highlights them.
- **Recursive Expansion**: Click on any highlighted concept to get a deeper, contextual explanation nested intuitively in the UI.
- **Premium Design**: Built with React, Tailwind CSS V4, and Framer Motion for a stunning, glassmorphism-inspired dark mode interface.
- **Robust Backend**: Asynchronous FastAPI server backed by MongoDB for tracking session nodes.

## Setup & Local Development

### Prerequisites
1. **Python 3.9+**
2. **Node.js 18+**
3. **MongoDB**: Ensure MongoDB is running locally at `mongodb://localhost:27017` or specify a custom `MONGO_URI` environment variable.
4. **Gemini API Key**: Obtain a key from Google AI Studio.

### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
# (For dev, we installed: fastapi uvicorn motor python-dotenv google-genai pydantic pydantic-settings)

# Set environment variable (or create a .env file)
export GEMINI_API_KEY="your_api_key_here"

# Start the server
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Sample Test Queries
Try these queries to see the engine in action:
1. "Explain the mechanism of mRNA vaccines and how they differ from traditional viral vector vaccines."
2. "What is Quantum Entanglement and how is it used in Quantum Computing?"
3. "Detail the architecture of Transformers in machine learning."
4. "How does a car engine work?"

## Deployment Instructions

### Backend (Render / Heroku)
1. Ensure your MongoDB cluster is hosted on MongoDB Atlas and copy the URI.
2. Push the backend code to a GitHub repository. Note: Create a `requirements.txt` (`pip freeze > requirements.txt`).
3. Connect the repository to Render as a Web Service.
4. Set the Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `GEMINI_API_KEY`: Your key
   - `MONGO_URI`: Your Atlas URI

### Frontend (Vercel / Netlify)
1. Push the frontend code to a GitHub repository.
2. Connect the repository to Vercel/Netlify.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Ensure `API_URL` in `src/App.jsx` points to your deployed backend URL.

## Architecture
- **Backend Model**: Uses Pydantic to strictly define schemas for the LLM output (Structured JSON).
- **Asynchronous Flow**: Uses Motor (Async MongoDB) and `asyncio.to_thread` for non-blocking API calls.
- **Frontend Recursion**: Recursively renders the `NodeViewer` component without any hard depth limits structurally, but is confined elegantly by UI design.
