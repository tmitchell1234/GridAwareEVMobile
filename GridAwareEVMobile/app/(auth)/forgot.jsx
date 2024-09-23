import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import axios from 'axios';
import { useRouter } from 'expo-router';

const API_KEY = Constants.expoConfig.extra.API_KEY;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // Step 1 for email, Step 2 for code & new password
  const [showSuccess, setShowSuccess] = useState(false); // Flag for success message
  const router = useRouter();

  // Function to send reset email
  const sendResetEmail = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    try {
      const response = await axios.post('https://gridawarecharging.com/api/reset_password_email', {
        api_key: API_KEY,
        user_email: email,
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Reset email sent! Please check your inbox.');
        setStep(2); // Move to the next step
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
      console.error('Error sending reset email:', error);
    }
  };

  // Function to reset password with the code
  const resetPassword = async () => {
    if (!resetCode || !newPassword) {
      Alert.alert('Error', 'Please enter the reset code and new password.');
      return;
    }

    try {
      const response = await axios.post('https://gridawarecharging.com/api/reset_password_code', {
        api_key: API_KEY,
        user_email: email,
        reset_code: parseInt(resetCode),
        new_password: newPassword,
      });

      if (response.status === 200) {
        // Show the success message
        setShowSuccess(true);

        // Navigate back to index after a delay
        setTimeout(() => {
          router.push('/'); // Navigate to index
        }, 3000); // Delay of 3 seconds for showing success message
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password. Please check the code and try again.');
      console.error('Error resetting password:', error);
    }
  };

  if (showSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✔️</Text>
          <Text style={styles.successText}>Password Reset Successfully!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerText}>Forgot Password</Text>

        {step === 1 ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#B0B0B0"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity style={styles.actionButton} onPress={sendResetEmail}>
              <Text style={styles.buttonText}>Send Reset Email</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter reset code"
              placeholderTextColor="#B0B0B0"
              value={resetCode}
              onChangeText={setResetCode}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              placeholderTextColor="#B0B0B0"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={true}
            />
            <TouchableOpacity style={styles.actionButton} onPress={resetPassword}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Style Definitions
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
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
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#4D9FF9',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#4D9FF9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  successIcon: {
    fontSize: 60,
    color: '#4D9FF9',
    marginBottom: 10,
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ForgotPassword;
