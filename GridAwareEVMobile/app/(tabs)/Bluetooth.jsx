// app/tabs/Bluetooth.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Bluetooth = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bluetooth Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0E27',
  },
  text: {
    color: 'white',
    fontSize: 18,
  },
});

export default Bluetooth;
