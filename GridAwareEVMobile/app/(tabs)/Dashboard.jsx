import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const Dashboard = () => {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceMac, setDeviceMac] = useState(null); 
  const [chartData, setChartData] = useState({
    labels: Array.from({ length: 10 }, () => ""),
    datasets: [
      { data: Array(10).fill(60), color: () => '#1e90ff' },
      { data: Array(10).fill(3.5), color: () => '#ffa500' },
      { data: Array(10).fill(1.5), color: () => '#32cd32' }
    ],
  });
  
  const fetchInterval = useRef(null); // Use a ref to store the interval, so it persists across renders

  // Function to verify device existence using the check_exists endpoint
  const verifyDeviceExists = async () => {
    try {
      const userJwt = await AsyncStorage.getItem('userJwt');
      if (!deviceMac || !userJwt) return false;

      const response = await axios.post('https://gridawarecharging.com/api/check_exists', {
        api_key: API_KEY,
        device_mac_address: deviceMac,
      });

      // Check the "exists" field in the response
      return response.data.exists;
    } catch (error) {
      console.error("Error verifying device existence:", error);
      return false;
    }
  };

  // Function to check device registration and set states accordingly
  const checkDeviceRegistration = async () => {
    try {
      const userJwt = await AsyncStorage.getItem('userJwt');
      if (!userJwt) {
        Alert.alert('Error', 'User JWT not found. Please log in again.');
        return;
      }

      const response = await axios.post('https://gridawarecharging.com/api/get_devices_for_user', {
        api_key: API_KEY,
        user_jwt: userJwt
      });

      if (response.data && response.data.length > 0) {
        setIsRegistered(true);
        setDeviceMac(response.data[0].device_mac_address);
      } else {
        setIsRegistered(false);
        setDeviceMac(null);
        Alert.alert('No Device Registered', 'Please go to Profile and select a device.');
      }
    } catch (error) {
      console.error('Error checking device registration:', error);
      Alert.alert('Error', 'Unable to check device registration. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch data
  const fetchData = async () => {
    if (!deviceMac) return;

    try {
      const userJwt = await AsyncStorage.getItem('userJwt');
      if (!userJwt) {
        Alert.alert('Error', 'User token not found. Please log in again.');
        return;
      }

      // Check if the device is still registered before fetching data
      const exists = await verifyDeviceExists();
      if (!exists) {
        setIsRegistered(false);
        setDeviceMac(null);
        clearInterval(fetchInterval.current);
        Alert.alert('Device Unregistered', 'Your device has been unregistered. Please select a registered device.');
        return;
      }

      const response = await axios.post('https://gridawarecharging.com/api/get_data_in_recent_time_interval', {
        api_key: API_KEY,
        user_jwt: userJwt,
        device_mac_address: deviceMac,
        time_seconds: 1,
      });

      if (Array.isArray(response.data) && response.data.length > 0) {
        const latestData = response.data[response.data.length - 1];
        updateChartData(latestData.frequency, latestData.voltage, latestData.current);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateChartData = (frequency, voltage, current) => {
    setChartData(prevState => ({
      ...prevState,
      datasets: [
        { data: [...prevState.datasets[0].data.slice(1), frequency], color: () => '#1e90ff' },
        { data: [...prevState.datasets[1].data.slice(1), voltage], color: () => '#ffa500' },
        { data: [...prevState.datasets[2].data.slice(1), current], color: () => '#32cd32' },
      ],
    }));
  };

  // Use useFocusEffect to handle periodic data fetch
  useFocusEffect(
    React.useCallback(() => {
      checkDeviceRegistration();

      // Only set interval if deviceMac is available
      if (deviceMac) {
        fetchInterval.current = setInterval(fetchData, 1000);
      }

      // Cleanup interval when leaving the screen
      return () => {
        if (fetchInterval.current) {
          clearInterval(fetchInterval.current);
          fetchInterval.current = null;
        }
      };
    }, [deviceMac])
  );

  const screenWidth = Dimensions.get('window').width;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../images/GridAwareLogo.png')} style={styles.logo} />
        <Text style={styles.headerText}>Dashboard</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#FF6F3C" />
      ) : isRegistered ? (
        <>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={250}
            yAxisSuffix=""
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: "#1c1c1c",
              backgroundGradientFrom: "#2c2c2c",
              backgroundGradientTo: "#3c3c3c",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: "5", strokeWidth: "2" },
            }}
            bezier
            withInnerLines={false}
            withVerticalLabels={false}
            style={{ marginVertical: 20, borderRadius: 16 }}
          />

          <View style={styles.legendContainer}>
            <Text style={[styles.legendText, { color: '#1e90ff' }]}>• Frequency (Hz)</Text>
            <Text style={[styles.legendText, { color: '#ffa500' }]}>• Voltage (V)</Text>
            <Text style={[styles.legendText, { color: '#32cd32' }]}>• Current (A)</Text>
          </View>

          <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            <TouchableOpacity style={styles.sectionButton} onPress={() => router.push('(dashoptions)/frequencygraph')}>
              <Text style={styles.buttonText}>Frequency</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sectionButton} onPress={() => router.push('(dashoptions)/current')}>
              <Text style={styles.buttonText}>Current</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sectionButton} onPress={() => router.push('(dashoptions)/voltage')}>
              <Text style={styles.buttonText}>Voltage</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sectionButton} onPress={() => router.push('(dashoptions)/ischarging')}>
              <Text style={styles.buttonText}>Charge Status</Text>
            </TouchableOpacity>
          </ScrollView>
        </>
      ) : (
        <View style={styles.promptContainer}>
          <Text style={styles.promptText}>Welcome to GridAware!</Text>
          <Text style={styles.promptDescription}>
            It looks like you haven't connected a device yet. Go to the Bluetooth tab to connect your ESP32 device.
          </Text>
          <TouchableOpacity style={styles.connectButton} onPress={() => router.push('/Bluetooth')}>
            <Text style={styles.connectButtonText}>Go to Bluetooth</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logo: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  headerText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  legendContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
  legendText: { fontSize: 16, fontWeight: 'bold' },
  scrollContainer: { flex: 1, marginTop: 20 },
  sectionButton: { backgroundColor: '#FF6F3C', padding: 20, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: 'white', fontSize: 18 },
  promptContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  promptText: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  promptDescription: { color: '#BBB', fontSize: 16, textAlign: 'center', paddingHorizontal: 30, marginBottom: 20 },
  connectButton: { backgroundColor: '#1A1E3A', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 10 },
  connectButtonText: { color: '#FF6F3C', fontSize: 16, fontWeight: 'bold' },
});

export default Dashboard;
