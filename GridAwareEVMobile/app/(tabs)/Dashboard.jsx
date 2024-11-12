import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const Dashboard = () => {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceMac, setDeviceMac] = useState(null); 
  const [isCharging, setIsCharging] = useState(null);
  const [chartData, setChartData] = useState({
    labels: Array.from({ length: 10 }, () => ""),
    datasets: [
      { data: Array(10).fill(60), color: () => '#1e90ff' },
      { data: Array(10).fill(3.5), color: () => '#ffa500' },
      { data: Array(10).fill(1.5), color: () => '#32cd32' }
    ],
  });
  
  const fetchInterval = useRef(null); 

  const verifyDeviceExists = async () => {
    try {
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

  const fetchData = async () => {
    if (!deviceMac) return;

    try {
      const userJwt = await AsyncStorage.getItem('userJwt');
      if (!userJwt) {
        Alert.alert('Error', 'User token not found. Please log in again.');
        return;
      }

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
        setIsCharging(latestData.is_charging);
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

  useFocusEffect(
    React.useCallback(() => {
      checkDeviceRegistration();

      if (deviceMac) {
        fetchInterval.current = setInterval(fetchData, 1000);
      }

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
        <ActivityIndicator size="large" color="#00BFFF" />
      ) : isRegistered ? (
        <>
          <Text style={styles.graphTitle}>Live Measurement Data</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={250}
            yAxisSuffix=""
            yAxisInterval={1}
            chartConfig={{
              backgroundGradientFrom: "#1A1E3A",
              backgroundGradientTo: "#2B3467",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 20 },
              propsForDots: { r: "6", strokeWidth: "2", stroke: "#00BFFF" },
            }}
            bezier
            withInnerLines={false}
            withVerticalLabels={false}
            style={{ marginVertical: 20, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}
          />

          <View style={styles.legendContainer}>
            <Text style={[styles.legendText, { color: '#1e90ff' }]}>• Frequency (Hz)</Text>
            <Text style={[styles.legendText, { color: '#ffa500' }]}>• Voltage (V)</Text>
            <Text style={[styles.legendText, { color: '#32cd32' }]}>• Current (A)</Text>
          </View>

          <View style={styles.chargingStatusContainer}>
            <Text style={[styles.chargingStatusText, { color: isCharging ? '#00FF7F' : '#FF6347' }]}>
              Charging Status: {isCharging ? 'ON' : 'OFF'}
              </Text>
          </View>

          <View style={styles.statusNote}>
            <Text style={styles.statusNoteText}>
              Charging Status Depends On Frequency: Above 60Hz, Charging Stays ON; Below 60Hz, Charging Turns OFF.
            </Text>
          </View>

          <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            <TouchableOpacity style={styles.sectionButton} onPress={() => router.push('(dashoptions)/frequencygraph')}>
              <Ionicons name="pulse" size={26} color="white" style={styles.icon} />
              <Text style={styles.buttonText}>Frequency</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sectionButton} onPress={() => router.push('(dashoptions)/current')}>
              <MaterialCommunityIcons name="current-ac" size={26} color="white" style={styles.icon} />
              <Text style={styles.buttonText}>Current</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sectionButton} onPress={() => router.push('(dashoptions)/voltage')}>
              <Ionicons name="flash" size={26} color="white" style={styles.icon} />
              <Text style={styles.buttonText}>Voltage</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sectionButton} onPress={() => router.push('(dashoptions)/ischarging')}>
              <Ionicons name="battery-charging" size={26} color="white" style={styles.icon} />
              <Text style={styles.buttonText}>Charge Statistics</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sectionButton} onPress={() => router.push('(dashoptions)/batterystatus')}>
              <Ionicons name="battery-half" size={26} color="white" style={styles.icon} />
              <Text style={styles.buttonText}>Battery Status</Text>
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
  container: { 
    flex: 1, 
    backgroundColor: '#0A0E27', 
    padding: 20 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  logo: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    marginRight: 12 
  },
  headerText: { 
    color: 'white', 
    fontSize: 26, 
    fontWeight: 'bold' 
  },
  legendContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    paddingVertical: 12 
  },
  legendText: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  chargingStatusContainer: { 
    alignItems: 'center', 
    marginVertical: 15, 
    backgroundColor: '#1A1E3A', 
    padding: 12, 
    borderRadius: 15,
    shadowColor: "#FF6F3C", 
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  chargingStatusText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#FFF', 
  },
  boldText: { 
    fontWeight: 'bold', 
    color: '#FFF' 
  },
  scrollContainer: { 
    flex: 1, 
    marginTop: 25 
  },
  sectionButton: { 
    backgroundColor: '#3A4C73', 
    padding: 20, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginBottom: 15, 
    flexDirection: 'row', 
    shadowColor: "#FF6F3C", // Fiery orange shadow
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 10, 
    elevation: 8,
  },
  icon: { 
    marginRight: 15 
  },
  buttonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: '600' 
  },
  promptContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  promptText: { 
    color: '#FFF', 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 12, 
    textAlign: 'center' 
  },
  promptDescription: { 
    color: '#BBB', 
    fontSize: 16, 
    textAlign: 'center', 
    paddingHorizontal: 30, 
    marginBottom: 20 
  },
  connectButton: { 
    backgroundColor: '#2B3467', 
    paddingVertical: 18, 
    paddingHorizontal: 35, 
    borderRadius: 15, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 8 
  },
  connectButtonText: { 
    color: '#00BFFF', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  graphTitle: {
    color: '#E1E4E8',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  statusNote: {
    backgroundColor: '#1A1E3A',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusNoteText: {
    color: '#B0B0B0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default Dashboard;