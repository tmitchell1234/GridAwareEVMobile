import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { BarChart } from 'react-native-chart-kit';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const VoltageGraph = () => {
  const [voltageData, setVoltageData] = useState([]); // Voltage data to display on the chart
  const [labels, setLabels] = useState([]); // Time (formatted date) for X-axis
  const isMounted = useRef(true); // To track component mounted state
  const FETCH_INTERVAL = 1; // Fetch data every 1 second for near real-time updates

  // Fetch the voltage data from the API
  const fetchVoltageData = async () => {
    try {
      const deviceMac = await AsyncStorage.getItem('selectedDeviceMac');
      const userJwt = await AsyncStorage.getItem('userJwt');

      if (!deviceMac || !userJwt) {
        Alert.alert('Error', 'Device MAC or user token missing.');
        return;
      }

      const response = await axios.post('https://gridawarecharging.com/api/get_data_in_recent_time_interval', {
        api_key: API_KEY,
        user_jwt: userJwt,
        device_mac_address: deviceMac,
        time_seconds: FETCH_INTERVAL,
      });

      if (!Array.isArray(response.data)) {
        console.error("Unexpected response format:", response.data);
        return;
      }

      processVoltageData(response.data);
    } catch (error) {
      console.error('Error fetching voltage data:', error);
    }
  };

  // Process the fetched voltage data
  const processVoltageData = (data) => {
    const newVoltages = data.map(entry => {
      if (entry.voltage) {
        console.log(`Voltage fetched: ${entry.voltage}`);
        return entry.voltage;
      } else {
        console.warn('Voltage data missing in the response');
        return null;
      }
    }).filter(Boolean);

    const timeLabels = data.map(entry => {
      const date = new Date(entry.time);
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    });

    // Update state with new voltage data and labels
    setVoltageData(prevData => [...prevData, ...newVoltages]);
    setLabels(prevLabels => [...prevLabels, ...timeLabels]);
  };

  // Start fetching data continuously
  useEffect(() => {
    isMounted.current = true; // Component is mounted
    fetchVoltageData(); // Initial fetch
    const interval = setInterval(() => {
      if (isMounted.current) fetchVoltageData();
    }, FETCH_INTERVAL * 1000); // Fetch data every 1 second

    return () => {
      clearInterval(interval); // Cleanup on component unmount
      isMounted.current = false; // Component unmounted
    };
  }, []); 

  // Chart configuration
  const chartConfig = {
    backgroundColor: "#022173",
    backgroundGradientFrom: "#1c3faa",
    backgroundGradientTo: "#226bdf",
    decimalPlaces: 3,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  const screenWidth = Dimensions.get("window").width;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Voltage Data</Text>
      </View>

      {/* Bar Chart for Voltage Data */}
      <View style={styles.chartContainer}>
        {voltageData.length > 0 ? (
          <BarChart
            key={voltageData.length} 
            data={{
              labels: labels,
              datasets: [
                {
                  data: voltageData,
                },
              ],
            }}
            width={screenWidth - 40}
            height={300}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            fromZero
            style={{
              marginVertical: 20,
              borderRadius: 16,
            }}
          />
        ) : (
          <Text style={styles.loadingText}>Fetching voltage data...</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerText: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  chartContainer: { height: 400, padding: 10 },
  loadingText: { color: '#FFF', fontSize: 18, textAlign: 'center', marginTop: 10 },
});

export default VoltageGraph;
