require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const { createClient } = require('@deepgram/sdk');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));

// Deepgram init
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// Multer config
const upload = multer({
  storage: multer.memoryStorage(),
});

// ▼ NEW: GET root route
app.get('/', (req, res) => {
  res.send('Hello from SoulScribe backend!');
});

// Existing: POST /transcribe
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ error: 'Uploaded audio is empty' });
    }

    const { result, error } = await deepgram.listen.prerecorded.transcribeBuffer(
      fileBuffer,
      {
        model: 'nova-2',
        language: 'en',
        punctuate: true,
      }
    );

    if (error) {
      console.error('Deepgram error:', error);
      return res.status(500).json({ error: 'Deepgram transcription failed', details: error });
    }

    let transcript = '';
    if (result?.channels?.[0]?.alternatives?.[0]?.transcript) {
      transcript = result.channels[0].alternatives[0].transcript;
    }

    console.log('Transcript:', transcript);
    return res.status(200).json({ transcript });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Transcription failed', details: err.message });
  }
});

// Server listen
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
