import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function DonorDashboardScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      
      <Text style={styles.welcome}>
        Welcome Donor 👋
      </Text>

      {/* Blood Group Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Blood Group</Text>
        <Text style={styles.cardValue}>O+</Text>
      </View>

      {/* Donation Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Last Donation</Text>
        <Text style={styles.cardValue}>15 May 2026</Text>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>
        Quick Actions
      </Text>

      <TouchableOpacity
  style={styles.button}
  onPress={() => navigation.navigate("Blood Requests")}
>
  <Text style={styles.buttonText}>View Blood Requests</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.button}
  onPress={() => navigation.navigate("Digital Vault")}
>
  <Text style={styles.buttonText}>Digital Blood Vault</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.button}
  onPress={() => navigation.navigate("Donation History")}
>
  <Text style={styles.buttonText}>Donation History</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.button}
  onPress={() => navigation.navigate("Profile")}
>
  <Text style={styles.buttonText}>My Profile</Text>
</TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  },

  welcome: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 16,
    color: "#666",
  },

  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D62828",
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 15,
  },

  button: {
    backgroundColor: "#D62828",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});