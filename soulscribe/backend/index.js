/******************************************************
 * index.js (backend/index.js)
 * Express server + Deepgram (v4+) transcription route
 ******************************************************/
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const { createClient } = require('@deepgram/sdk');

const app = express();

// 1. Middleware
app.use(cors());
app.use(morgan('dev'));

// 2. Initialize Deepgram with createClient
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// 3. Configure multer for in-memory file storage
const upload = multer({
  storage: multer.memoryStorage(),
});

// 4. POST /transcribe route
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    // Check if file is present
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    console.log('Received file:', req.file.originalname, req.file.mimetype);

    // Grab the audio buffer
    const fileBuffer = req.file.buffer;
    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ error: 'Uploaded audio is empty' });
    }

    // 5. Call Deepgram
    //    - "model: 'nova-2'" is optional but recommended for best performance
    //    - "language: 'en'" is optional if you want a specific language
    //    - "punctuate: true" if you want punctuation
    const { result, error } = await deepgram.listen.prerecorded.transcribeBuffer(
      fileBuffer,
      {
        model: 'nova-2',
        language: 'en',
        punctuate: true,
      }
    );

    // If Deepgram encountered an error
    if (error) {
      console.error('Deepgram error:', error);
      return res.status(500).json({ error: 'Deepgram transcription failed', details: error });
    }

    // Parse the transcript from Deepgram's result
    // Typical structure: result.channels[0].alternatives[0].transcript
    let transcript = '';
    if (result && result.channels && result.channels[0] && result.channels[0].alternatives[0]) {
      transcript = result.channels[0].alternatives[0].transcript;
    }

    console.log('Transcript:', transcript);
    return res.status(200).json({ transcript });
  } catch (err) {
    console.error('Server error:', err);
    return res
      .status(500)
      .json({ error: 'Transcription failed', details: err.message });
  }
});

// 6. Listen on configured port (for local dev, or in your server environment)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
