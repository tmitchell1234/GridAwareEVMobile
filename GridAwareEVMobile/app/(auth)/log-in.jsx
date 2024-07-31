import React from "react"
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet} from 'react-native';

const LogIn = () => {
  return (
    <View style = {styles.container}>
      <View style = {styles.logoContainer}>
        <Image source={require('../images/GridAwareLogo.webp')} style={styles.logo} />
      </View>
      <TextInput 
        style={styles.input}
        placeholder="Email or Username"
        placeholderTextColor="#FFFFFF"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#FFFFFF"
        secureTextEntry={true}
      />
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0E27',
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#1A1E3A',
    color: '#FFFFFF',
    width: '80%', 
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderColor: '#FFFFFF',
    borderWidth: 1,
  },
  loginButton: {
    backgroundColor: '#4D9FF9',
    padding: 15, 
    borderRadius: 10, 
    width: '80%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
})

export default LogIn