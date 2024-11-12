import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, StyleSheet, Dimensions, ActivityIndicator, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { PieChart } from 'react-native-chart-kit';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const ChargingGraph = () => {
  const [isChargingData, setIsChargingData] = useState({ trueCount: 0, falseCount: 0 }); 
  const [isLoading, setIsLoading] = useState(true); 

  // Fetch the charging data from the API
  const fetchChargingData = async () => {
    setIsLoading(true);
    try {
      const deviceMac = await AsyncStorage.getItem('selectedDeviceMac');
      const userJwt = await AsyncStorage.getItem('userJwt');

      if (!deviceMac || !userJwt) {
        Alert.alert('Error', 'Device MAC or user token missing.');
        setIsLoading(false);
        return;
      }

      const response = await axios.post('https://gridawarecharging.com/api/get_data_in_recent_time_interval', {
        api_key: API_KEY,
        user_jwt: userJwt,
        device_mac_address: deviceMac,
        time_seconds: 60, 
      });

      if (!Array.isArray(response.data)) {
        console.error("Unexpected response format:", response.data);
        setIsLoading(false);
        return;
      }

      console.log("Data successfully fetched:", response.data);
      processChargingData(response.data); // Process the charging data
    } catch (error) {
      console.error('Error fetching charging data:', error);
    }
    setIsLoading(false);
  };

  // Process the fetched charging data for the pie chart
  const processChargingData = (data) => {
    let trueCount = 0;
    let falseCount = 0;

    data.forEach((entry) => {
      if (entry.is_charging) {
        trueCount++;
      } else {
        falseCount++;
      }
    });

    // Update state with the counts for true and false
    setIsChargingData({ trueCount, falseCount });
  };

  // Fetch initial data after component mounts
  useEffect(() => {
    fetchChargingData();
  }, []);

  // Calculate percentages for charging and not charging
  const totalCount = isChargingData.trueCount + isChargingData.falseCount;
  const chargingPercentage = ((isChargingData.trueCount / totalCount) * 100).toFixed(1);
  const notChargingPercentage = ((isChargingData.falseCount / totalCount) * 100).toFixed(1);

  const chartData = [
    {
      name: `Charging (${chargingPercentage}%)`,
      value: isChargingData.trueCount,
      color: "#00FF7F", // Green for charging
      legendFontColor: "#FFF",
      legendFontSize: 16,
    },
    {
      name: `Not Charging (${notChargingPercentage}%)`,
      value: isChargingData.falseCount,
      color: "#FF6F3C", // Red-orange for not charging
      legendFontColor: "#FFF",
      legendFontSize: 16,
    },
  ];

  const screenWidth = Dimensions.get("window").width * 0.9;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BFFF" />
          <Text style={styles.loadingText}>Fetching Charging Data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Charging Status Overview</Text>
      </View>

      <PieChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: "#0A0E27",
          backgroundGradientFrom: "#1A2331",
          backgroundGradientTo: "#3A4C73",
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          propsForLabels: { fontSize: 15, fontWeight: 'bold' },
        }}
        accessor="value"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute 
        hasLegend={true}
        style={{
          marginVertical: 20,
          borderRadius: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      />

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Charging Instances: <Text style={styles.summaryValue}>{isChargingData.trueCount}</Text></Text>
        <Text style={styles.summaryText}>Not Charging Instances: <Text style={styles.summaryValue}>{isChargingData.falseCount}</Text></Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    color: '#00BFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#F3F3F3',
    fontSize: 18,
    marginTop: 10,
  },
  summaryContainer: {
    marginTop: 25,
    padding: 18,
    backgroundColor: '#1A2331',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  summaryText: {
    fontSize: 17,
    color: '#E0E4EA',
    marginVertical: 3,
    textAlign: 'center',
  },
  summaryValue: {
    fontWeight: '700',
    color: '#00BFFF',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  pieChartStyle: {
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    padding: 10,
  },
});

export default ChargingGraph;
