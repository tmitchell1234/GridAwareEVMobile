import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Image, Dimensions, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const FrequencyGraph = () => {
  const [allData, setAllData] = useState([]); // Store all data from the endpoint
  const [chartData, setChartData] = useState([]); // Data to display on the graph (Frequency)
  const [labels, setLabels] = useState([]); // Labels for the graph (Time in seconds)
  const [isLoading, setIsLoading] = useState(true); // Track loading
  const [displayLimit, setDisplayLimit] = useState(10); // Control how much data to display at once

  // Helper function to sanitize frequency data
  const sanitizeFrequency = (frequency) => {
    const parsedFrequency = parseFloat(frequency);
    return (!Number.isFinite(parsedFrequency) || isNaN(parsedFrequency) || parsedFrequency < 0 || parsedFrequency > 100)
      ? 60
      : parsedFrequency;
  };

  // Function to parse and format the date string into seconds
  const parseDateString = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) throw new Error("Invalid Date");
      // Convert the time to seconds or keep the hour:minute:second format
      return date.getSeconds(); // Return the seconds part of the date
    } catch (error) {
      console.error("Date parsing error: ", error.message);
      return ""; // Fallback empty string on error
    }
  };

  // Fetch frequency data from the API
  const fetchFrequencyData = async () => {
    setIsLoading(true); // Start loading
    console.log("Fetching data from the API...");

    try {
      const deviceMac = await AsyncStorage.getItem('selectedDeviceMac');
      const userJwt = await AsyncStorage.getItem('userJwt');
      if (!deviceMac || !userJwt) {
        Alert.alert('Error', 'Device MAC or user token missing.');
        setIsLoading(false);
        return;
      }

      const response = await axios.post('https://gridawarecharging.com/api/get_data_in_recent_time_interval', {
        api_key: API_KEY,
        user_jwt: userJwt,
        device_mac_address: deviceMac,
        time_seconds: 60, // Retrieve data from the last 60 seconds
      });

      // Check if response data is valid
      if (!Array.isArray(response.data)) {
        console.error("Unexpected response format:", response.data);
        setIsLoading(false);
        return;
      }

      console.log("Data successfully fetched:", response.data); // Debugging log
      setAllData(response.data); // Store all the fetched data
      updateGraphData(response.data.slice(-displayLimit)); // Display the last 10 entries initially
    } catch (error) {
      console.error('Error fetching frequency data:', error);
    }
    setIsLoading(false); // Stop loading
  };

  // Function to update chart data
  const updateGraphData = (data) => {
    const newLabels = data.map(entry => parseDateString(entry.time)); // Use seconds as labels
    const newFrequencies = data.map(entry => sanitizeFrequency(entry.frequency)); // Use frequencies for Y-axis

    setLabels(newLabels); // X-axis labels (time in seconds)
    setChartData(newFrequencies); // Y-axis data (frequency)
    console.log("Updated chart data (Hz):", newFrequencies); // Debugging log for frequencies
    console.log("Updated labels (Time in seconds):", newLabels); // Debugging log for time labels
  };

  // Load more data when user clicks the button
  const loadMoreData = () => {
    const newLimit = displayLimit + 10;
    if (newLimit <= allData.length) {
      setDisplayLimit(newLimit); // Increase the limit
      updateGraphData(allData.slice(-newLimit)); // Show more data
    } else {
      console.log("No more data to load.");
    }
  };

  // Fetch initial data after component mounts
  useEffect(() => {
    fetchFrequencyData();

    const intervalId = setInterval(() => {
      fetchFrequencyData(); // Fetch new data every 10 seconds
    }, 10000);

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../images/GridAwareLogo.png')} style={styles.logo} />
        <Text style={styles.headerText}>Frequency Graph</Text>
      </View>

      {/* Display loading indicator only when fetching for the first time */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6F3C" />
          <Text style={styles.loadingText}>Fetching Data...</Text>
        </View>
      )}

      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: labels, // Time (in seconds)
            datasets: [{ data: chartData }] // Frequency (in Hz)
          }}
          width={Dimensions.get('window').width - 40} // Adjust width based on screen size
          height={220}
          yAxisSuffix=" Hz"
          yAxisInterval={1} // Control the intervals
          chartConfig={{
            backgroundGradientFrom: '#0A0E27',
            backgroundGradientTo: '#0A0E27',
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#FF6F3C',
            },
          }}
          bezier
          style={{ marginVertical: 20, borderRadius: 16 }}
        />
      </View>

      {/* Load more button */}
      {displayLimit < allData.length && !isLoading && (
        <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreData}>
          <Text style={styles.loadMoreButtonText}>Load More Data</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logo: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  headerText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  chartContainer: { flexDirection: 'row', height: 220, padding: 10 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFF', fontSize: 18, marginTop: 10 },
  loadMoreButton: {
    backgroundColor: '#FF6F3C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  loadMoreButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default FrequencyGraph;
