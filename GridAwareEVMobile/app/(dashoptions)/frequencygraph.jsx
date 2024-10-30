import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, Dimensions } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const FrequencyGraph = () => {
  const [latestFrequency, setLatestFrequency] = useState(null);
  const [chartData, setChartData] = useState([60]);
  const [labels, setLabels] = useState(["0"]);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);

  const sanitizeFrequency = (frequency) => {
    const parsedFrequency = parseFloat(frequency);
    return (!Number.isFinite(parsedFrequency) || isNaN(parsedFrequency) || parsedFrequency < 0 || parsedFrequency > 100)
      ? 60
      : parsedFrequency;
  };

  const fetchFrequencyData = async () => {
    try {
      const deviceMac = await AsyncStorage.getItem('selectedDeviceMac');
      const userJwt = await AsyncStorage.getItem('userJwt');

      if (!deviceMac || !userJwt) {
        Alert.alert('Error', 'Device MAC or user token missing.');
        return;
      }

      console.log("Fetching frequency data...");
      const response = await axios.post('https://gridawarecharging.com/api/get_data_in_recent_time_interval', {
        api_key: API_KEY,
        user_jwt: userJwt,
        device_mac_address: deviceMac,
        time_seconds: 1,
      });

      if (!Array.isArray(response.data)) {
        console.error("Unexpected response format:", response.data);
        return;
      }

      const latestData = response.data[response.data.length - 1];
      const sanitizedFrequency = sanitizeFrequency(latestData.frequency);
      console.log("Latest Frequency:", sanitizedFrequency);

      setLatestFrequency(sanitizedFrequency);
      updateChartData(sanitizedFrequency);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching frequency data:', error);
    }
  };

  const updateChartData = (newFrequency) => {
    setChartData((prevData) => {
      const updatedData = [...prevData, newFrequency];
      if (updatedData.length > 20) {
        updatedData.shift();
      }
      return updatedData;
    });

    setLabels((prevLabels) => {
      const nextTime = (parseInt(prevLabels[prevLabels.length - 1], 10) + 1).toString();
      const updatedLabels = [...prevLabels, nextTime];
      if (updatedLabels.length > 20) {
        updatedLabels.shift();
      }
      return updatedLabels;
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      // Start fetching data when component is in focus
      intervalRef.current = setInterval(fetchFrequencyData, 1000);

      // Clear interval when component loses focus
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [])
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6F3C" />
          <Text style={styles.loadingText}>Fetching Data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Live Frequency Data</Text>
      </View>

      <View style={styles.frequencyContainer}>
        <Text style={styles.frequencyText}>
          Latest Frequency: {latestFrequency ? `${latestFrequency} Hz` : 'No data'}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: labels,
              datasets: [
                {
                  data: chartData,
                },
              ],
            }}
            width={Dimensions.get("window").width * 1.5}
            height={Dimensions.get("window").height * 0.45}
            yAxisSuffix=" Hz"
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: "#0D47A1",
              backgroundGradientFrom: "#1976D2",
              backgroundGradientTo: "#64B5F6",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#FF6F3C",
              },
            }}
            bezier
            yAxisMin={55}
            yAxisMax={64}
            withDots={true}
            withInnerLines={true}
            style={styles.chartStyle}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27', padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  headerText: { color: '#FF6F3C', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFF', fontSize: 18, marginTop: 10 },
  frequencyContainer: { justifyContent: 'center', alignItems: 'center', marginVertical: 15 },
  frequencyText: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  chartContainer: { paddingHorizontal: 10 },
  chartStyle: { marginVertical: 20, borderRadius: 16 },
});

export default FrequencyGraph;
