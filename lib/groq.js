const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const TEXT_MODEL = 'openai/gpt-oss-120b';
const VISION_MODEL = 'qwen/qwen3.6-27b';

const SYSTEM_PROMPT = `You are a warm, supportive journaling companion inside a habit-tracking app called "ledger". You are not a licensed therapist and you never give clinical diagnoses, medical advice, or treatment plans. Your job is to listen, reflect back what you hear in plain warm language, validate feelings without being saccharine, and ask one gentle open-ended question when it fits naturally. Keep replies short - 2 to 5 sentences. If someone expresses thoughts of self-harm, suicide, or being in crisis, take it seriously: respond with care, and clearly encourage them to reach out to a crisis line (in the US, 988) or a trusted person, in addition to anything else you say.`;

async function groqChat({ model, messages, maxTokens = 400 }) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set. Add it in your Vercel project settings under Environment Variables.');
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

module.exports = { groqChat, SYSTEM_PROMPT, TEXT_MODEL, VISION_MODEL };
