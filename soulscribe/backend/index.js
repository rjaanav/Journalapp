// index.js

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');

const app = express();

// Allow cross-origin requests (if needed)
app.use(cors());

// Parse incoming JSON in request bodies
app.use(express.json());

// Replace with your actual Deepgram API key or use environment variable
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || '0bce5fa05fa969c3ac10bc19e600a3c06f586946';

// Test route to confirm the server is running
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Transcription endpoint
app.post('/transcribe', async (req, res) => {
  try {
    const { audioBase64 } = req.body;

    // Convert base64 to a buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    // Prepare form data for Deepgram
    const form = new FormData();
    form.append('file', audioBuffer, { filename: 'audio.wav' });

    // Send to Deepgram
    const response = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
      },
      body: form,
    });

    const result = await response.json();

    // Extract transcript from Deepgram response
    const transcript =
      result.results?.channels[0]?.alternatives[0]?.transcript || '';

    return res.status(200).json({ transcript });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
