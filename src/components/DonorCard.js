import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function DonorCard({
  title,
  value,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
  },

  title: {
    color: "#666",
    fontSize: 14,
  },

  value: {
    color: "#D62828",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 5,
  },
});