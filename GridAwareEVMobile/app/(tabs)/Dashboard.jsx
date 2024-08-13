import React from "react";
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';

const Dashboard = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../images/GridAwareLogo.webp')} style={styles.logo} />
        <Text style={styles.headerText}>Dashboard</Text>
        <Text style={styles.welcomeText}>Welcome, To Grid Aware.</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.sectionButton}>
          <Text style={styles.buttonText}>Graph Sections</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sectionButton}>
          <Text style={styles.buttonText}>Status & Speed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sectionButton}>
          <Text style={styles.buttonText}>Time Displays</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sectionButton}>
          <Text style={styles.buttonText}>Grid Status</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
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