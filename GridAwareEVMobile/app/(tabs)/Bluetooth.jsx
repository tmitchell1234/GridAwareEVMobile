import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, FlatList, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BleManager } from 'react-native-ble-plx';
import { requestMultiple, PERMISSIONS, RESULTS } from 'react-native-permissions';
import axios from 'axios';
import Constants from 'expo-constants'; 

const manager = new BleManager();
const API_KEY = Constants.expoConfig.extra.API_KEY;  // API_KEY, can be found in app.json

const Bluetooth = () => {
  const [jwtToken, setJwtToken] = useState(null);
  const [scannedDevices, setScannedDevices] = useState([]); // Scanned Bluetooth devices
  const [selectedDevice, setSelectedDevice] = useState(null); // Selected Bluetooth device
  const [isScanning, setIsScanning] = useState(false); // Scanning state
  const [connectedDevice, setConnectedDevice] = useState(null); // Currently connected Bluetooth device
  const [macAddress, setMacAddress] = useState(''); // MAC Address state

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

  // Request Bluetooth and Location permissions for both iOS and Android
  const requestBluetoothPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const permissions = [
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        ];
        const results = await requestMultiple(permissions);
        handlePermissionsResult(results);
      } else if (Platform.OS === 'ios') {
        const permissions = [
          PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL,
          PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        ];
        const results = await requestMultiple(permissions);
        handlePermissionsResult(results);
      }
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request Bluetooth permission.');
    }
  };

  // Handle permission results for both platforms
  const handlePermissionsResult = (results) => {
    let allGranted = true;

    for (const permission in results) {
      if (results[permission] !== RESULTS.GRANTED) {
        allGranted = false;
        break;
      }
    }

    if (allGranted) {
      Alert.alert('Permission granted', 'You can now scan for Bluetooth devices.');
    } else {
      Alert.alert('Permission denied', 'All required permissions must be granted to use Bluetooth.');
    }
  };

  // Scan for Bluetooth devices
  const scanForDevices = async () => {
    setIsScanning(true);
    try {
      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          setIsScanning(false);
          Alert.alert('Error', 'Failed to scan for devices.');
          return;
        }

        if (device && !scannedDevices.some((d) => d.id === device.id)) {
          setScannedDevices((prevDevices) => [...prevDevices, device]);
        }
      });

      //  It stop scanning after 5 seconds
      setTimeout(() => {
        manager.stopDeviceScan();
        setIsScanning(false);
        Alert.alert('Scanning stopped', 'Finished scanning for devices.');
      }, 5000);
    } catch (error) {
      console.error('Error while scanning:', error);
      setIsScanning(false);
    }
  };

  // Register the selected Bluetooth device
  const registerDevice = async (device) => {
    if (!jwtToken || !device) {
      Alert.alert('Error', 'You need to log in and select a valid device.');
      return;
    }

    try {
      const response = await axios.post('https://gridawarecharging.com/api/register_device', {
        api_key: API_KEY,
        user_jwt: jwtToken,
        device_mac_address: device.id,
      });
      Alert.alert('Success', 'Device registered successfully.');
      setMacAddress(device.id); // Update macAddress state
    } catch (error) {
      Alert.alert('Error', 'Failed to register device.');
      console.error('Error registering device:', error);
    }
  };

  // Unregister the selected Bluetooth device
  const unregisterDevice = async () => {
    if (!jwtToken || !macAddress) {
      Alert.alert('Error', 'You need to log in and select a valid device.');
      return;
    }

    try {
      const response = await axios.post('https://gridawarecharging.com/api/unregister_device_by_user', {
        api_key: API_KEY,
        user_jwt: jwtToken,
        device_mac_address: macAddress,
      });
      Alert.alert('Success', 'Device unregistered successfully.');
      setMacAddress(''); // It clears the macAddress
    } catch (error) {
      Alert.alert('Error', 'Failed to unregister device.');
      console.error('Error unregistering device:', error);
    }
  };

  // Connect to the selected Bluetooth device
  const connectToDevice = async (device) => {
    try {
      const connected = await manager.connectToDevice(device.id);
      setConnectedDevice(connected);
      Alert.alert('Success', `Connected to ${device.name || 'Unnamed Device'}`);
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Error', 'Failed to connect to device.');
    }
  };

  // Disconnect Section From The Bluetooth Connected 
  const disconnectFromDevice = async () => {
    try {
      if (connectedDevice) {
        await manager.cancelDeviceConnection(connectedDevice.id);
        setConnectedDevice(null);
        Alert.alert('Success', 'Disconnected from device.');
      } else {
        Alert.alert('No device to disconnect');
      }
    } catch (error) {
      console.error('Disconnection error:', error);
      Alert.alert('Error', 'Failed to disconnect from device.');
    }
  };

  // Clean up the manager on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      manager.destroy();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerText}>Bluetooth Device Management</Text>

        {/* Request Bluetooth Permission Button */}
        <TouchableOpacity style={styles.actionButton} onPress={requestBluetoothPermissions}>
          <Text style={styles.buttonText}>Request Bluetooth Permission</Text>
        </TouchableOpacity>

        {/* Scan for Devices Button */}
        <TouchableOpacity style={styles.actionButton} onPress={scanForDevices} disabled={isScanning}>
          <Text style={styles.buttonText}>{isScanning ? 'Scanning...' : 'Scan for Bluetooth Devices'}</Text>
        </TouchableOpacity>

        {/* Scanned Devices List */}
        {scannedDevices.length > 0 && (
          <View style={styles.devicesList}>
            <Text style={styles.sectionTitle}>Scanned Bluetooth Devices:</Text>
            <FlatList
              data={scannedDevices}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.deviceItem}
                  onPress={() => {
                    setSelectedDevice(item);
                    registerDevice(item);  // Register device after selecting it
                  }}
                >
                  <Text style={styles.deviceText}>
                    {item.name || 'Unnamed Device'} (ID: {item.id})
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Connect to Device Button */}
        {selectedDevice && (
          <TouchableOpacity style={styles.actionButton} onPress={() => connectToDevice(selectedDevice)}>
            <Text style={styles.buttonText}>Connect to Device</Text>
          </TouchableOpacity>
        )}

        {/* Disconnect from Device Button */}
        {connectedDevice && (
          <TouchableOpacity style={styles.actionButton} onPress={disconnectFromDevice}>
            <Text style={styles.buttonText}>Disconnect from Device</Text>
          </TouchableOpacity>
        )}

        {/* Unregister Device Button */}
        <TouchableOpacity style={styles.actionButton} onPress={unregisterDevice}>
          <Text style={styles.buttonText}>Unregister Device</Text>
        </TouchableOpacity>
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
  deviceItem: {
    padding: 10,
    backgroundColor: '#1A1E3A',
    borderRadius: 8,
    marginBottom: 10,
  },
  deviceText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default Bluetooth;
