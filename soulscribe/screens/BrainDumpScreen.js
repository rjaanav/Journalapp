// screens/BrainDumpScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { firestore, auth } from '../config/firebaseConfig';

// Replace with your deployed backend URL
const BACKEND_URL = 'https://YOUR_PROJECT_NAME.vercel.app/transcribe';

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

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stored at', uri);

      // Convert file to base64
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
      setTranscript(data.transcript);

      // Save transcript to Firestore
      const user = auth.currentUser;
      if (user) {
        await firestore.collection('journals').add({
          uid: user.uid,
          transcript: data.transcript,
          createdAt: new Date(),
        });
      }
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
      <Text style={{ marginBottom: 20, fontSize: 18 }}>Brain Dump</Text>
      {!isRecording && !transcript && (
        <Button title="Start Recording" onPress={startRecording} />
      )}
      {isRecording && <Button title="Stop Recording" onPress={stopRecording} />}
      {transcript !== '' && (
        <>
          <Text style={{ marginVertical: 20 }}>Transcript: {transcript}</Text>
          <Button title="Discard" onPress={discardRecording} />
        </>
      )}
    </View>
  );
}
