// BrainDumpScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { firestore, auth } from '../config/firebaseConfig'; // Adjust path if needed

// Replace with your deployed or local backend endpoint
const BACKEND_URL = 'https://soulscribe.vercel.app/transcribe';

export default function BrainDumpScreen() {
  const [recording, setRecording] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup if the component unmounts
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      // Request mic permissions
      await Audio.requestPermissionsAsync();
      // Configure
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
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stored at', uri);

      // Convert audio file to Base64
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

      // Save to state
      setTranscript(data.transcript);

      // Store in Firestore if we have a user and a valid transcript
      const user = auth.currentUser;
      if (user && data.transcript) {
        await firestore.collection('journals').add({
          uid: user.uid,
          transcript: data.transcript,
          createdAt: new Date(),
        });
        console.log('Transcript saved to Firestore for user:', user.uid);
      } else {
        console.log(
          'No user is logged in, or transcript is empty. Not saving to Firestore.'
        );
      }

      // Reset the recording
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

      {transcript ? (
        <>
          <Text style={{ marginVertical: 20 }}>Transcript: {transcript}</Text>
          <Button title="Discard" onPress={discardRecording} />
        </>
      ) : null}
    </View>
  );
}
