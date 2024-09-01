import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import axios from 'axios';

const Register = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const [buttonScale] = useState(new Animated.Value(1)); // For button press animation

  const handleRegister = async () => {
    // Check if email or password is empty
    if (!email || !password) {
      Alert.alert("Error", "Email and Password are required", [{ text: "OK", onPress: () => {} }], {
        cancelable: true,
        onDismiss: () => {},
      });
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match", [{ text: "OK", onPress: () => {} }], {
        cancelable: true,
        onDismiss: () => {},
      });
      return;
    }

    try {
      const response = await axios.post('http://gridawarecharging.com/api/user_create', {
        user_type: 'user',
        user_email: email,
        user_password: password,
        user_first_name: firstName || "", 
        user_last_name: lastName || "",
        user_organization: null,
      });

      if (response.status === 200) {
        Animated.sequence([
          Animated.timing(buttonScale, {
            toValue: 1.2,
            duration: 200,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(buttonScale, {
            toValue: 1,
            duration: 200,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]).start(() => {
          Alert.alert("Success", "Account created successfully!", [
            {
              text: "OK",
              onPress: () => router.push('/'),
            }
          ]);
        });
      }
    } catch (error) {
      console.error("Error creating account:", error);
      Alert.alert("Error", "Failed to create account. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../images/GridAwareLogo.webp')} style={styles.logo} />
        <TouchableOpacity onPress={() => router.push('/')}>
          <Text style={styles.cancelButton}>X</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.createAccountText}>Create Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#B0B0B0"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="First Name"
        placeholderTextColor="#B0B0B0"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        placeholderTextColor="#B0B0B0"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#B0B0B0"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#B0B0B0"
        secureTextEntry={true}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <TouchableOpacity style={styles.continueButton} onPress={handleRegister}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

// Style Process Below- For Now just keeping all in one location to make it easier for me. 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0E27',
    padding: 20,
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 20,
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  cancelButton: {
    color: '#FF6F3C',
    fontSize: 24,
    fontWeight: 'bold',
  },
  createAccountText: {
    color: 'white',
    fontSize: 26,
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
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
  continueButton: {
    backgroundColor: '#FF6F3C',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    shadowColor: "#FF6F3C",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Register;
