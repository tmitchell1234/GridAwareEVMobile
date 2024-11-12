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
    width: 140,  // Slightly adjusted to keep it balanced
    height: 140,
    borderRadius: 70,
    marginBottom: 30,
    resizeMode: 'contain',
    borderWidth: 2,
    borderColor: '#2D80FB',
    shadowColor: '#2D80FB',  // Subtle blue shadow for emphasis
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    color: "#F2F2F2",
    fontSize: 26, // Reduced slightly for balance
    fontWeight: "700",
    marginBottom: 35,
    textAlign: 'center',
    letterSpacing: 1.3,
    fontFamily: 'Roboto',
    shadowColor: '#000',  // Adding a subtle text shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  loginButton: {
    backgroundColor: "#2D80FB",
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 14,
    width: "80%",
    alignItems: "center",
    shadowColor: "#FF6F3C",  // Fiery orange shadow for contrast
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
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
    borderRadius: 20,
    marginBottom: 14,
    width: "80%",
    alignItems: "center",
    shadowColor: "#2D80FB",  // Cool blue shadow for complementary effect
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  aboutUsContainer: {
    position: "absolute",
    bottom: 25,
    padding: 10,
    borderRadius: 10,
    borderColor: "#2D80FB",
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#2D80FB',  // Subtle blue shadow for soft emphasis
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
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

