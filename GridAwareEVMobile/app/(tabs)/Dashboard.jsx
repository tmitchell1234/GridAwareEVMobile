import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const Dashboard = () => {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);

  // Check if user has a registered device via the API
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

      // Check if any devices are registered
      if (response.data && response.data.length > 0) {
        setIsRegistered(true);
      } else {
        setIsRegistered(false);
      }
    } catch (error) {
      console.error('Error checking device registration:', error);
      Alert.alert('Error', 'Unable to check device registration. Please try again later.');
    }
  };

  useEffect(() => {
    checkDeviceRegistration();
  }, []);

  const [chartData, setChartData] = useState({
    labels: Array.from({ length: 10 }, (_, i) => i.toString()),
    datasets: [
      {
        data: Array(10).fill(60),
        strokeWidth: 2,
      },
    ],
  });

  const simulateFrequency = () => {
    setChartData((prevState) => {
      const lastDataPoint = prevState.datasets[0].data[prevState.datasets[0].data.length - 1];
      const newDataPoint = lastDataPoint + (Math.random() * 2 - 1);
      const adjustedDataPoint = newDataPoint > 60 ? newDataPoint - 0.5 : newDataPoint + 0.5;

      return {
        ...prevState,
        datasets: [
          {
            data: [...prevState.datasets[0].data.slice(1), adjustedDataPoint],
            strokeWidth: 2,
          },
        ],
      };
    });
  };

  useEffect(() => {
    const interval = setInterval(simulateFrequency, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../images/GridAwareLogo.png')} style={styles.logo} />
        <Text style={styles.headerText}>Dashboard</Text>
      </View>

      {isRegistered ? (
        <>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            yAxisSuffix=" Hz"
            chartConfig={{
              backgroundColor: "#022173",
              backgroundGradientFrom: "#1c3faa",
              backgroundGradientTo: "#226bdf",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffa726",
              },
            }}
            bezier
            style={{
              marginVertical: 20,
              borderRadius: 16,
            }}
          />

          <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            <TouchableOpacity 
              style={styles.sectionButton} 
              onPress={() => router.push('(dashoptions)/frequencygraph')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Frequency</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.sectionButton} 
              onPress={() => router.push('(dashoptions)/current')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Current</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.sectionButton} 
              onPress={() => router.push('(dashoptions)/voltage')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Voltage</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.sectionButton} 
              onPress={() => router.push('(dashoptions)/ischarging')}
              activeOpacity={0.8}
            >
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
          <TouchableOpacity
            style={styles.connectButton}
            onPress={() => router.push('/Bluetooth')}
          >
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
    marginTop: 20,
  },
  scrollContent: {
    paddingBottom: 20, 
  },
  sectionButton: {
    backgroundColor: '#FF6F3C',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  promptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  promptDescription: {
    color: '#BBB',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  connectButton: {
    backgroundColor: '#1A1E3A',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  connectButtonText: {
    color: '#FF6F3C',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Dashboard;
