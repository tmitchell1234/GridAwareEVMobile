import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, Dimensions } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { BarChart } from 'react-native-chart-kit';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const VoltageGraph = () => {
  const [latestVoltage, setLatestVoltage] = useState(null);
  const [chartData, setChartData] = useState([3]); // Initialize around midpoint for the 0-6V range
  const [labels, setLabels] = useState(["0"]);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);

  // Fetch voltage data from the API
  const fetchVoltageData = async () => {
    try {
      const deviceMac = await AsyncStorage.getItem('selectedDeviceMac');
      const userJwt = await AsyncStorage.getItem('userJwt');

      if (!deviceMac || !userJwt) {
        Alert.alert('Error', 'Device MAC or user token missing.');
        return;
      }

      console.log("Fetching voltage data...");
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
      const sanitizedVoltage = parseFloat(latestData.voltage).toFixed(2);
      console.log("Latest Voltage:", sanitizedVoltage);

      setLatestVoltage(sanitizedVoltage);
      updateChartData(sanitizedVoltage);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching voltage data:', error);
    }
  };

  // Update chart data and labels
  const updateChartData = (newVoltage) => {
    setChartData((prevData) => {
      const updatedData = [...prevData, parseFloat(newVoltage)];
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
    fetchVoltageData();

    intervalRef.current = setInterval(() => {
      fetchVoltageData();
    }, 1000);

    // Cleanup function to stop fetching data when the component is unmounted
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Show loading spinner if data is not yet loaded
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
        <Text style={styles.headerText}>Live Voltage Data</Text>
      </View>

      {/* Display latest voltage */}
      <View style={styles.voltageContainer}>
        <Text style={styles.voltageText}>
          Latest Voltage: {latestVoltage ? `${latestVoltage} V` : 'No data'}
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
            yAxisSuffix=" V"
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: "#022173",
              backgroundGradientFrom: "#1c3faa",
              backgroundGradientTo: "#226bdf",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 111, 60, ${opacity})`, // Fiery orange for the bars
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              fillShadowGradient: "#FF6F3C", 
              fillShadowGradientOpacity: 1,
              propsForBackgroundLines: {
                stroke: "#FFFFFF",
              },
            }}
            fromZero
            yAxisMin={0}  
            yAxisMax={6}  
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
  voltageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  voltageText: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  chartContainer: { height: 'auto', padding: 10 },
});

export default VoltageGraph;
