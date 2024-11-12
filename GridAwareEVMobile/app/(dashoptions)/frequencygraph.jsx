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
      const updatedLabels = [...prevLabels, `${nextTime}s`];
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
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

      <View style={styles.unitExplanation}>
        <Text style={styles.unitExplanationText}>Note: Hz stands for Hertz, s stands for seconds.</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: labels,
              datasets: [
                {
                  data: chartData,
                  color: () => `rgba(0, 191, 255, 1)`, // Updated color to make it visually appealing
                },
              ],
            }}
            width={screenWidth * 1.5}
            height={Dimensions.get("window").height * 0.4}
            yAxisSuffix=" Hz"
            yAxisInterval={1} // Ensure a better representation of axis values
            chartConfig={{
              backgroundGradientFrom: "#1F1F3B",
              backgroundGradientTo: "#3C3C62",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: "6", strokeWidth: "2", stroke: "#00BFFF" },
            }}
            bezier
            style={styles.chartStyle}
          />
        </View>
      </ScrollView>

      <View style={styles.header}>
        <Text style={styles.headerText}>Charging Status</Text>
      </View>

      <View style={styles.statusNote}>
        <Text style={styles.statusNoteText}>
          Charging Status Depends On Frequency: Above 60Hz, Charging Stays ON; Below 60Hz, Charging Turns OFF.
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: labels,
              datasets: [
                {
                  data: statusData,
                  color: (opacity = 1) => `rgba(50, 205, 50, ${opacity})`, // Updated color to vibrant green
                },
              ],
            }}
            width={screenWidth * 1.5}
            height={Dimensions.get("window").height * 0.2}
            yAxisSuffix=""
            yAxisInterval={1}
            fromZero
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27', padding: 20 },
  header: { alignItems: 'center', marginBottom: 10 },
  headerText: { color: '#00BFFF', fontSize: 22, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFF', fontSize: 18, marginTop: 10 },
  frequencyContainer: { alignItems: 'center', marginVertical: 15 },
  frequencyText: { color: '#FFFFFF', fontSize: 20, fontWeight: '600' },
  frequencyValue: { color: '#00BFFF', fontWeight: 'bold' },
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
    color: '#00BFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusNote: {
    backgroundColor: '#1A1E3A',
    padding: 10,
    borderRadius: 12,
    marginVertical: 10,
    shadowColor: "#FF6F3C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  statusNoteText: {
    color: '#E1E4E8',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendText: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 10 },
  unitExplanation: {
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  unitExplanationText: {
    color: '#E1E4E8',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 30,
  },
});

export default FrequencyGraph;
