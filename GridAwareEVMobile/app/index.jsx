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
          toValue: 1.1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnimation]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
        <Image source={require('./images/GridAwareLogo.png')} style={styles.logo} />
      </Animated.View>
      <Text style={styles.title}>Welcome to Grid-Aware EV Charging</Text>
      <TouchableOpacity style={styles.loginButton} onPress={() => router.push("(auth)/log-in")}>
        <Text style={styles.loginButtonText}>Log into account</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signupButton} onPress={() => router.push("(auth)/register")}>
        <Text style={styles.signupButtonText}>Create new account</Text>
      </TouchableOpacity>
      <Text style={styles.forgotText}>Forgot password?</Text>
      <View style={styles.aboutUsContainer}>
        <Text style={styles.aboutUsText}>About Us</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0E27",
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  loginButton: {
    backgroundColor: "#4D9FF9",
    padding: 15,
    borderRadius: 25,
    marginBottom: 10,
    width: "80%",
    alignItems: "center",
    shadowColor: "#4D9FF9",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: "#FF6F3C",
    padding: 15,
    borderRadius: 25,
    marginBottom: 10,
    width: "80%",
    alignItems: "center",
    shadowColor: "#FF6F3C",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  signupButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: '600',
  },
  forgotText: {
    color: "white",
    fontSize: 16,
    marginTop: 20,
    textDecorationLine: 'underline',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  aboutUsContainer: {
    position: "absolute",
    bottom: 30,
    padding: 10,
    backgroundColor: "transparent",
    borderRadius: 10,
  },
  aboutUsText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: 'underline',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
});
