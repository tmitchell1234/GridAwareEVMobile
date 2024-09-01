import React, { useState } from "react";
import { useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Animated } from 'react-native';

const LogIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logoAnimation] = useState(new Animated.Value(0)); // Animation state for the logo

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
      const response = await fetch('http://gridawarecharging.com/api/user_login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: email,
          user_password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to the Dashboard page on successful login
        router.push('(tabs)/Dashboard');
      } else {
        // Display error message
        Alert.alert('Login Failed', data.message || 'Invalid email or password');
      }
    } catch (error) {
      // Handle network or other errors
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Login error:', error);
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
        <Image source={require('../images/GridAwareLogo.webp')} style={styles.logo} />
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
