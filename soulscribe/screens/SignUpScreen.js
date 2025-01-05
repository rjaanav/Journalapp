// screens/SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { auth, firestore } from '../config/firebaseConfig';

export default function SignUpScreen({ navigation, route }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { name, age } = route.params || {};

  const handleSignUp = async () => {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Save additional user data
      await firestore.collection('users').doc(user.uid).set({
        name: name || '',
        age: age || '',
        email: user.email,
        tier: 'Free',
        createdAt: new Date(),
      });

      navigation.replace('Home');
    } catch (error) {
      console.log('SignUp Error:', error);
      alert(error.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text>Sign Up</Text>
      <Text>Email:</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
      />
      <Text>Password:</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
      />
      <Button title="Sign Up" onPress={handleSignUp} />
      <Button
        title="Already Registered? Sign In"
        onPress={() => navigation.navigate('SignIn')}
      />
    </View>
  );
}
