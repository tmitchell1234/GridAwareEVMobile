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
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [userFullName, setUserFullName] = useState('User');
  const [isLoading, setIsLoading] = useState(true); 


  // Fetch user's full name from AsyncStorage
  const fetchUserFullName = async () => {
    const firstName = await AsyncStorage.getItem('userFirstName') || 'User';
    const lastName = await AsyncStorage.getItem('userLastName') || '';
    setUserFullName(`${firstName} ${lastName}`);
  };

   // Fetch devices and user name on component mount
   useEffect(() => {
    fetchUserFullName();
    fetchDevices();
  }, []);

  // Fetch user JWT token
  const fetchUserJwt = async () => {
    try {
      const token = await AsyncStorage.getItem('userJwt');
      if (token) return token;
      Alert.alert('Error', 'You need to log in first.');
    } catch (error) {
      console.error('Failed to fetch JWT:', error);
    }
  };

  // Function to fetch devices for the user
  const fetchDevices = async () => {
    try {
      const user_jwt = await fetchUserJwt();
      const response = await axios.post('https://gridawarecharging.com/api/get_devices_for_user', {
        api_key: API_KEY,
        user_jwt,
      });
      setDevices(response.data);
    } catch (error) {
      handleError(error, 'Failed to fetch devices');
    }
  };

  // Function to handle errors
  const handleError = (error, message) => {
    const errorMessage = error.response?.data || 'An error occurred';
    Alert.alert('Error', `${message}: ${errorMessage}`);
  };

  // Function to update first name
  const updateFirstName = async () => {
    try {
      const user_jwt = await fetchUserJwt();
      const response = await axios.post('https://gridawarecharging.com/api/update_user_first_name', {
        api_key: API_KEY,
        user_jwt,
        new_name: firstNameInput
      });
      await AsyncStorage.setItem('userJwt', response.data.token);
      Alert.alert('Success', 'First name updated successfully');
    } catch (error) {
      handleError(error, 'Failed to update first name');
    }
  };

  // Function to update last name
  const updateLastName = async () => {
    try {
      const user_jwt = await fetchUserJwt();
      const response = await axios.post('https://gridawarecharging.com/api/update_user_last_name', {
        api_key: API_KEY,
        user_jwt,
        new_name: lastNameInput
      });
      await AsyncStorage.setItem('userJwt', response.data.token);
      Alert.alert('Success', 'Last name updated successfully');
    } catch (error) {
      handleError(error, 'Failed to update last name');
    }
  };

  // Select a device and store its MAC address
  const selectDevice = async (device) => {
    try {
      await AsyncStorage.setItem('selectedDeviceMac', device.device_mac_address);
      setSelectedDevice(device.device_mac_address);
      Alert.alert('Device Selected', `Selected device: ${device.device_mac_address}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save device.');
    }
  };

  // Function to unregister a device
  const unregisterDevice = async () => {
    try {
      const user_jwt = await fetchUserJwt();
      const deviceMac = await AsyncStorage.getItem('selectedDeviceMac');
      await axios.post('https://gridawarecharging.com/api/unregister_device_by_user', {
        api_key: API_KEY,
        user_jwt,
        device_mac_address: deviceMac,
      });
      Alert.alert('Success', 'Device unregistered successfully');
      setSelectedDevice(null);
      fetchDevices();
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
        {
          text: "Delete",
          onPress: async () => {
            try {
              const user_jwt = await fetchUserJwt();
              await axios.post('https://gridawarecharging.com/api/delete_user_account', {
                api_key: API_KEY,
                user_jwt,
              });
              Alert.alert('Success', 'Account deleted successfully');
              AsyncStorage.clear();
              router.replace('/');
            } catch (error) {
              handleError(error, 'Failed to delete account');
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
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

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image source={require('../images/GridAwareLogo.png')} style={styles.profileImage} />
          <Text style={styles.userNameText}>{userFullName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Profile</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter New First Name"
            placeholderTextColor="#888"
            value={firstNameInput}
            onChangeText={setFirstNameInput}
          />
          <TouchableOpacity style={styles.saveButton} onPress={updateFirstName}>
            <Text style={styles.saveButtonText}>Update First Name</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Enter New Last Name"
            placeholderTextColor="#888"
            value={lastNameInput}
            onChangeText={setLastNameInput}
          />
          <TouchableOpacity style={styles.saveButton} onPress={updateLastName}>
            <Text style={styles.saveButtonText}>Update Last Name</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.optionButton} onPress={fetchDevices}>
          <Text style={styles.optionText}>Get Registered Devices</Text>
        </TouchableOpacity>

        <FlatList
          data={devices}
          keyExtractor={(item) => item.device_mac_address}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.deviceItem} onPress={() => selectDevice(item)}>
              <Text style={styles.deviceText}>Device MAC: {item.device_mac_address}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => <Text style={styles.emptyListText}>No devices found.</Text>}
          contentContainerStyle={styles.flatListContent}
        />

        {selectedDevice && (
          <View style={styles.selectedDeviceContainer}>
            <Text style={styles.selectedDeviceText}>Selected Device: {selectedDevice}</Text>
            <TouchableOpacity style={styles.unregisterButton} onPress={unregisterDevice}>
              <Text style={styles.unregisterButtonText}>Unregister Device</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.deleteButton} onPress={deleteUserAccount}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>

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
    marginBottom: 25,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
    borderColor: '#FF6F3C',
    borderWidth: 2,
  },
  userNameText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    marginVertical: 8,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#1A1E3A',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FF6F3C',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#333A4D',
    color: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
    borderColor: '#4D9FF9',
    borderWidth: 1,
  },
  saveButton: {
    backgroundColor: '#FF6F3C',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
    backgroundColor: '#232A45',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderColor: '#FF6F3C',
    borderWidth: 1,
  },
  deviceText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  emptyListText: {
    color: '#BBB',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  selectedDeviceContainer: {
    backgroundColor: '#1A1E3A',
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  selectedDeviceText: {
    color: '#FF6F3C',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  unregisterButton: {
    backgroundColor: '#FF6F3C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  unregisterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#B22222',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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