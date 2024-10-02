import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';

const FrequencyGraph = () => {
  const [chartData, setChartData] = useState({
    labels: Array.from({ length: 10 }, (_, i) => `${i}s`), // Labels representing seconds
    datasets: [
      {
        data: Array(10).fill(60), // Initial data of 60 Hz for 10 points
        strokeWidth: 2,
      },
    ],
  });

  // Function to simulate frequency adjustment around 60 Hz
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

  // Use an interval to update the chart every second
  useEffect(() => {
    const intervalId = setInterval(simulateFrequency, 1000); // Update every 1 second
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const chartConfig = {
    backgroundGradientFrom: '#0A0E27',
    backgroundGradientTo: '#0A0E27',
    decimalPlaces: 2, // Format the frequency to two decimal places
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Axis labels color
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#FF6F3C',
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Simulated Frequency Over Time</Text>
      </View>

      <View style={styles.graphContainer}>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 40} // Width of the chart
          height={220} // Height of the chart
          chartConfig={chartConfig}
          bezier // Make the line smooth
          style={styles.chartStyle}
          onDataPointClick={(data) => {
            const { index } = data;
            const clickedPoint = chartData.datasets[0].data[index];
            alert(`Time: ${chartData.labels[index]}, Frequency: ${clickedPoint.toFixed(2)} Hz`);
          }}
        />
      </View>

      {/* Manual Refresh button to reset the simulation */}
      <View style={styles.buttonContainer}>
        <LinearGradient colors={['#FF6F3C', '#4E64FF']} style={styles.gradientButton}>
          <TouchableOpacity style={styles.sectionButton} onPress={simulateFrequency}>
            <Text style={styles.buttonText}>Simulate Frequency</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

// Style Definitions
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
  },
  graphContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartStyle: {
    borderRadius: 16,
    marginVertical: 8,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  gradientButton: {
    borderRadius: 20,
    marginBottom: 15,
    width: '80%',
  },
  sectionButton: {
    padding: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FrequencyGraph;
