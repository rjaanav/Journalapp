// screens/SettingsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { auth, firestore } from '../config/firebaseConfig';

export default function SettingsScreen({ navigation }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      firestore
        .collection('users')
        .doc(user.uid)
        .get()
        .then((doc) => {
          if (doc.exists) {
            setUserData(doc.data());
          }
        });
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigation.replace('SignIn');
    } catch (error) {
      console.log('SignOut error:', error);
    }
  };

  if (!userData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading User Info...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18 }}>Settings</Text>
      <Text>Name: {userData.name}</Text>
      <Text>Email: {userData.email}</Text>
      <Text>Tier: {userData.tier}</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
}
