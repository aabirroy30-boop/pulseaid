import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function DigitalVaultScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Digital Blood Vault
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Blood Group</Text>
        <Text style={styles.value}>O+</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Available Blood Credits</Text>
        <Text style={styles.value}>2 Units</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Last Donation</Text>
        <Text style={styles.value}>15 May 2026</Text>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          Request Blood Using Credits
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          View Transaction History
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
  },

  label: {
    fontSize: 16,
    color: "#666",
  },

  value: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D62828",
    marginTop: 5,
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
    fontSize: 16,
  },
});