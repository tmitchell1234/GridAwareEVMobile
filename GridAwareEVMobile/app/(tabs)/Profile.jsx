import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; 
import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const Profile = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [devices, setDevices] = useState([]); 
  const [selectedDevice, setSelectedDevice] = useState(null); 

  // Fetch user JWT token from AsyncStorage
  const fetchUserJwt = async () => {
    try {
      const token = await AsyncStorage.getItem('userJwt');
      if (token) {
        return token;
      } else {
        Alert.alert('Error', 'You need to log in first.');
      }
    } catch (error) {
      console.error('Failed to fetch JWT:', error);
    }
  };

  // Function to call the get_devices_for_user API
  const fetchDevices = async () => {
    try {
      const user_jwt = await AsyncStorage.getItem('userJwt'); 
  
      if (!user_jwt) {
        throw new Error('JWT token not found. Please log in again.');
      }

      const response = await axios.post('https://gridawarecharging.com/api/get_devices_for_user', {
        api_key: API_KEY,
        user_jwt: user_jwt
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const devices = response.data;
      setDevices(devices);  
    } catch (error) {
      if (error.response) {
        Alert.alert('Error', `Failed to fetch devices: ${error.response.data || 'Unknown server error'}`);
      } else if (error.request) {
        Alert.alert('Error', 'No response from server. Please check your connection.');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  // Function to handle the selection of a device
  const selectDevice = async (device) => {
    try {
      await AsyncStorage.setItem('selectedDeviceMac', device.device_mac_address);
      setSelectedDevice(device.device_mac_address); 
      Alert.alert('Device Selected', `Selected device: ${device.device_mac_address}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save device.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Log Out",
          onPress: () => {
            AsyncStorage.clear();
            router.replace('/');
          }
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Header */}
        <View style={styles.header}>
          <Image source={require('../images/GridAwareLogo.png')} style={styles.profileImage} />
        </View>

        {/* Profile Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Profile</Text>
          <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/update-first-name')}>
            <Text style={styles.optionText}>Update First Name</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/update-last-name')}>
            <Text style={styles.optionText}>Update Last Name</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/update-email')}>
            <Text style={styles.optionText}>Update Email</Text>
          </TouchableOpacity>
        </View>

        {/* Button to fetch the list of registered devices */}
        <TouchableOpacity style={styles.optionButton} onPress={fetchDevices}>
          <Text style={styles.optionText}>Get Registered Devices</Text>
        </TouchableOpacity>

        {/* Display the list of devices and allow selection */}
        <FlatList
          data={devices}
          keyExtractor={(item) => item.device_mac_address}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.deviceItem} onPress={() => selectDevice(item)}>
              <Text style={styles.deviceText}>
                Device MAC: {item.device_mac_address}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>No devices found.</Text>
            </View>
          )}
          contentContainerStyle={styles.flatListContent}
        />

        {/* If a device is selected, show a confirmation */}
        {selectedDevice && (
          <View style={styles.selectedDeviceContainer}>
            <Text style={styles.selectedDeviceText}>Selected Device: {selectedDevice}</Text>
          </View>
        )}

        {/* Logout Button - ensure it is visible */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FF6F3C',
    marginBottom: 15,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#1A1E3A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  flatListContent: {
    paddingBottom: 20, 
  },
  logoutButton: {
    backgroundColor: '#FF6F3C',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'stretch', 
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  deviceItem: {
    backgroundColor: '#1A1E3A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  deviceText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  emptyListContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyListText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectedDeviceContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  selectedDeviceText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});

export default Profile;
