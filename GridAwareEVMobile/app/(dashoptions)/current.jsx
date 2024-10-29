import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, View, Text, StyleSheet, Dimensions, ActivityIndicator, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { BarChart } from 'react-native-chart-kit';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const CurrentGraph = () => {
  const [latestCurrent, setLatestCurrent] = useState(null);
  const [chartData, setChartData] = useState([2.5]); // Initial midpoint for 0-5A range
  const [labels, setLabels] = useState(["0"]);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);

  // Fetch current data from the API
  const fetchCurrentData = async () => {
    try {
      const deviceMac = await AsyncStorage.getItem('selectedDeviceMac');
      const userJwt = await AsyncStorage.getItem('userJwt');

      if (!deviceMac || !userJwt) {
        Alert.alert('Error', 'Device MAC or user token missing.');
        return;
      }

      console.log("Fetching current data...");
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
      const sanitizedCurrent = parseFloat(latestData.current).toFixed(2);
      console.log("Latest Current:", sanitizedCurrent);

      setLatestCurrent(sanitizedCurrent);
      updateChartData(sanitizedCurrent);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching current data:', error);
    }
  };

  // Update chart data and labels for each new current value
  const updateChartData = (newCurrent) => {
    setChartData((prevData) => {
      const updatedData = [...prevData, parseFloat(newCurrent)];
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

  // Polling to fetch data every second
  useEffect(() => {
    fetchCurrentData();

    intervalRef.current = setInterval(() => {
      fetchCurrentData();
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8A2BE2" />
          <Text style={styles.loadingText}>Fetching Current Data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Live Current Data</Text>
      </View>

      {/* Display latest current */}
      <View style={styles.currentContainer}>
        <Text style={styles.currentText}>
          Latest Current: {latestCurrent ? `${latestCurrent} A` : 'No data'}
        </Text>
      </View>

      {/* Bar Chart for real-time updates */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: labels,
              datasets: [
                {
                  data: chartData,
                },
              ],
            }}
            width={Dimensions.get("window").width * 1.5} // Expand width for scrolling
            height={Dimensions.get("window").height * 0.45}
            yAxisSuffix=" A"
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: "#022173",
              backgroundGradientFrom: "#0D0D3A",
              backgroundGradientTo: "#2E2E82",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(138, 43, 226, ${opacity})`, // Purple color for the bars
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              fillShadowGradient: "#8A2BE2", // Bright purple fill
              fillShadowGradientOpacity: 1,
              propsForBackgroundLines: {
                stroke: "#FFFFFF",
              },
            }}
            fromZero
            yAxisMin={0}  // Minimum current level
            yAxisMax={5}  // Maximum current level
            style={{
              marginVertical: 20,
              borderRadius: 16,
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27', padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  headerText: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFF', fontSize: 18, marginTop: 10 },
  currentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  currentText: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  chartContainer: { height: 'auto', padding: 10 },
});

export default CurrentGraph;
