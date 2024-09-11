import React, { useState } from "react";
import { useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Animated } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Import axios

const LogIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logoAnimation] = useState(new Animated.Value(0)); // Animation state for the logo

  // Access the API_KEY from app.json
  const API_KEY = Constants.expoConfig.extra.API_KEY;

  // Function to animate the logo
  const animateLogo = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(logoAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Start the animation when the component mounts
  React.useEffect(() => {
    animateLogo();
  }, []);

  const handleLogin = async () => {
    try {
      // Log the API request details
      console.log('API Key:', API_KEY); // Log the API key to verify it
      console.log('Sending login request with:', { email, password });

      // Make the POST request using axios
      const response = await axios.post('http://gridawarecharging.com/api/user_login', {
        api_key: API_KEY,
        user_email: email,
        user_password: password
      });

      // Handle successful login
      console.log('Response Data:', response.data);

      if (response.status === 200) {
        const userJwt = response.data.token;  // Extract JWT from response
        const userEmail = response.data.email || '';
        await AsyncStorage.setItem('userJwt', userJwt);  // Store JWT in AsyncStorage
        await AsyncStorage.setItem('email', userEmail);

        router.push('(tabs)/Dashboard'); // Navigate to dashboard on success
      } else {
        Alert.alert('Login Failed', response.data.message || 'Invalid email or password');
      }
    } catch (error) {
      // Detailed error handling with axios
      if (error.response) {
        // Server responded with a status other than 2xx
        console.error('Login error (response):', error.response.data);
        Alert.alert('Login Failed', error.response.data.message || 'Something went wrong. Please try again.');
      } else if (error.request) {
        // Request was made but no response was received
        console.error('Login error (request):', error.request);
        Alert.alert('Error', 'No response from server. Please check your connection.');
      } else {
        // Something else happened while making the request
        console.error('Login error:', error.message);
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.2]
      }) }] }]}>
        <Image source={require('../images/GridAwareLogo.png')} style={styles.logo} />
      </Animated.View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#B0B0B0"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#B0B0B0"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

//Style Process Below - For Now just keeping all in one location to make it easier for me. 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0E27',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  input: {
    backgroundColor: '#1A1E3A',
    color: '#FFFFFF',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderColor: '#4D9FF9',
    borderWidth: 1,
  },
  loginButton: {
    backgroundColor: '#4D9FF9',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LogIn;
