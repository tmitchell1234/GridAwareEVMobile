import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const Notifications = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [dates, setDates] = useState([]);

  // Generate the last 7 days as selectable dates
  useEffect(() => {
    const today = new Date();
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]); // Format as "YYYY-MM-DD"
    }
    setDates(last7Days);
  }, []);

  // Fetch report data for a specific date
  const fetchReportData = async (dateString) => {
    try {
      const userJwt = await AsyncStorage.getItem('userJwt');
      const deviceMac = await AsyncStorage.getItem('selectedDeviceMac');

      if (!userJwt || !deviceMac) {
        Alert.alert('Error', 'Device MAC not found. Please go to Profile and select a device.');
        return;
      }

      const response = await axios.post('https://gridawarecharging.com/api/get_data_report_for_day', {
        api_key: API_KEY,
        user_jwt: userJwt,
        device_mac_address: deviceMac,
        date_string: dateString,
      });

      if (response.data.length > 0) {
        const averageData = calculateAverages(response.data);
        setReportData({ date: dateString, ...averageData });
      } else {
        Alert.alert('No Data', `No data available for ${dateString}.`);
        setReportData(null);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      Alert.alert('Error', 'Failed to fetch report data. Please try again later.');
    }
  };

  // Calculate averages for frequency, voltage, current, and charging status
  const calculateAverages = (data) => {
    const frequencySum = data.reduce((sum, item) => sum + (item.frequency || 0), 0);
    const voltageSum = data.reduce((sum, item) => sum + (item.voltage || 0), 0);
    const currentSum = data.reduce((sum, item) => sum + (item.current || 0), 0);
    const chargingCount = data.filter(item => item.is_charging).length;
    const haltedCount = data.length - chargingCount; // Count of times it was not charging

    const averages = {
      averageFrequency: (frequencySum / data.length).toFixed(2),
      averageVoltage: (voltageSum / data.length).toFixed(2),
      averageCurrent: (currentSum / data.length).toFixed(2),
      chargingStatus: `${((chargingCount / data.length) * 100).toFixed(0)}%`,
      haltedCount, // Number of halted instances
    };

    return averages;
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <Text style={styles.headerText}>Select a Date to View Report</Text>

        {/* Display dates as selectable options */}
        <ScrollView contentContainerStyle={styles.scrollView} horizontal>
          {dates.map((date) => (
            <TouchableOpacity
              key={date}
              style={[styles.dateButton, selectedDate === date && styles.selectedDateButton]}
              onPress={() => {
                setSelectedDate(date);
                fetchReportData(date);
              }}
            >
              <Text style={styles.dateText}>{date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Display report data if available */}
        {reportData && (
          <View style={styles.reportContainer}>
            <Text style={styles.reportTitle}>Report for {reportData.date}</Text>
            <View style={styles.reportContent}>
              <Text style={styles.reportItem}>Average Frequency: <Text style={styles.reportValue}>{reportData.averageFrequency} Hz</Text></Text>
              <Text style={styles.reportItem}>Average Voltage: <Text style={styles.reportValue}>{reportData.averageVoltage} V</Text></Text>
              <Text style={styles.reportItem}>Average Current: <Text style={styles.reportValue}>{reportData.averageCurrent} A</Text></Text>
              <Text style={styles.reportItem}>Charging Status: <Text style={styles.reportValue}>{reportData.chargingStatus}</Text> of the time</Text>
              <Text style={styles.reportItem}>Times Halted: <Text style={styles.reportValue}>{reportData.haltedCount}</Text> times</Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6F3C',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    paddingBottom: 20,
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  dateButton: {
    backgroundColor: '#3C415C',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedDateButton: {
    backgroundColor: '#FF6F3C',
  },
  dateText: {
    fontSize: 16,
    color: 'white',
  },
  reportContainer: {
    backgroundColor: '#1A1E3A',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6F3C',
    marginBottom: 15,
    textAlign: 'center',
  },
  reportContent: {
    borderTopWidth: 1,
    borderTopColor: '#2C314B',
    paddingTop: 10,
  },
  reportItem: {
    fontSize: 16,
    color: '#F3F3F3',
    marginVertical: 5,
    flexDirection: 'row',
  },
  reportValue: {
    fontWeight: 'bold',
    color: '#FF6F3C',
  },
});

export default Notifications;
