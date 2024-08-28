import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const Dashboard = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../images/GridAwareLogo.webp')} style={styles.logo} />
        <Text style={styles.headerText}>Dashboard</Text>
      </View>

      {/* This Line Chart displays fake data, testing out graphing*/}
      <LineChart
        data={{
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              data: [20, 45, 28, 80, 99, 43],
              strokeWidth: 2,
            },
            {
              data: [30, 50, 40, 95, 85, 50],
              strokeWidth: 2,
            },
            {
              data: [10, 40, 20, 60, 90, 30],
              strokeWidth: 2,
            }
          ],
        }}
        width={Dimensions.get('window').width - 40} // this comes from react native 
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
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


      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.sectionButton} onPress={() => router.push('(dashoptions)/graphsec')}>
          <Text style={styles.buttonText}>Graph Sections</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sectionButton} onPress={() => router.push('(dashoptions)/statusspeed')}>
          <Text style={styles.buttonText}>Status & Speed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sectionButton} onPress={() => router.push('(dashoptions)/timedisplay')}>
          <Text style={styles.buttonText}>Time Displays</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sectionButton} onPress={() => router.push('(dashoptions)/gridstatus')}>
          <Text style={styles.buttonText}>Grid Status</Text>
        </TouchableOpacity>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 20, // creates the distance between the chart and buttons 
  },
  sectionButton: {
    backgroundColor: '#FF6F3C',
    padding: 15,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Dashboard;
