import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, StyleSheet, Dimensions, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { LineChart } from 'react-native-chart-kit';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const FrequencyGraph = () => {
  const [allData, setAllData] = useState([]); // Store all data from the API
  const [chartData, setChartData] = useState([]); // Frequency data to display
  const [labels, setLabels] = useState([]); // Time (in seconds) for X-axis
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  // Helper function to sanitize and validate the frequency data
  const sanitizeFrequency = (frequency) => {
    const parsedFrequency = parseFloat(frequency);
    // Ensure frequency is valid (between 0 and 100 Hz)
    return (!Number.isFinite(parsedFrequency) || isNaN(parsedFrequency) || parsedFrequency < 0 || parsedFrequency > 100)
      ? 60 // Default value if invalid
      : parsedFrequency;
  };

  // Fetch the frequency data from the API
  const fetchFrequencyData = async () => {
    setIsLoading(true);
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
        time_seconds: 60, // Fetch last 60 seconds
      });

      // Check if response data is valid
      if (!Array.isArray(response.data)) {
        console.error("Unexpected response format:", response.data);
        setIsLoading(false);
        return;
      }

      console.log("Data successfully fetched:", response.data);
      setAllData(response.data);
      processGraphData(response.data.slice(-10)); // Show the last 10 points initially
    } catch (error) {
      console.error('Error fetching frequency data:', error);
    }
    setIsLoading(false);
  };

  // Process data and prepare for rendering on the graph
  const processGraphData = (data) => {
    const frequencies = data.map(entry => sanitizeFrequency(entry.frequency).toFixed(2));
    const timeLabels = data.map((_, index) => (index + 1).toString()); // Time in seconds

    setChartData(frequencies.map(Number)); // Y-axis data (frequencies)
    setLabels(timeLabels); // X-axis data (seconds)
  };

  // Load more data when user clicks the button
  const loadMoreData = () => {
    const newLimit = chartData.length + 10;
    if (newLimit <= allData.length) {
      processGraphData(allData.slice(-newLimit));
    } else {
      console.log("No more data to load.");
    }
  };

  // Fetch initial data after component mounts
  useEffect(() => {
    fetchFrequencyData();
  }, []);

  // Chart configuration
  const chartConfig = {
    backgroundColor: "#022173",
    backgroundGradientFrom: "#1c3faa",
    backgroundGradientTo: "#226bdf",
    decimalPlaces: 2, // Display decimal values
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Line color
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Label color
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffa726", // Stroke color for dots
    },
  };

  // Screen width and dynamic height for devices
  const screenWidth = Dimensions.get("window").width;
  const graphHeight = Dimensions.get("window").height * 0.45; // Set graph height to 45% of the screen height

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
        <Text style={styles.headerText}>Frequency Graph</Text>
      </View>

      {/* Scrollable View for Graph */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: labels, // X-axis (time in seconds)
              datasets: [
                {
                  data: chartData, // Y-axis (frequency data)
                },
              ],
            }}
            width={screenWidth * 2} // Allow horizontal scrolling for larger datasets
            height={graphHeight} // Dynamic height
            chartConfig={chartConfig}
            bezier // Smooth line
            style={{
              marginVertical: 20,
              borderRadius: 16,
            }}
          />
        </View>
      </ScrollView>

      {/* Add padding between graph and Load More button */}
      <View style={styles.buttonContainer}>
        {chartData.length < allData.length && (
          <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreData}>
            <Text style={styles.loadMoreButtonText}>Load More Data</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerText: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  chartContainer: { height: 'auto', padding: 10 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFF', fontSize: 18, marginTop: 10 },
  buttonContainer: { paddingTop: 40, alignItems: 'center' },
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