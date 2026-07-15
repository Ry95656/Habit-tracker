const { groqChat, SYSTEM_PROMPT, TEXT_MODEL } = require('../lib/groq');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: 'messages is required' });
    }
    const reply = await groqChat({
      model: TEXT_MODEL,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages]
    });
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message || 'failed to generate reply' });
  }
};
