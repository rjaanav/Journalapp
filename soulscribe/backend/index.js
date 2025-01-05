// backend/index.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');

const app = express();
app.use(cors());
app.use(express.json());

// Replace with your actual Deepgram API Key
const DEEPGRAM_API_KEY = '5ad446738873c6df895c38a1d947f439b8abb321';

// Endpoint to handle transcription
app.post('/transcribe', async (req, res) => {
  try {
    const { audioBase64 } = req.body;
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    const form = new FormData();
    form.append('file', audioBuffer, { filename: 'audio.wav' });

    const response = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
      },
      body: form,
    });

    const result = await response.json();
    const transcript = result.results?.channels[0]?.alternatives[0]?.transcript || '';

    return res.status(200).json({ transcript });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

module.exports = app;
