import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const GridStatus = () => {
    return (
        <SafeAreaView style = {styles.container}>
            <View style = {styles.header}>
                <Image source = {require('../images/GridAwareLogo.png')} style={styles.logo} />
                <Text style = {styles.headerText}>Grid Status</Text>
            </View>

            <View style = {styles.buttonContainer}>
                <LinearGradient colors = {['#FF6F3C', '#4E64FF']} style = {styles.gradientButton}>
                    <TouchableOpacity style = {styles.sectionButton}>
                        <Text style = {styles.buttonText}>Current Grid Status</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </SafeAreaView>
    );
};

//Style Process Below- For Now just keeping all in one location to make it easier for me. 
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
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    gradientButton: {
      borderRadius: 20,
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

export default GridStatus;
