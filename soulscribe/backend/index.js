/******************************************************
 * index.js (backend/index.js)
 * Express server + Deepgram transcription route
 ******************************************************/
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const { Deepgram } = require('@deepgram/sdk');

const app = express();

// 1. Middleware
app.use(cors());
app.use(morgan('dev'));

// 2. Initialize Deepgram
const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);

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

    // Log basic file info
    console.log('Received file:', req.file.originalname, req.file.mimetype);

    // Get buffer and confirm it's not empty
    const fileBuffer = req.file.buffer;
    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ error: 'Uploaded audio is empty' });
    }

    // Use the mimetype from the uploaded file, or default to 'audio/m4a'
    const mimeType = req.file.mimetype || 'audio/m4a';

    // 5. Send audio to Deepgram
    const deepgramResponse = await deepgram.transcription.preRecorded(
      {
        buffer: fileBuffer,
        mimetype: mimeType,
      },
      {
        punctuate: true,
      }
    );

    // Log the entire Deepgram response for debugging
    console.log('Deepgram response:', JSON.stringify(deepgramResponse, null, 2));

    // Extract transcript from the Deepgram response
    const transcript =
      deepgramResponse?.results?.channels[0]?.alternatives[0]?.transcript || '';

    return res.status(200).json({ transcript });
  } catch (error) {
    console.error('Transcription error:', error.response?.data || error.message);
    return res
      .status(500)
      .json({ error: 'Transcription failed', details: error.message });
  }
});

// 6. Listen on configured port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
