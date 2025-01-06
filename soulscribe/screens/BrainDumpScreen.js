// BrainDumpScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { Audio } from 'expo-av';
import { firestore, auth } from '../config/firebaseConfig'; // Adjust path if needed

// Adjust this if you're running locally or have a different deployed URL
const BACKEND_URL = 'https://soulscribe.vercel.app/transcribe';

// WAV recording options
const RECORDING_OPTIONS_WAV = {
  isMeteringEnabled: false,
  android: {
    extension: '.wav',
    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_PCM_16BIT,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.wav',
    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};

export default function BrainDumpScreen() {
  const [recording, setRecording] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      // Request permissions
      await Audio.requestPermissionsAsync();
      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start the recording
      const { recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS_WAV);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();

      // Get the local URI to the recorded file
      const uri = recording.getURI();
      console.log('Recording stored at', uri);

      // Build FormData
      const formData = new FormData();
      formData.append('audio', {
        uri,
        type: 'audio/wav', // Because we're recording .wav
        name: 'recording.wav',
      });

      // Send to backend
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      console.log('Transcription response:', data);

      setTranscript(data.transcript || '');

      // Save transcript to Firestore if user is logged in
      const user = auth.currentUser;
      if (user && data.transcript) {
        await firestore.collection('journals').add({
          uid: user.uid,
          transcript: data.transcript,
          createdAt: new Date(),
        });
        console.log('Transcript saved to Firestore');
      } else {
        console.log('No user or empty transcript, not saving.');
      }

      // Reset
      setRecording(null);
    } catch (error) {
      console.error('stopRecording error:', error);
    }
  };

  const discardRecording = () => {
    setRecording(null);
    setTranscript('');
    setIsRecording(false);
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ marginBottom: 20, fontSize: 18 }}>Brain Dump (WAV)</Text>

      {!isRecording && !transcript && (
        <Button title="Start Recording" onPress={startRecording} />
      )}

      {isRecording && (
        <Button title="Stop Recording" onPress={stopRecording} />
      )}

      {transcript ? (
        <>
          <Text style={{ marginVertical: 20 }}>Transcript: {transcript}</Text>
          <Button title="Discard" onPress={discardRecording} />
        </>
      ) : null}
    </View>
  );
}
