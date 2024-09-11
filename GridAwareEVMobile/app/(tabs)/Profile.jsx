import React from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

const Profile = () => {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Log Out",
          onPress: () => router.replace('/')
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image source={require('../images/GridAwareLogo.png')} style={styles.profileImage} />
          <Text style={styles.usernameText}>User</Text>
          <Text style={styles.emailText}>User@example.com</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Profile</Text>
          <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/update-email')}>
            <Text style={styles.optionText}>Update Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/update-password')}>
            <Text style={styles.optionText}>Change Password</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  usernameText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  section: {
    width: '100%',
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FF6F3C',
    marginBottom: 15,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#1A1E3A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#FF6F3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  logoutButton: {
    backgroundColor: '#FF6F3C',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#FF6F3C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Profile;
