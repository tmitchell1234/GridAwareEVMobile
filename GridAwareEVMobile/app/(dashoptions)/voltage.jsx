import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, Dimensions } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const VoltageGraph = () => {
  const [latestVoltage, setLatestVoltage] = useState(null);
  const [chartData, setChartData] = useState([3]); 
  const [labels, setLabels] = useState(["0"]);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);

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

  const fetchVoltageData = async () => {
    try {
      const deviceMac = await AsyncStorage.getItem('selectedDeviceMac');
      const userJwt = await AsyncStorage.getItem('userJwt');

      if (!deviceMac || !userJwt) {
        Alert.alert('Error', 'Device MAC or user token missing. Please go to Profile and select your device.');
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

      console.log("Fetching voltage data...");
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
      const sanitizedVoltage = parseFloat(latestData.voltage).toFixed(2);
      console.log("Latest Voltage:", sanitizedVoltage);

      setLatestVoltage(sanitizedVoltage);
      updateChartData(sanitizedVoltage);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching voltage data:', error);
    }
  };

  const updateChartData = (newVoltage) => {
    setChartData((prevData) => {
      const updatedData = [...prevData, parseFloat(newVoltage)];
      if (updatedData.length > 20) {
        updatedData.shift();
      }
      return updatedData;
    });

    setLabels((prevLabels) => {
      const nextTime = (parseInt(prevLabels[prevLabels.length - 1], 10) + 1).toString();
      const updatedLabels = [...prevLabels, nextTime];
      if (updatedLabels.length > 20) {
        updatedLabels.shift();
      }
      return updatedLabels;
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      intervalRef.current = setInterval(fetchVoltageData, 1000);

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
          <ActivityIndicator size="large" color="#FF6F3C" />
          <Text style={styles.loadingText}>Fetching Voltage Data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Live Voltage Data</Text>
      </View>

      <View style={styles.voltageContainer}>
        <Text style={styles.voltageText}>
          Latest Voltage: <Text style={styles.voltageValue}>{latestVoltage ? `${latestVoltage} V` : 'No data'}</Text>
        </Text>
      </View>

      <View style={styles.swipeHintContainer}>
        <Text style={styles.swipeHintText}>Swipe left or right to view more data</Text>
      </View>

      <View style={styles.unitExplanation}>
        <Text style={styles.unitExplanationText}>Note: V stands for Voltage, s stands for seconds.</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: labels,
              datasets: [
                {
                  data: chartData,
                },
              ],
            }}
            width={Dimensions.get("window").width * 1.5}
            height={Dimensions.get("window").height * 0.45}
            yAxisSuffix=" V"
            yAxisInterval={1}
            chartConfig={{
              backgroundGradientFrom: "#1a1e3a",
              backgroundGradientTo: "#2c2f46",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(130, 170, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              fillShadowGradient: "#4D9FF9",
              fillShadowGradientOpacity: 1,
              propsForBackgroundLines: {
                stroke: "rgba(255, 255, 255, 0.2)",
              },
            }}
            fromZero
            yAxisMin={0}  
            yAxisMax={6}  
            style={{
              marginVertical: 20,
              borderRadius: 16,
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27', padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  headerText: { color: '#FF6F3C', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFF', fontSize: 18, marginTop: 10 },
  voltageContainer: { alignItems: 'center', marginBottom: 10 },
  voltageText: { color: '#FFFFFF', fontSize: 20, fontWeight: '600' },
  voltageValue: { color: '#4D9FF9', fontWeight: 'bold' },
  chartContainer: { paddingHorizontal: 10 },
  swipeHintContainer: {
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  swipeHintText: {
    color: '#4D9FF9',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  unitExplanation: {
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  unitExplanationText: {
    color: '#E1E4E8',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default VoltageGraph;
