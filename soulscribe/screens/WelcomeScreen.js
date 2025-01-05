// screens/WelcomeScreen.js
import React from 'react';
import { View, Text, Button } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24 }}>Welcome to Audio Journaling</Text>
      <Button
        title="Continue"
        onPress={() => navigation.navigate('UserData')}
      />
    </View>
  );
}
