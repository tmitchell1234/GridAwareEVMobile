import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Alert, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; 
import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const Profile = () => {
  const router = useRouter();
  const [devices, setDevices] = useState([]); 
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [firstNameInput, setFirstNameInput] = useState(''); // State for first name input
  const [lastNameInput, setLastNameInput] = useState('');  // State for last name input

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
      const user_jwt = await fetchUserJwt();

      if (!user_jwt) throw new Error('JWT token not found.');

      const response = await axios.post('https://gridawarecharging.com/api/get_devices_for_user', {
        api_key: API_KEY,
        user_jwt: user_jwt
      });

      setDevices(response.data);  
    } catch (error) {
      handleError(error, 'Failed to fetch devices');
    }
  };

  // Helper for error handling
  const handleError = (error, message) => {
    if (error.response) {
      Alert.alert('Error', `${message}: ${error.response.data || 'Unknown server error'}`);
    } else if (error.request) {
      Alert.alert('Error', 'No response from server. Please check your connection.');
    } else {
      Alert.alert('Error', error.message);
    }
  };

  // Function to update user's first name
  const updateFirstName = async () => {
    try {
      const user_jwt = await fetchUserJwt();
      const response = await axios.post('https://gridawarecharging.com/api/update_user_first_name', {
        api_key: API_KEY,
        user_jwt: user_jwt,
        new_name: firstNameInput
      });

      // Update JWT after name change
      await AsyncStorage.setItem('userJwt', response.data.token);
      Alert.alert('Success', 'First name updated successfully');
    } catch (error) {
      handleError(error, 'Failed to update first name');
    }
  };

  // Function to update user's last name
  const updateLastName = async () => {
    try {
      const user_jwt = await fetchUserJwt();
      const response = await axios.post('https://gridawarecharging.com/api/update_user_last_name', {
        api_key: API_KEY,
        user_jwt: user_jwt,
        new_name: lastNameInput
      });

      // Update JWT after name change
      await AsyncStorage.setItem('userJwt', response.data.token);
      Alert.alert('Success', 'Last name updated successfully');
    } catch (error) {
      handleError(error, 'Failed to update last name');
    }
  };

  // Function to unregister a device
  const unregisterDevice = async () => {
    try {
      const user_jwt = await fetchUserJwt();
      const deviceMac = await AsyncStorage.getItem('selectedDeviceMac');

      const response = await axios.post('https://gridawarecharging.com/api/unregister_device_by_user', {
        api_key: API_KEY,
        user_jwt: user_jwt,
        device_mac_address: deviceMac,
      });

      Alert.alert('Success', 'Device unregistered successfully');
    } catch (error) {
      handleError(error, 'Failed to unregister device');
    }
  };

  // Function to delete user account
  const deleteUserAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: async () => {
            try {
              const user_jwt = await fetchUserJwt();
              const response = await axios.post('https://gridawarecharging.com/api/delete_user_account', {
                api_key: API_KEY,
                user_jwt: user_jwt
              });
              
              Alert.alert('Success', 'Account deleted successfully');
              AsyncStorage.clear();
              router.replace('/');
            } catch (error) {
              handleError(error, 'Failed to delete account');
            }
        }},
      ],
      { cancelable: true }
    );
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

  // Function to handle logout
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
        <View style={styles.header}>
          <Image source={require('../images/GridAwareLogo.png')} style={styles.profileImage} />
        </View>

        {/* Profile Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Profile</Text>

          {/* First Name Input */}
          <TextInput
            style={styles.input}
            placeholder="Enter New First Name"
            placeholderTextColor="#999"
            value={firstNameInput}
            onChangeText={setFirstNameInput}
          />
          <TouchableOpacity style={styles.optionButton} onPress={updateFirstName}>
            <Text style={styles.optionText}>Update First Name</Text>
          </TouchableOpacity>

          {/* Last Name Input */}
          <TextInput
            style={styles.input}
            placeholder="Enter New Last Name"
            placeholderTextColor="#999"
            value={lastNameInput}
            onChangeText={setLastNameInput}
          />
          <TouchableOpacity style={styles.optionButton} onPress={updateLastName}>
            <Text style={styles.optionText}>Update Last Name</Text>
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

        {/* Unregister Device */}
        {selectedDevice && (
          <TouchableOpacity style={styles.optionButton} onPress={unregisterDevice}>
            <Text style={styles.optionText}>Unregister Selected Device</Text>
          </TouchableOpacity>
        )}

        {/* Delete Account */}
        <TouchableOpacity style={styles.optionButton} onPress={deleteUserAccount}>
          <Text style={styles.optionText}>Delete Account</Text>
        </TouchableOpacity>

        {/* Logout Button */}
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
  input: {
    backgroundColor: '#1A1E3A',
    color: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
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
});

export default Profile;