import React, { useState, useEffect } from "react"; 
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Alert } from 'react-native';
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

  const [isPaused, setIsPaused] = useState(false); // Track whether the graph is paused
  const [selectedPoint, setSelectedPoint] = useState(null); // Store selected data point details

  // Function to simulate frequency adjustment around 60 Hz
  const simulateFrequency = () => {
    if (!isPaused) {
      setChartData((prevState) => {
        const lastDataPoint = prevState.datasets[0].data[prevState.datasets[0].data.length - 1];
        const newDataPoint = lastDataPoint + (Math.random() * 2 - 1); // Simulate slight fluctuation

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
    }
  };

  // UseEffect to simulate fetching or updating data every second
  useEffect(() => {
    const intervalId = setInterval(simulateFrequency, 1000); // Update every second
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [isPaused]);

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

  const handleDataPointClick = (data) => {
    const { index } = data;
    const clickedPoint = chartData.datasets[0].data[index];
    const selectedTime = chartData.labels[index];

    setIsPaused(true); // Pause the graph
    setSelectedPoint({ time: selectedTime, frequency: clickedPoint.toFixed(2) });
  };

  const resetGraph = () => {
    setSelectedPoint(null); // Clear selected data point
    setIsPaused(false); // Resume the graph
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../images/GridAwareLogo.png')} style={styles.logo} />
        <Text style={styles.headerText}>Frequency Graph</Text>
      </View>

      {/* Display most recent measurement or selected point */}
      {selectedPoint ? (
        <View style={styles.selectedPointContainer}>
          <Text style={styles.selectedText}>Selected Point:</Text>
          <Text style={styles.selectedText}>Time: {selectedPoint.time}</Text>
          <Text style={styles.selectedText}>Frequency: {selectedPoint.frequency} Hz</Text>
        </View>
      ) : (
        <View style={styles.recentMeasurementContainer}>
          <Text style={styles.recentText}>Most Recent Frequency: {chartData.datasets[0].data[chartData.datasets[0].data.length - 1].toFixed(2)} Hz</Text>
        </View>
      )}

      {/* Line Chart displaying dynamic data */}
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 40}
        height={220}
        yAxisLabel=""
        yAxisSuffix=" Hz"
        chartConfig={chartConfig}
        bezier
        style={{
          marginVertical: 20,
          borderRadius: 16,
        }}
        onDataPointClick={handleDataPointClick} // Handle click event to pause and show point details
      />

      {/* Buttons for resuming or resetting the graph */}
      <View style={styles.buttonContainer}>
        {selectedPoint ? (
          <>
            <LinearGradient colors={['#FF6F3C', '#4E64FF']} style={styles.gradientButton}>
              <TouchableOpacity style={styles.sectionButton} onPress={resetGraph}>
                <Text style={styles.buttonText}>Resume Graph</Text>
              </TouchableOpacity>
            </LinearGradient>

            <LinearGradient colors={['#4E64FF', '#FF6F3C']} style={styles.gradientButton}>
              <TouchableOpacity style={styles.sectionButton} onPress={() => setChartData({
                labels: Array.from({ length: 10 }, (_, i) => `${i}s`),
                datasets: [{ data: Array(10).fill(60), strokeWidth: 2 }],
              })}>
                <Text style={styles.buttonText}>Reset Graph</Text>
              </TouchableOpacity>
            </LinearGradient>
          </>
        ) : null}
      </View>
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
  recentMeasurementContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  recentText: {
    color: '#FFF',
    fontSize: 16,
  },
  selectedPointContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  gradientButton: {
    borderRadius: 20,
    marginBottom: 10,
    width: '80%',
  },
  sectionButton: {
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FrequencyGraph;
