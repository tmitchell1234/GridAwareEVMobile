import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Dashboard = () => {
  const router = useRouter();
  const [isDeviceRegistered, setIsDeviceRegistered] = useState(false); // Check if the user has a device

  // State for chart data
  const [chartData, setChartData] = useState({
    labels: Array.from({ length: 10 }, (_, i) => i.toString()), // Just numbering the X-axis
    datasets: [
      {
        data: Array(10).fill(60), // Initial data of 60 Hz for 10 points
        strokeWidth: 2,
      },
    ],
  });

  // Function to simulate frequency adjustment back to 60 Hz
  const simulateFrequency = () => {
    setChartData((prevState) => {
      const lastDataPoint = prevState.datasets[0].data[prevState.datasets[0].data.length - 1];
      const newDataPoint = lastDataPoint + (Math.random() * 2 - 1); // Simulate slight fluctuation

      // Bring it back towards 60 Hz slowly
      const adjustedDataPoint = newDataPoint > 60 ? newDataPoint - 0.5 : newDataPoint + 0.5;

      return {
        ...prevState,
        datasets: [
          {
            data: [...prevState.datasets[0].data.slice(1), adjustedDataPoint], // Shift the data and add new point
            strokeWidth: 2,
          },
        ],
      };
    });
  };

  // Fetch whether the user has a device registered
  const checkDeviceRegistration = async () => {
    try {
      const deviceMac = await AsyncStorage.getItem('selectedDeviceMac');
      if (deviceMac) {
        setIsDeviceRegistered(true); // Device is registered
      } else {
        setIsDeviceRegistered(false); // No device registered
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to check device registration.');
    }
  };

  // Use an interval to update the graph every second
  useEffect(() => {
    checkDeviceRegistration();
    if (isDeviceRegistered) {
      const interval = setInterval(simulateFrequency, 1000); // Update every second
      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [isDeviceRegistered]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../images/GridAwareLogo.png')} style={styles.logo} />
        <Text style={styles.headerText}>Dashboard</Text>
      </View>

      {/* Conditional rendering based on device registration */}
      {isDeviceRegistered ? (
        <>
          {/* Line Chart displaying dynamic data */}
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 40} 
            height={220}
            yAxisLabel=""
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
              onPress={() => router.push('(dashoptions)/gridstatus')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Grid Status</Text>
            </TouchableOpacity>
          </ScrollView>
        </>
      ) : (
        <View style={styles.noDeviceContainer}>
          <Text style={styles.noDeviceText}>No device registered.</Text>
          <Text style={styles.noDeviceInstructions}>
            Please go to the Bluetooth tab to scan for and register your ESP32 device.
          </Text>

          <TouchableOpacity 
            style={styles.bluetoothButton} 
            onPress={() => router.push('(tabs)/Bluetooth')}
            activeOpacity={0.8}
          >
            <Text style={styles.bluetoothButtonText}>Go to Bluetooth</Text>
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
  noDeviceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDeviceText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noDeviceInstructions: {
    color: '#CCC',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  bluetoothButton: {
    backgroundColor: '#FF6F3C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  bluetoothButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Dashboard;
