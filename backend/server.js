require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // higher limit to allow base64 photo uploads

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const TEXT_MODEL = 'openai/gpt-oss-120b';   // general chat/reasoning model on Groq
const VISION_MODEL = 'qwen/qwen3.6-27b';    // multimodal model on Groq, handles image input

const SYSTEM_PROMPT = `You are a warm, supportive journaling companion inside a habit-tracking app called "ledger". You are not a licensed therapist and you never give clinical diagnoses, medical advice, or treatment plans. Your job is to listen, reflect back what you hear in plain warm language, validate feelings without being saccharine, and ask one gentle open-ended question when it fits naturally. Keep replies short - 2 to 5 sentences. If someone expresses thoughts of self-harm, suicide, or being in crisis, take it seriously: respond with care, and clearly encourage them to reach out to a crisis line (in the US, 988) or a trusted person, in addition to anything else you say.`;

async function groqChat({ model, messages, maxTokens = 400 }) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set on the server. Add it to backend/.env');
  }
  const response = await fetch(GROQ_BASE_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      max_completion_tokens: maxTokens,
      temperature: model === VISION_MODEL ? 0.2 : 1
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq API error (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

app.post('/api/reflect', async (req, res) => {
  try {
    const { entry, date } = req.body;
    if (!entry || !entry.trim()) {
      return res.status(400).json({ error: 'entry is required' });
    }
    const reply = await groqChat({
      model: TEXT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Here's my journal entry for ${date || 'today'}:\n\n${entry}\n\nOffer a short, warm reflection on this.` }
      ]
    });
    res.json({ reflection: reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'failed to generate reflection' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: 'messages is required' });
    }
    const reply = await groqChat({
      model: TEXT_MODEL,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages]
    });
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'failed to generate reply' });
  }
});

app.post('/api/photo-to-note', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }
    const dataUrl = `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;
    const text = await groqChat({
      model: VISION_MODEL,
      maxTokens: 800,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'This is a photo of a handwritten journal page. Transcribe the handwriting into clean digital text as faithfully as possible. Keep the original wording and voice - do not summarize or add commentary. If a word is illegible, mark it with [?]. Return only the transcribed text, nothing else.'
            },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]
        }
      ]
    });
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'failed to transcribe photo' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`ledger backend running on http://localhost:${PORT}`));
