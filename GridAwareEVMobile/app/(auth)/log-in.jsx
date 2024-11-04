import React, { useState } from "react";
import { useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Animated, Easing } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Import axios

const LogIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logoAnimation] = useState(new Animated.Value(0)); // Animation state for the logo
  const [showPassword, setShowPassword] = useState(false); // Toggle for showing/hiding password

  // Access the API_KEY from app.json
  const API_KEY = Constants.expoConfig.extra.API_KEY;

  // Function to animate the logo
  const animateLogo = () => {
    Animated.loop(
      Animated.timing(logoAnimation, {
        toValue: 1,
        duration: 3500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  };

  // Start the animation when the component mounts
  React.useEffect(() => {
    animateLogo();
  }, []);

  // Function to fetch user info after login
  const fetchUserInfo = async (userJwt) => {
    try {
      const response = await axios.post('https://gridawarecharging.com/api/get_user_info', {
        api_key: API_KEY,
        user_jwt: userJwt
      });

      const userInfo = response.data;
      console.log('User Info:', userInfo);

      // Store user information in AsyncStorage
      await AsyncStorage.setItem('userFirstName', userInfo.user_first_name || '');
      await AsyncStorage.setItem('userLastName', userInfo.user_last_name || '');
      await AsyncStorage.setItem('userEmail', userInfo.user_email || '');

      // Log user information
      console.log("Stored First Name:", userInfo.user_first_name);
      console.log("Stored Last Name:", userInfo.user_last_name);
      console.log("Stored Email:", userInfo.user_email);

    } catch (error) {
      console.error('Error fetching user info:', error);
      Alert.alert('Error', 'Unable to fetch user information.');
    }
  };

  const handleLogin = async () => {
    try {
      console.log('API Key:', API_KEY); // Log the API key to verify it
      console.log('Sending login request with:', { email, password });

      // Make the POST request using axios
      const response = await axios.post('https://gridawarecharging.com/api/user_login', {
        api_key: API_KEY,
        user_email: email,
        user_password: password
      });

      // Handle successful login
      console.log('Response Data:', response.data);

      if (response.status === 200) {
        const userJwt = response.data.token;  // Get JWT from response
        await AsyncStorage.setItem('userJwt', userJwt);  // Store JWT in AsyncStorage

        // Call the function to fetch and store user info
        fetchUserInfo(userJwt);

        // Navigate to dashboard on success
        router.replace('(tabs)/Dashboard');
      } else {
        Alert.alert('Login Failed', response.data.message || 'Invalid email or password');
      }
    } catch (error) {
      // Detailed error handling with axios
      if (error.response) {
        console.error('Login error (response):', error.response.data);
        Alert.alert('Login Failed', error.response.data.message || 'Something went wrong. Please try again.');
      } else if (error.request) {
        console.error('Login error (request):', error.request);
        Alert.alert('Error', 'No response from server. Please check your connection.');
      } else {
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
        outputRange: [1, 1.1]
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
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#B0B0B0"
          secureTextEntry={!showPassword} // Toggle secureTextEntry based on showPassword state
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.showHideButton}
        >
          <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

// Style definitions
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
    shadowColor: '#4D9FF9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  loginButton: {
    backgroundColor: '#4D9FF9',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    alignItems: 'center',
    shadowColor: '#6FA9FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  showHideButton: {
    position: 'absolute',
    right: 10,
  },
  showHideText: {
    color: '#4D9FF9',
    fontWeight: 'bold',
  },
});

export default LogIn;
