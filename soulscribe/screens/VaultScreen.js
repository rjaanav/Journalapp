// screens/VaultScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import { firestore, auth } from '../config/firebaseConfig';

export default function VaultScreen() {
  const [journals, setJournals] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubscribe = firestore
      .collection('journals')
      .where('uid', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot((querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setJournals(data);
      });

    return () => unsubscribe();
  }, []);

  // Unique years
  const years = Array.from(
    new Set(journals.map((j) => dayjs(j.createdAt.toDate()).year()))
  ).sort((a, b) => b - a);

  // Months for selectedYear
  const months = selectedYear
    ? Array.from(
        new Set(
          journals
            .filter((j) => dayjs(j.createdAt.toDate()).year() === selectedYear)
            .map((j) => dayjs(j.createdAt.toDate()).month())
        )
      ).sort((a, b) => a - b)
    : [];

  const filteredJournals =
    selectedMonth !== null
      ? journals.filter(
          (j) =>
            dayjs(j.createdAt.toDate()).year() === selectedYear &&
            dayjs(j.createdAt.toDate()).month() === selectedMonth
        )
      : [];

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>The Vault</Text>
      <Text>Select Year:</Text>
      <FlatList
        horizontal
        data={years}
        keyExtractor={(item) => item.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              padding: 10,
              backgroundColor: item === selectedYear ? 'blue' : 'gray',
              margin: 5,
            }}
            onPress={() => {
              setSelectedYear(item);
              setSelectedMonth(null);
            }}
          >
            <Text style={{ color: 'white' }}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      {selectedYear && (
        <>
          <Text>Select Month:</Text>
          <FlatList
            horizontal
            data={months}
            keyExtractor={(item) => item.toString()}
            renderItem={({ item }) => {
              const monthName = dayjs().month(item).format('MMMM');
              return (
                <TouchableOpacity
                  style={{
                    padding: 10,
                    backgroundColor: item === selectedMonth ? 'blue' : 'gray',
                    margin: 5,
                  }}
                  onPress={() => setSelectedMonth(item)}
                >
                  <Text style={{ color: 'white' }}>{monthName}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </>
      )}
      {selectedMonth !== null && (
        <>
          <Text>Journals:</Text>
          <FlatList
            data={filteredJournals}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const dateStr = dayjs(item.createdAt.toDate()).format('YYYY-MM-DD HH:mm');
              return (
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ fontWeight: 'bold' }}>{dateStr}</Text>
                  <Text>{item.transcript}</Text>
                </View>
              );
            }}
          />
        </>
      )}
    </View>
  );
}
