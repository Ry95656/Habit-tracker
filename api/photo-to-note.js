const { groqChat, VISION_MODEL } = require('../lib/groq');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }
  try {
    const { imageBase64, mimeType } = req.body || {};
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
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message || 'failed to transcribe photo' });
  }
};
