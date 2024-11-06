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
  const [statusData, setStatusData] = useState([0]); 
  const [labels, setLabels] = useState(["0"]);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);

  const sanitizeFrequency = (frequency) => {
    const parsedFrequency = parseFloat(frequency);
    return (!Number.isFinite(parsedFrequency) || isNaN(parsedFrequency) || parsedFrequency < 0 || parsedFrequency > 100)
      ? 60
      : parsedFrequency;
  };

  const verifyDeviceExists = async () => {
    try {
      const deviceMac = await AsyncStorage.getItem('selectedDeviceMac');
      const userJwt = await AsyncStorage.getItem('userJwt');
      if (!deviceMac || !userJwt) return false;

      const response = await axios.post('https://gridawarecharging.com/api/check_exists', {
        api_key: API_KEY,
        device_mac_address: deviceMac,
      });

      return response.data.exists;
    } catch (error) {
      console.error("Error verifying device existence:", error);
      return false;
    }
  };

  const fetchFrequencyData = async () => {
    try {
      const deviceMac = await AsyncStorage.getItem('selectedDeviceMac');
      const userJwt = await AsyncStorage.getItem('userJwt');

      if (!deviceMac || !userJwt) {
        Alert.alert('Error', 'Device MAC or user token missing. Please go to Profile to select your device.');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        return;
      }

      const exists = await verifyDeviceExists();
      if (!exists) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        Alert.alert('Device Unregistered', 'Your device is no longer registered. Please select a registered device from the Profile tab.');
        return;
      }

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
      setLatestFrequency(sanitizedFrequency);
      updateChartData(sanitizedFrequency, latestData.is_charging ? 1 : 0); 
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching frequency data:', error);
    }
  };

  const updateChartData = (newFrequency, chargingStatus) => {
    setChartData((prevData) => {
      const updatedData = [...prevData, newFrequency];
      if (updatedData.length > 20) {
        updatedData.shift();
      }
      return updatedData;
    });

    setStatusData((prevData) => {
      const updatedData = [...prevData, chargingStatus];
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
      intervalRef.current = setInterval(fetchFrequencyData, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
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

  const screenWidth = Dimensions.get("window").width;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Live Frequency Data</Text>
      </View>

      <View style={styles.frequencyContainer}>
        <Text style={styles.frequencyText}>
          Latest Frequency: <Text style={styles.frequencyValue}>{latestFrequency ? `${latestFrequency} Hz` : 'No data'}</Text>
        </Text>
      </View>

      <View style={styles.swipeHintContainer}>
        <Text style={styles.swipeHintText}>Swipe left or right to view more data</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: labels,
              datasets: [
                {
                  data: chartData,
                  color: () => `rgba(255, 111, 60, 1)`,
                },
              ],
            }}
            width={screenWidth * 1.5}
            height={Dimensions.get("window").height * 0.4}
            yAxisSuffix=" Hz"
            chartConfig={{
              backgroundGradientFrom: "#1C2033",
              backgroundGradientTo: "#2F3651",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: "5", strokeWidth: "2", stroke: "#FF6F3C" },
            }}
            bezier
            style={styles.chartStyle}
          />
        </View>
      </ScrollView>

      <View style={styles.header}>
        <Text style={styles.headerText}>Charging Status</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: labels,
              datasets: [
                {
                  data: statusData,
                  color: (opacity = 1, index) => statusData[index] === 1 ? `rgba(34, 203, 34, ${opacity})` : `rgba(255, 99, 71, ${opacity})`,
                },
              ],
            }}
            width={screenWidth * 1.5}
            height={Dimensions.get("window").height * 0.2}
            yAxisSuffix=""
            chartConfig={{
              backgroundGradientFrom: "#2E2E2E",
              backgroundGradientTo: "#5E5E5E",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 },
            }}
            style={[styles.chartStyle, { marginTop: 10 }]}
          />
        </View>
      </ScrollView>

      <View style={styles.legendContainer}>
        <Text style={[styles.legendText, { color: 'white' }]}>• 0 (OFF)</Text>
        <Text style={[styles.legendText, { color: 'white' }]}>• 1 (ON)</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27', padding: 20 },
  header: { alignItems: 'center', marginBottom: 10 },
  headerText: { color: '#FF6F3C', fontSize: 20, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFF', fontSize: 18, marginTop: 10 },
  frequencyContainer: { alignItems: 'center', marginVertical: 15 },
  frequencyText: { color: '#FFFFFF', fontSize: 20, fontWeight: '600' },
  frequencyValue: { color: '#FF6F3C', fontWeight: 'bold' },
  chartContainer: { paddingHorizontal: 10 },
  chartStyle: { marginVertical: 10, borderRadius: 16 },
  swipeHintContainer: {
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  swipeHintText: {
    color: '#FF6F3C',
    fontSize: 14,
    fontWeight: '600',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendText: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 10 },
});

export default FrequencyGraph;
