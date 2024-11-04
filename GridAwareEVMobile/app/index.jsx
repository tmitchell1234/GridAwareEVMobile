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
    width: 140,
    height: 140,
    borderRadius: 10,
    marginBottom: 30,
    resizeMode: 'contain',
  },
  title: {
    color: "#F2F2F2",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 40,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  loginButton: {
    backgroundColor: "#2D80FB",
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    width: "75%",
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 1.1,
  },
  signupButton: {
    backgroundColor: "#FF6F3C",
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    width: "75%",
    alignItems: "center",
  },
  signupButtonText: {
    color: "white",
    fontSize: 17,
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
    letterSpacing: 0.5,
  },
  aboutUsContainer: {
    position: "absolute",
    bottom: 30,
    padding: 8,
    borderRadius: 8,
    borderColor: "#30336B",
    borderWidth: 0.5,
  },
  aboutUsText: {
    color: "#F2F2F2",
    fontSize: 15,
    fontWeight: "500",
    textDecorationLine: 'underline',
    letterSpacing: 0.8,
  },
});
