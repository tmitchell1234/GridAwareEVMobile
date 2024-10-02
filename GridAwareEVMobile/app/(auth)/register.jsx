import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import axios from 'axios';

const Register = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State for password validation
  const [isValidLength, setIsValidLength] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);

  // Show/Hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_KEY = Constants.expoConfig.extra.API_KEY;
  const router = useRouter();
  const [buttonScale] = useState(new Animated.Value(1)); // For button press animation

  // Password validation function
  const validatePassword = (password) => {
    setIsValidLength(password.length >= 12);
    setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(password));
    setHasLowercase(/[a-z]/.test(password));
    setHasNumber(/[0-9]/.test(password));
  };

  const handleRegister = async () => {
    // Check if email or password is empty
    if (!email || !password) {
      Alert.alert("Error", "Email and Password are required", [{ text: "OK", onPress: () => {} }]);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match", [{ text: "OK", onPress: () => {} }]);
      return;
    }

    if (!(isValidLength && hasSpecialChar && hasLowercase && hasNumber)) {
      Alert.alert("Error", "Password does not meet the required criteria", [{ text: "OK", onPress: () => {} }]);
      return;
    }

    try {
      const response = await axios.post('https://gridawarecharging.com/api/user_create', {
        api_key: API_KEY,
        user_type: 'user',
        user_email: email,
        user_password: password,
        user_first_name: firstName || "", 
        user_last_name: lastName || "",
        user_organization: null
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
        <Image source={require('../images/GridAwareLogo.png')} style={styles.logo} />
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
      
      {/* Password Input with Show/Hide functionality */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#B0B0B0"
          secureTextEntry={!showPassword} // Toggle password visibility
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            validatePassword(text);  // Validate password as the user types
          }}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.showHideButton}
        >
          <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      {/* Password Validation Display */}
      <View style={styles.passwordValidationContainer}>
        <Text style={[styles.validationText, isValidLength ? styles.valid : styles.invalid]}>
          {isValidLength ? '✔' : '✖'} At least 12 characters
        </Text>
        <Text style={[styles.validationText, hasSpecialChar ? styles.valid : styles.invalid]}>
          {hasSpecialChar ? '✔' : '✖'} Minimum one special character
        </Text>
        <Text style={[styles.validationText, hasLowercase ? styles.valid : styles.invalid]}>
          {hasLowercase ? '✔' : '✖'} Lowercase letters
        </Text>
        <Text style={[styles.validationText, hasNumber ? styles.valid : styles.invalid]}>
          {hasNumber ? '✔' : '✖'} Contains a number
        </Text>
      </View>

      {/* Confirm Password Input with Show/Hide functionality */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#B0B0B0"
          secureTextEntry={!showConfirmPassword} // Toggle confirm password visibility
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={styles.showHideButton}
        >
          <Text style={styles.showHideText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <TouchableOpacity style={styles.continueButton} onPress={handleRegister}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

// Style Definitions
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
    color: '#4D9FF9',
    fontWeight: 'bold',
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
  passwordValidationContainer: {
    width: '100%',
    marginBottom: 10,
  },
  validationText: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'left',
  },
  valid: {
    color: 'green',
  },
  invalid: {
    color: 'red',
  },
});

export default Register;
