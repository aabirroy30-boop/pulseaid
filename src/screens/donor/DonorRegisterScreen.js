import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function DonorRegisterScreen() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    console.log("Donor Registered");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Donor Registration</Text>

      <TextInput
        placeholder="Full Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Age"
        keyboardType="numeric"
        style={styles.input}
        value={age}
        onChangeText={setAge}
      />

      <TextInput
        placeholder="Blood Group"
        style={styles.input}
        value={bloodGroup}
        onChangeText={setBloodGroup}
      />

      <TextInput
        placeholder="Mobile Number"
        keyboardType="phone-pad"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        placeholder="Location"
        style={styles.input}
        value={location}
        onChangeText={setLocation}
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
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>
          Register
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    color: "#D62828",
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
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
});