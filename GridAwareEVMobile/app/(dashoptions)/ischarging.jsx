import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';
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
      legendFontSize: 15,
    },
    {
      name: `Not Charging (${notChargingPercentage}%)`,
      value: isChargingData.falseCount,
      color: "#FF6F3C", // Red-orange for not charging
      legendFontColor: "#FFF",
      legendFontSize: 15,
    },
  ];

  const screenWidth = Dimensions.get("window").width;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6F3C" />
          <Text style={styles.loadingText}>Fetching Charging Data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Charging Status</Text>
      </View>

      <PieChart
        data={chartData}
        width={screenWidth - 40}
        height={280} // Increase the size of the chart
        chartConfig={{
          backgroundColor: "#022173",
          backgroundGradientFrom: "#1c3faa",
          backgroundGradientTo: "#226bdf",
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        accessor="value"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute // Display percentages inside pie chart
        hasLegend={true} // Show legend with updated percentages
      />
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
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 18,
    marginTop: 10,
  },
});

export default ChargingGraph;
