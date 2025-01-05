// index.js

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Replace with your real API key or environment variable
const DEEPGRAM_API_KEY = '0bce5fa05fa969c3ac10bc19e600a3c06f586946';

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.post('/transcribe', async (req, res) => {
  try {
    const { audioBase64 } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'No audio data provided.' });
    }

    // Convert base64 -> Buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    console.log('Audio buffer length:', audioBuffer.length);

    // ----- IMPORTANT: Specify filename & contentType (audio/m4a) -----
    const form = new FormData();
    form.append('file', audioBuffer, {
      filename: 'audio.m4a',
      contentType: 'audio/m4a',
    });

    // (Optional) Add query params like punctuation, language, etc.
    // Example: ?punctuate=true&language=en
    const deepgramUrl = 'https://api.deepgram.com/v1/listen?punctuate=true&language=en';

    // Send to Deepgram
    const deepgramResponse = await fetch(deepgramUrl, {
      method: 'POST',
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
      },
      body: form,
    });

    // Log the raw JSON response from Deepgram
    const result = await deepgramResponse.json();
    console.log('Deepgram raw result:', JSON.stringify(result, null, 2));

    // Extract transcript
    const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
    console.log('Transcript from Deepgram:', transcript);

    return res.status(200).json({ transcript });
  } catch (error) {
    console.error('Transcription error:', error);
    return res.status(500).json({ error: 'Transcription failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// index.js

