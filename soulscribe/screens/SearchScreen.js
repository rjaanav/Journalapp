// screens/SearchScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import dayjs from 'dayjs';
import { firestore, auth } from '../config/firebaseConfig';

export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // Client-side search (for demonstration); not scalable for large data
    const snapshot = await firestore
      .collection('journals')
      .where('uid', '==', user.uid)
      .get();

    const matched = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((entry) => entry.transcript && entry.transcript.includes(searchTerm));

    setResults(matched);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Search Journals</Text>
      <TextInput
        placeholder="Enter keyword..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
      />
      <Button title="Search" onPress={handleSearch} />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>
              {dayjs(item.createdAt.toDate()).format('YYYY-MM-DD HH:mm')}
            </Text>
            <Text>{item.transcript}</Text>
          </View>
        )}
      />
    </View>
  );
}
