import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from 'react';

export default function Index() {
  const router = useRouter();
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start the pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnimation]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
        <Image source={require('./images/GridAwareLogo.png')} style={styles.logo} />
      </Animated.View>
      
      <Text style={styles.title}>Welcome to Grid-Aware EV Charging</Text>
      
      <TouchableOpacity style={styles.loginButton} onPress={() => router.push("(auth)/log-in")}>
        <Text style={styles.loginButtonText}>Log Into Account</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.signupButton} onPress={() => router.push("(auth)/register")}>
        <Text style={styles.signupButtonText}>Create New Account</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.forgotTextContainer} onPress={() => router.push("/(auth)/forgot")}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>
      
      <View style={styles.aboutUsContainer}>
        <Text style={styles.aboutUsText}>About Us</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0E27",  // Dark background for a clean contrast
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  title: {
    color: "white",
    fontSize: 28,  // Slightly larger for better readability
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    letterSpacing: 1.2,
  },
  loginButton: {
    backgroundColor: "#4D9FF9",
    padding: 18,  // Slightly larger for a more immersive touch
    borderRadius: 30,
    marginBottom: 15,
    width: "80%",
    alignItems: "center",
    shadowColor: "#4D9FF9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    borderWidth: 1,  // Subtle border
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1.1,
  },
  signupButton: {
    backgroundColor: "#FF6F3C",
    padding: 18,
    borderRadius: 30,
    marginBottom: 15,
    width: "80%",
    alignItems: "center",
    shadowColor: "#FF6F3C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  signupButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1.1,
  },
  forgotTextContainer: {
    marginTop: 20,
  },
  forgotText: {
    color: "#B0B0B0",
    fontSize: 16,
    textDecorationLine: 'underline',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  aboutUsContainer: {
    position: "absolute",
    bottom: 30,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  aboutUsText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: 'underline',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
});
