// screens/HomeScreen.js
import React from 'react';
import { View, Text, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Welcome to your Audio Journal!</Text>
      <Button title="Brain Dump" onPress={() => navigation.navigate('BrainDump')} />
      <Button title="The Vault" onPress={() => navigation.navigate('Vault')} />
      <Button title="Search" onPress={() => navigation.navigate('Search')} />
      <Button title="Glimpse" onPress={() => navigation.navigate('Glimpse')} />
      <Button title="Settings" onPress={() => navigation.navigate('Settings')} />
    </View>
  );
}
