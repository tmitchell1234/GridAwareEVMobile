import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, Alert } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const Bluetooth = () => {
  const [jwtToken, setJwtToken] = useState(null);
  const [devices, setDevices] = useState([]);

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

  const registerDevice = async (macAddress) => {
    if (!jwtToken) {
      Alert.alert('Error', 'You need to log in first.');
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

  const unregisterDevice = async (macAddress) => {
    if (!jwtToken) {
      Alert.alert('Error', 'You need to log in first.');
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
      <Text style={styles.text}>Bluetooth Screen</Text>
      <Button title="Register Device" onPress={() => registerDevice('00:1A:7D:DA:71:13')} />
      <Button title="Unregister Device" onPress={() => unregisterDevice('00:1A:7D:DA:71:13')} />
      <Button title="Get Devices" onPress={getDevicesForUser} />
      {devices.length > 0 && (
        <View>
          <Text>Devices:</Text>
          {devices.map((device, index) => (
            <Text key={index}>{device.device_mac_address}</Text>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0E27',
  },
  text: {
    color: 'white',
    fontSize: 18,
  },
});

export default Bluetooth;
