import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={require('./images/GridAwareLogo.webp')} style={styles.logo} />
      <Text style={styles.title}>Welcome to Grid-Aware EV Charging</Text>
      <TouchableOpacity style={styles.loginButton} onPress={() => router.push("(auth)/log-in")}>
        <Text style={styles.loginButtonText}>Log into account</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signupButton} onPress={() => router.push("(auth)/register")}>
        <Text style={styles.signupButtonText}>Create new account</Text>
      </TouchableOpacity>
      <Text style={styles.forgotText}>Forgot username or password?</Text>
      <View style={styles.aboutUsContainer}>
        <Text style={styles.aboutUsText}>About Us</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 150,  
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0E27",
  },
  title: {
    color: "white",
    fontSize: 24,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#4D9FF9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: "80%",
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: "#FF6F3C",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: "80%",
    alignItems: "center",
  },
  signupButtonText: {
    color: "white",
    fontSize: 16,
  },
  forgotText: {
    color: "white",
    fontSize: 14,
    marginTop: 10,
  },
  aboutUsContainer: {
    position: "absolute",
    bottom: 20,
    padding: 10,
    backgroundColor: "black",
  },
  aboutUsText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
