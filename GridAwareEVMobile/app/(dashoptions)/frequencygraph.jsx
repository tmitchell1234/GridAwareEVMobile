import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const FrequencyGraph = () => {
  const [latestFrequency, setLatestFrequency] = useState(null); // Latest frequency reading
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const intervalRef = useRef(null); // Store the interval for cleanup

  // Helper function to sanitize and validate the frequency data
  const sanitizeFrequency = (frequency) => {
    const parsedFrequency = parseFloat(frequency);
    // Ensure frequency is a valid number between 0 and 100
    return (!Number.isFinite(parsedFrequency) || isNaN(parsedFrequency) || parsedFrequency < 0 || parsedFrequency > 100)
      ? 60 // Default to 60Hz if invalid
      : parsedFrequency;
  };

  // Fetch frequency data from the API
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
        time_seconds: 1, // Fetch smaller intervals for faster updates
      });

      if (!Array.isArray(response.data)) {
        console.error("Unexpected response format:", response.data);
        return;
      }

      const latestData = response.data[response.data.length - 1]; // Get the most recent data point
      const sanitizedFrequency = sanitizeFrequency(latestData.frequency);
      console.log("Latest Frequency:", sanitizedFrequency);
      setLatestFrequency(sanitizedFrequency);  // Set the latest frequency
      setIsLoading(false);  // Stop showing the loading spinner after the first data fetch
    } catch (error) {
      console.error('Error fetching frequency data:', error);
    }
  };

  // Start polling data every 1 second to simulate real-time updates
  useEffect(() => {
    fetchFrequencyData(); // Initial fetch

    // Set up polling every 1 second to fetch new data
    intervalRef.current = setInterval(() => {
      fetchFrequencyData();
    }, 1000);

    return () => {
      // Cleanup interval on component unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // If data is loading, show an Activity Indicator
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

      {/* Display the latest frequency */}
      <View style={styles.frequencyContainer}>
        <Text style={styles.frequencyText}>
          Latest Frequency: {latestFrequency ? `${latestFrequency} Hz` : 'No data'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27', padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  headerText: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFF', fontSize: 18, marginTop: 10 },
  frequencyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  frequencyText: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
});

export default FrequencyGraph;
