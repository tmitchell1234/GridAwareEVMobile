import { Text, View, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Grid-Aware EV Charging</Text>
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Log into account</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signupButton}>
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
