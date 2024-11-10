import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from 'react';

export default function Index() {
  const router = useRouter();
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1500,
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
    backgroundColor: "#10142C",  
  },
  logo: {
    width: 160,  // Slightly larger for prominence
    height: 160,
    borderRadius: 80,
    marginBottom: 30,
    resizeMode: 'contain',
    borderWidth: 2,
    borderColor: '#2D80FB', // Subtle border for a polished look
  },
  title: {
    color: "#F2F2F2",
    fontSize: 28, // Slightly larger for attention
    fontWeight: "700",
    marginBottom: 35,
    textAlign: 'center',
    letterSpacing: 1.3,
    fontFamily: 'Roboto', // Modern and sleek font
  },
  loginButton: {
    backgroundColor: "#2D80FB",
    paddingVertical: 14,
    borderRadius: 22,
    marginBottom: 14,
    width: "80%", // Slightly wider for balance
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1.2,
    fontFamily: 'Roboto',
  },
  signupButton: {
    backgroundColor: "#FF6F3C",
    paddingVertical: 14,
    borderRadius: 22,
    marginBottom: 14,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1.2,
    fontFamily: 'Roboto',
  },
  forgotTextContainer: {
    marginTop: 18,
  },
  forgotText: {
    color: "#B0B0B0",
    fontSize: 15,
    textDecorationLine: 'underline',
    letterSpacing: 0.5,
    fontFamily: 'Roboto',
  },
  aboutUsContainer: {
    position: "absolute",
    bottom: 25,
    padding: 10,
    borderRadius: 10,
    borderColor: "#2D80FB",
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Subtle background for depth
  },
  aboutUsText: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "500",
    textDecorationLine: 'underline',
    letterSpacing: 0.8,
    fontFamily: 'Roboto',
  },
});

