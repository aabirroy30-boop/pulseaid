import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function DonorLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Donor Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Pulse Aid</Text>

      <Text style={styles.title}>
        Donor Login
      </Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>
          Login
        </Text>
      </TouchableOpacity>

      <Text style={styles.register}>
        New Donor? Register Here
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#fff",
  },

  logo: {
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    color: "#D62828",
    marginBottom: 15,
  },

  title: {
    fontSize: 26,
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 30,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#D62828",
    padding: 15,
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },

  register: {
    textAlign: "center",
    marginTop: 20,
    color: "#D62828",
  },
});