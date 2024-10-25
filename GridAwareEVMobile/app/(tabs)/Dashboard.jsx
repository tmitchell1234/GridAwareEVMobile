import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const Dashboard = () => {
  const router = useRouter();

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

  // Use an interval to update the graph every second
  useEffect(() => {
    const interval = setInterval(simulateFrequency, 1000); // Update every second
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../images/GridAwareLogo.png')} style={styles.logo} />
        <Text style={styles.headerText}>Dashboard</Text>
      </View>

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
          onPress={() => router.push('(dashoptions)/ischarging')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Charge Status</Text>
        </TouchableOpacity>
      </ScrollView>
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
});

export default Dashboard;
