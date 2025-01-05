// screens/GlimpseScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import dayjs from 'dayjs';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { firestore, auth } from '../config/firebaseConfig';
import { analyzeSentiment } from '../utils/sentimentAnalysis';

export default function GlimpseScreen() {
  const [journals, setJournals] = useState([]);
  const [sentimentData, setSentimentData] = useState({ positive: 0, neutral: 0, negative: 0 });
  const [streak, setStreak] = useState(0);
  const [monthlyCounts, setMonthlyCounts] = useState({});

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const unsubscribe = firestore
      .collection('journals')
      .where('uid', '==', user.uid)
      .onSnapshot((querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setJournals(data);
      });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (journals.length) {
      // Sentiment analysis
      const { positive, neutral, negative } = analyzeSentiment(journals);
      setSentimentData({ positive, neutral, negative });

      // Calculate streak
      const sortedByDate = journals
        .map((j) => dayjs(j.createdAt.toDate()))
        .sort((a, b) => a.diff(b));

      let maxStreak = 1;
      let currentStreak = 1;
      for (let i = 1; i < sortedByDate.length; i++) {
        const diff = sortedByDate[i].diff(sortedByDate[i - 1], 'day');
        if (diff === 1) {
          currentStreak++;
        } else {
          if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
          }
          currentStreak = 1;
        }
      }
      if (currentStreak > maxStreak) maxStreak = currentStreak;
      setStreak(maxStreak);

      // Monthly distribution
      const counts = {};
      journals.forEach((j) => {
        const monthKey = dayjs(j.createdAt.toDate()).format('YYYY-MM');
        counts[monthKey] = (counts[monthKey] || 0) + 1;
      });
      setMonthlyCounts(counts);
    } else {
      setSentimentData({ positive: 0, neutral: 0, negative: 0 });
      setStreak(0);
      setMonthlyCounts({});
    }
  }, [journals]);

  const screenWidth = Dimensions.get('window').width;

  const pieChartData = [
    {
      name: 'Positive',
      count: sentimentData.positive,
      color: 'green',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    {
      name: 'Neutral',
      count: sentimentData.neutral,
      color: 'gray',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    {
      name: 'Negative',
      count: sentimentData.negative,
      color: 'red',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
  ];

  const barChartLabels = Object.keys(monthlyCounts).sort();
  const barChartData = {
    labels: barChartLabels,
    datasets: [
      {
        data: barChartLabels.map((label) => monthlyCounts[label]),
      },
    ],
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Glimpse</Text>
      <Text>Sentiment Breakdown</Text>
      <PieChart
        data={pieChartData.map((item) => ({
          name: item.name,
          population: item.count,
          color: item.color,
          legendFontColor: item.legendFontColor,
          legendFontSize: item.legendFontSize,
        }))}
        width={screenWidth}
        height={220}
        chartConfig={{
          color: () => `rgba(0, 0, 0, 1)`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
      <Text style={{ marginVertical: 10 }}>Streak Count: {streak}</Text>
      <Text>Monthly Distribution</Text>
      {barChartLabels.length > 0 && (
        <BarChart
          data={barChartData}
          width={screenWidth - 20}
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          verticalLabelRotation={45}
          fromZero
        />
      )}
    </ScrollView>
  );
}
