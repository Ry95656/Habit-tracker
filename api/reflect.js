const { groqChat, SYSTEM_PROMPT, TEXT_MODEL } = require('../lib/groq');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }
  try {
    const { entry, date } = req.body || {};
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
    res.status(200).json({ reflection: reply });
  } catch (err) {
    res.status(500).json({ error: err.message || 'failed to generate reflection' });
  }
};
