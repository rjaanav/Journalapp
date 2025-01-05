// screens/UserDataScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

export default function UserDataScreen({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const handleNext = () => {
    // Pass user data along to SignUp
    navigation.navigate('SignUp', { name, age });
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text>Let's get to know you!</Text>
      <Text>Name:</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
      />
      <Text>Age:</Text>
      <TextInput
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
      />
      <Button title="Next" onPress={handleNext} />
    </View>
  );
}
