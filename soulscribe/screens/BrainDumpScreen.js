// BrainDumpScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { firestore, auth } from '../config/firebaseConfig';  // Adjust path if needed

// Replace with your backend endpoint
const BACKEND_URL = 'https://soulscribe.vercel.app/transcribe';

// Custom WAV Recording Options
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
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

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
      const uri = recording.getURI();
      console.log('Recording stored at', uri);

      // Read file as base64
      const base64File = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send to backend
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: base64File }),
      });

      const data = await response.json();
      console.log('Transcription response:', data);

      setTranscript(data.transcript);

      // Save to Firestore if user is logged in
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

