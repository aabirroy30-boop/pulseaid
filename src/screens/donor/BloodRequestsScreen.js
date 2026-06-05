import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function BloodRequestsScreen() {
  const requests = [
    {
      id: "1",
      patient: "Rahul Sharma",
      bloodGroup: "A+",
      hospital: "City Hospital",
      units: 2,
    },
    {
      id: "2",
      patient: "Priya Das",
      bloodGroup: "O-",
      hospital: "Apollo Hospital",
      units: 1,
    },
    {
      id: "3",
      patient: "Amit Roy",
      bloodGroup: "B+",
      hospital: "Medica Hospital",
      units: 3,
    },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.patient}</Text>

      <Text>Blood Group: {item.bloodGroup}</Text>

      <Text>Hospital: {item.hospital}</Text>

      <Text>Units Required: {item.units}</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          Donate Now
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Blood Requests
      </Text>

      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#F5F5F5",
  },

  heading: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#D62828",
  },

  button: {
    backgroundColor: "#D62828",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});