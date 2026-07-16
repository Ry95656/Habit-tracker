A habit tracker and journal. Dark, quiet, no clutter.

## What's in here
- `frontend/ledger.html` — the whole app. Open it in a browser and it works. Habits and journal entries live in that browser's localStorage, so nothing leaves your machine unless you use the AI features below.
- `backend/` — a small Express server that talks to Groq for the AI therapist (chat + reflections) and the photo scanner. Only needed for those two things.

## Running the backend
```
cd backend
npm install
cp .env.example .env
```
Drop your key into `.env`:
```
GROQ_API_KEY=gsk_...
```
Then:
```
npm start
```
It runs on `http://localhost:3001`. Get a key at console.groq.com.

Chat and reflections use `openai/gpt-oss-120b`. The photo scanner uses `qwen/qwen3.6-27b`, Groq's vision model. Groq rotates its model lineup fairly often — if one of these gets retired, check console.groq.com/docs/models and swap the id in `server.js`.

## Running the frontend
Open `frontend/ledger.html`. That's it. If the backend isn't running, habits, streaks, the calendar, and journaling still work fine — you just lose the therapist tab and the photo scanner.

## Photo to note
Tap "scan page," photograph a handwritten entry, and it gets transcribed straight into that day's journal. Give it a read before you save, since handwriting recognition isn't perfect.

## A couple of things worth knowing
- The AI therapist is a companion, not a real one. The app says so up front, and the prompt behind it is written to point people toward real help if things get heavy.
- Your API key never leaves the backend. It's not in the HTML anywhere.

## AI usage
This project was built with help from Claude (Anthropic) for the code and design. The app itself also uses AI at runtime: Groq's `openai/gpt-oss-120b` for the therapist chat and journal reflections, and `qwen/qwen3.6-27b` for transcribing handwritten photos into text.
