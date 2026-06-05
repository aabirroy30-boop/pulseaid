import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function DonorProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      
      <View style={styles.profileCard}>
        <Text style={styles.avatar}>👤</Text>

        <Text style={styles.name}>
          Souvik Samanta
        </Text>

        <Text style={styles.bloodGroup}>
          Blood Group: O+
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Mobile Number</Text>
        <Text style={styles.value}>+91 9876543210</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>souvik@email.com</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>Kolkata, West Bengal</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Total Donations</Text>
        <Text style={styles.value}>5</Text>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          Edit Profile
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.buttonText}>
          Logout
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 15,
  },

  profileCard: {
    backgroundColor: "#D62828",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    fontSize: 70,
    marginBottom: 10,
  },

  name: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  bloodGroup: {
    color: "#fff",
    fontSize: 18,
    marginTop: 5,
  },

  infoCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },

  label: {
    fontSize: 14,
    color: "#666",
  },

  value: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },

  button: {
    backgroundColor: "#D62828",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },

  logoutButton: {
    backgroundColor: "#555",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 30,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});