import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { BarChart } from 'react-native-chart-kit';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const VoltageGraph = () => {
  const [allData, setAllData] = useState([]); // Store all data from the API
  const [chartData, setChartData] = useState([]); // Voltage data to display
  const [labels, setLabels] = useState([]); // Time for X-axis
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  // Fetch the voltage data from the API
  const fetchVoltageData = async () => {
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

      if (!Array.isArray(response.data)) {
        console.error("Unexpected response format:", response.data);
        setIsLoading(false);
        return;
      }

      console.log("Data successfully fetched:", response.data);
      setAllData(response.data);
      processGraphData(response.data.slice(-10)); // Show the last 10 points initially
    } catch (error) {
      console.error('Error fetching voltage data:', error);
    }
    setIsLoading(false);
  };

  // Process data and prepare for rendering on the graph
  const processGraphData = (data) => {
    const voltages = data.map(entry => entry.voltage.toFixed(2));
    const timeLabels = data.map((_, index) => (index + 1).toString()); // X-axis data

    setChartData(voltages.map(Number)); // Y-axis data (voltages)
    setLabels(timeLabels); // X-axis data (time)
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
    fetchVoltageData();
  }, []);

  // Chart configuration with updated colors for better engagement
  const chartConfig = {
    backgroundColor: "#0A0E27",
    backgroundGradientFrom: "#1E2923",
    backgroundGradientTo: "#08130D",
    decimalPlaces: 2, // Display decimal values
    color: (opacity = 1) => `rgba(0, 255, 127, ${opacity})`, // Bright green for the bars
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // White labels for readability
    style: {
      borderRadius: 16,
    },
    barPercentage: 0.5, // Adjust bar width
    fillShadowGradient: "#00FF7F", // Gradient for the bars (bright green)
    fillShadowGradientOpacity: 1, // Full opacity for better visibility
    propsForBackgroundLines: {
      stroke: "#FFFFFF", // White background lines for better contrast
    },
  };

  const screenWidth = Dimensions.get("window").width;
  const graphHeight = Dimensions.get("window").height * 0.45;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6F3C" />
          <Text style={styles.loadingText}>Fetching Voltage Data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Voltage Graph</Text>
      </View>

      {/* Scrollable View for Bar Chart */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: labels, // X-axis (time)
              datasets: [
                {
                  data: chartData, // Y-axis (voltage data)
                },
              ],
            }}
            width={screenWidth * 2} // Allow horizontal scrolling for larger datasets
            height={graphHeight} // Dynamic height
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            fromZero
            style={{
              marginVertical: 20,
              borderRadius: 16,
            }}
          />
        </View>
      </ScrollView>

      {/* Load More Button */}
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

export default VoltageGraph;
