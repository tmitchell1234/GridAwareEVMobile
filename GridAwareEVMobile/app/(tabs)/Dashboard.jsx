import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

const Dashboard = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../images/GridAwareLogo.webp')} style={styles.logo} />
        <Text style={styles.headerText}>Dashboard</Text>
      </View>

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
