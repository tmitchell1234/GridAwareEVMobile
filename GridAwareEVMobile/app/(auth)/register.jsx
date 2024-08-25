import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const response = await axios.post('http://gridawarecharging.com/api/user_create', {
        user_type: 'user',
        user_email: email,
        user_password: password,
        user_first_name: firstName || "", // Optional for user to provide name or no name 
        user_last_name: lastName || "", // Same concepts as user_first_name
        user_organization: null,
      });

      if (response.status === 200) {
        Alert.alert("Success", "Account created successfully!");
        router.push('/'); 
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
        placeholderTextColor="#FFFFFF"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="First Name"
        placeholderTextColor="#FFFFFF"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        placeholderTextColor="#FFFFFF"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#FFFFFF"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#FFFFFF"
        secureTextEntry={true}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity style={styles.continueButton} onPress={handleRegister}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

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
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 10,
  },
  cancelButton: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  createAccountText: {
    color: 'white',
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1A1E3A',
    color: '#FFFFFF',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderColor: '#FFFFFF',
    borderWidth: 1,
  },
  continueButton: {
    backgroundColor: '#FF6F3C',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default Register;
