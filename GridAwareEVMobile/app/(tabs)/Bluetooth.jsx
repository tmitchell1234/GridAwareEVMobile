import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BleManager } from 'react-native-ble-plx';
import { requestMultiple, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Buffer } from 'buffer';  // Import Buffer
import Constants from 'expo-constants';
import CryptoJS from 'crypto-js';

const manager = new BleManager();
const API_KEY = Constants.expoConfig.extra.API_KEY;  // API_KEY from app.json

const ESP32_PREFIX = 'ESP32';  // Filter ESP32 devices by name
const SERVICE_UUID = "12345678-1234-1234-1234-123456789abc";  // Service UUID
const CHARACTERISTIC_UUID = "87654321-4321-4321-4321-cba987654321";  // Characteristic UUID

// Encryption AES
const key = CryptoJS.enc.Utf8.parse("1234567890123456");
const iv = CryptoJS.enc.Utf8.parse("abcdef9876543210");

const Bluetooth = () => {
  const [jwtToken, setJwtToken] = useState(null);
  const [scannedDevices, setScannedDevices] = useState([]); // Scanned Bluetooth devices
  const [selectedDevice, setSelectedDevice] = useState(null); // Selected Bluetooth device
  const [connectedDevice, setConnectedDevice] = useState(null); // Currently connected Bluetooth device
  const [isScanning, setIsScanning] = useState(false); // Scanning state
  const [wifiSSID, setWifiSSID] = useState(''); // Wi-Fi SSID
  const [wifiPassword, setWifiPassword] = useState(''); // Wi-Fi Password
  const [showPassword, setShowPassword] = useState(false); // Show/Hide password state
  const [sendingCredentials, setSendingCredentials] = useState(false); // Sending state

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
      const permissions = [
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ];
      const results = await requestMultiple(permissions);
      handlePermissionsResult(results);
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request Bluetooth permission.');
    }
  };

  // Handle permission results for both platforms
  const handlePermissionsResult = (results) => {
    const allGranted = Object.values(results).every(result => result === RESULTS.GRANTED);
    if (allGranted) {
      Alert.alert('Permission granted', 'You can now scan for Bluetooth devices.');
    } else {
      Alert.alert('Permission denied', 'All required permissions must be granted to use Bluetooth.');
    }
  };

  // Scan for Bluetooth devices, ensuring no repeats and filtering ESP32 devices only
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

        // Filter ESP32 devices by name and prevent duplicates by checking MAC address (device.id)
        if (
          device &&
          device.id &&
          device.name && // Check that the device has a name
          device.name.startsWith(ESP32_PREFIX) && // Check if it starts with the ESP32_PREFIX
          !scannedDevices.some(d => d.id === device.id) // Prevent duplicates by checking id (MAC address)
        ) {
          // Add the ESP32 device to the list of scanned devices
          setScannedDevices(prevDevices => [...prevDevices, { ...device, name: 'ESP32', id: device.id }]);

          // Stop scanning as soon as an ESP32 device is found
          manager.stopDeviceScan();
          setIsScanning(false);

          // Alert user with the found device and its MAC address
          Alert.alert('ESP32 Found', `Found ESP32 with MAC Address: ${device.id}. You can connect now.`);
        }
      });

      // Stop scanning after 10 seconds if no devices are found
      setTimeout(() => {
        if (isScanning) {
          manager.stopDeviceScan();
          setIsScanning(false);
          if (scannedDevices.length === 0) {
            Alert.alert('No ESP32 Devices Found', 'Try scanning again.');
          }
        }
      }, 10000); // Timeout duration can be adjusted
    } catch (error) {
      console.error('Error while scanning:', error);
      setIsScanning(false);
    }
  };

  // Automatically send user_jwt after connecting
  const sendUserJWT = async (device) => {
    if (!jwtToken) {
      console.error('No JWT available to send.');
      return;
    }
  
    // Encrypt the JWT before sending
    const encryptedJWT = CryptoJS.AES.encrypt(JSON.stringify({ jwt: jwtToken }), key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString();
  
    try {
      const characteristic = await device.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        Buffer.from(encryptedJWT).toString('base64')  // Send as Base64 encoded string
      );
      console.log('Encrypted JWT sent successfully');
    } catch (error) {
      console.error('Error sending encrypted JWT:', error);
      Alert.alert('Error', 'Failed to send JWT.');
    }
  };
  
  // Connect to the selected Bluetooth device and send user_jwt automatically
  const connectToDevice = async (device) => {
    try {
      const connected = await manager.connectToDevice(device.id);
      setConnectedDevice(connected); // Set the connected device
      const services = await connected.discoverAllServicesAndCharacteristics();
      const availableServices = await connected.services();
      
      // Confirm the correct service is available
      const service = availableServices.find(s => s.uuid === SERVICE_UUID);
      if (!service) {
        throw new Error(`Service ${SERVICE_UUID} not found`);
      }

      const characteristics = await service.characteristics();
      const characteristic = characteristics.find(c => c.uuid === CHARACTERISTIC_UUID);
      if (!characteristic) {
        throw new Error(`Characteristic ${CHARACTERISTIC_UUID} not found`);
      }

      setScannedDevices([]); // Clear scanned devices once connected
      Alert.alert('Success', `Connected to ${device.name || 'Unnamed Device'}`);

      // Send the user JWT in the background
      sendUserJWT(connected);
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Error', error.message || 'Failed to connect to device.');
    }
  };

  // Send Wi-Fi credentials to the ESP32
  const sendWifiCredentials = async () => {
    if (!wifiSSID || !wifiPassword) {
      Alert.alert('Error', 'Please enter both SSID and password.');
      return;
    }
  
    // Encrypt the Wi-Fi credentials before sending
    const encryptedCredentials = CryptoJS.AES.encrypt(JSON.stringify({ wifi: wifiSSID, password: wifiPassword }), key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString();
  
    setSendingCredentials(true);
    try {
      const characteristic = await connectedDevice.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        Buffer.from(encryptedCredentials).toString('base64')  // Send as Base64 encoded string
      );
  
      Alert.alert('Credentials Sent', `Encrypted SSID and password sent to the ESP32.`);
      setSendingCredentials(false);
    } catch (error) {
      console.error('Error sending encrypted Wi-Fi credentials:', error);
      Alert.alert('Error', 'Failed to send Wi-Fi credentials.');
      setSendingCredentials(false);
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
          <Text style={styles.buttonText}>{isScanning ? 'Scanning...' : 'Scan for ESP32 Devices'}</Text>
        </TouchableOpacity>

        {/* Scanned Devices List */}
        {scannedDevices.length > 0 && (
          <FlatList
            data={scannedDevices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.deviceItem}
                onPress={() => {
                  setSelectedDevice(item);
                  connectToDevice(item); // Connect to device after selecting it
                }}
              >
                <Text style={styles.deviceText}>
                {item.name || 'ESP32'}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Connected Device Section */}
        {connectedDevice && (
          <>
            <Text style={styles.connectedText}>Connected to {connectedDevice.name || 'Unnamed Device'}</Text>

            {/* Wi-Fi Credentials Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Wi-Fi SSID"
                placeholderTextColor="#B0B0B0"
                value={wifiSSID}
                onChangeText={setWifiSSID}
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Wi-Fi Password"
                  placeholderTextColor="#B0B0B0"
                  secureTextEntry={!showPassword}
                  value={wifiPassword}
                  onChangeText={setWifiPassword}
                />
                <TouchableOpacity
                  style={styles.showPasswordButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.showPasswordText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Send Credentials Button */}
            <TouchableOpacity style={styles.actionButton} onPress={sendWifiCredentials} disabled={sendingCredentials}>
              <Text style={styles.buttonText}>{sendingCredentials ? 'Sending...' : 'Send Wi-Fi Credentials'}</Text>
            </TouchableOpacity>

          </>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showPasswordButton: {
    marginLeft: 10,
  },
  showPasswordText: {
    color: '#4D9FF9',
    fontWeight: 'bold',
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
  connectedText: {
    fontSize: 18,
    color: '#00FF00',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default Bluetooth;
