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
  
 // Function to animate the logo with smoother timing and easing
const animateLogo = () => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(logoAnimation, {
        toValue: 1.1,  // Slightly larger scale for a subtle pulse effect
        duration: 4000,  // Increased duration for slower, smoother effect
        easing: Easing.out(Easing.quad),  // Easing out for a smooth start
        useNativeDriver: true,
      }),
      Animated.timing(logoAnimation, {
        toValue: 1,  // Return to normal scale
        duration: 4000,  // Same duration for symmetry
        easing: Easing.in(Easing.quad),  // Easing in for a gentle end
        useNativeDriver: true,
      }),
    ])
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
    backgroundColor: '#0D1321',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    resizeMode: 'contain',
    borderWidth: 2,
    borderColor: '#2D80FB', // Subtle border for a polished look
    shadowColor: '#2D80FB', // Light blue shadow for glow effect
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  input: {
    backgroundColor: '#1A1E3A',
    color: '#E1E4E8',
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 18,
    borderColor: '#2D80FB',
    borderWidth: 1,
    shadowColor: '#FF6F3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
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
    color: '#6FA9FF',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#2D80FB',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#FF6F3C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});

export default LogIn;
