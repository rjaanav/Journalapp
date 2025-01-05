// index.js
// index.js

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');

// Initialize Express
const app = express();

// Allow CORS (if needed)
app.use(cors());

// Increase body size limit for large Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Replace with your actual Deepgram API key
const DEEPGRAM_API_KEY = '0bce5fa05fa969c3ac10bc19e600a3c06f586946';

// Test route
app.get('/', (req, res) => {
  res.send('Hello from the backend! If you see this, the server is running.');
});

// Transcribe Endpoint
app.post('/transcribe', async (req, res) => {
  try {
    // 1. Check we have audioBase64
    const { audioBase64 } = req.body;
    if (!audioBase64) {
      console.log('No audioBase64 found in request body');
      return res.status(400).json({ error: 'No audio data provided.' });
    }

    // 2. Convert base64 to buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    console.log('Audio buffer length:', audioBuffer.length);

    // 3. Prepare form data for Deepgram
    const form = new FormData();
    form.append('file', audioBuffer, { filename: 'audio.wav' });

    // 4. Send to Deepgram
    const deepgramResponse = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
      },
      body: form,
    });

    // 5. Parse Deepgram response
    const result = await deepgramResponse.json();
    console.log('Deepgram raw result:', JSON.stringify(result, null, 2));

    // 6. Extract transcript
    const transcript =
      result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    console.log('Transcript from Deepgram:', transcript);

    // 7. Return transcript to client
    return res.status(200).json({ transcript });
  } catch (error) {
    console.error('Transcription error:', error);
    return res.status(500).json({ error: 'Transcription failed' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

