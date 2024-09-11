import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const Bluetooth = () => {
  const [jwtToken, setJwtToken] = useState(null);
  const [devices, setDevices] = useState([]);
  const [macAddress, setMacAddress] = useState(''); // State for MAC Address input

  // Retrieve the JWT token from AsyncStorage when the component mounts
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userJwt'); // Get JWT from AsyncStorage
        if (token) {
          setJwtToken(token);
        } else {
          Alert.alert('Error', 'You need to log in first.');
        }
      } catch (error) {
        console.error('Failed to fetch JWT:', error);
      }
    };
    fetchToken();
  }, []);

  const registerDevice = async () => {
    if (!jwtToken || !macAddress) {
      Alert.alert('Error', 'You need to log in and enter a valid MAC address.');
      return;
    }

    try {
      const response = await axios.post('http://gridawarecharging.com/api/register_device', {
        api_key: API_KEY,
        user_jwt: jwtToken,
        device_mac_address: macAddress,
      });
      Alert.alert('Success', 'Device registered successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to register device.');
      console.error('Error registering device:', error);
    }
  };

  const unregisterDevice = async () => {
    if (!jwtToken || !macAddress) {
      Alert.alert('Error', 'You need to log in and enter a valid MAC address.');
      return;
    }

    try {
      const response = await axios.post('http://gridawarecharging.com/api/unregister_device_by_user', {
        api_key: API_KEY,
        user_jwt: jwtToken,
        device_mac_address: macAddress,
      });
      Alert.alert('Success', 'Device unregistered successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to unregister device.');
      console.error('Error unregistering device:', error);
    }
  };

  const getDevicesForUser = async () => {
    if (!jwtToken) {
      Alert.alert('Error', 'You need to log in first.');
      return;
    }

    try {
      const response = await axios.get('http://gridawarecharging.com/api/get_devices_for_user', {
        params: {
          api_key: API_KEY,
          user_jwt: jwtToken,
        },
      });
      setDevices(response.data.devices);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch devices.');
      console.error('Error fetching devices:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerText}>Bluetooth Device Management</Text>
        
        {/* MAC Address Input */}
        <TextInput
          style={styles.input}
          placeholder="Enter MAC Address"
          placeholderTextColor="#B0B0B0"
          value={macAddress}
          onChangeText={setMacAddress}
        />

        {/* Register Device Button */}
        <TouchableOpacity style={styles.actionButton} onPress={registerDevice}>
          <Text style={styles.buttonText}>Register Device</Text>
        </TouchableOpacity>

        {/* Unregister Device Button */}
        <TouchableOpacity style={styles.actionButton} onPress={unregisterDevice}>
          <Text style={styles.buttonText}>Unregister Device</Text>
        </TouchableOpacity>

        {/* Get Devices Button */}
        <TouchableOpacity style={styles.actionButton} onPress={getDevicesForUser}>
          <Text style={styles.buttonText}>Get Registered Devices</Text>
        </TouchableOpacity>

        {/* Display Registered Devices */}
        {devices.length > 0 && (
          <View style={styles.devicesList}>
            <Text style={styles.sectionTitle}>Registered Devices:</Text>
            {devices.map((device, index) => (
              <Text key={index} style={styles.deviceText}>
                {device.device_mac_address}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Style Definitions
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1A1E3A',
    color: '#FFFFFF',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderColor: '#4D9FF9',
    borderWidth: 1,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#4D9FF9',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#4D9FF9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  devicesList: {
    marginTop: 30,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FF6F3C',
    marginBottom: 15,
    textAlign: 'center',
  },
  deviceText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
  },
});

export default Bluetooth;
