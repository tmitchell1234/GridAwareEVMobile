import React, { useState, useRef } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator, Alert, Animated, Easing } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useFocusEffect } from '@react-navigation/native';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const BatteryStatus = () => {
  const [batteryPercentage, setBatteryPercentage] = useState(null);
  const [isCharging, setIsCharging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);
  const batteryAnimation = useRef(new Animated.Value(0)).current;

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

  const fetchBatteryData = async () => {
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
      console.log("Battery Data:", latestData); // Debug logging for incoming data

      const roundedBatteryPercentage = Math.round(latestData.battery_percentage);
      setBatteryPercentage(roundedBatteryPercentage);
      setIsCharging(latestData.is_charging);
      setIsLoading(false);

      // Trigger animation
      Animated.timing(batteryAnimation, {
        toValue: roundedBatteryPercentage,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } catch (error) {
      console.error('Error fetching battery data:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      intervalRef.current = setInterval(fetchBatteryData, 1000);

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
          <ActivityIndicator size="large" color="#4D9FF9" />
          <Text style={styles.loadingText}>Fetching Battery Data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const batteryColor = batteryPercentage > 20 ? '#32CD32' : '#FF6F3C';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.batteryContainer}>
        <View style={styles.batteryBody}>
          <Animated.View
            style={[
              styles.batteryFill,
              {
                height: batteryAnimation.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: batteryColor,
              },
            ]}
          />
        </View>
        <Text style={styles.batteryPercentageText}>{batteryPercentage}%</Text>
        {isCharging && (
          <Text style={styles.chargingText}>
            Charging...
            <Animated.Text style={styles.chargingAnimation}>⚡</Animated.Text>
          </Text>
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 18,
    marginTop: 10,
  },
  batteryContainer: {
    alignItems: 'center',
  },
  batteryBody: {
    width: 120,
    height: 250,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1E3A',
    marginBottom: 20,
    position: 'relative',
  },
  batteryFill: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  batteryPercentageText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  chargingText: {
    color: '#32CD32',
    fontSize: 20,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chargingAnimation: {
    marginLeft: 5,
    fontSize: 24,
    color: '#FFD700',
  },
});

export default BatteryStatus;
