import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function CustomButton({
  title,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
    >
      <Text style={styles.text}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#D62828",
    padding: 15,
    borderRadius: 12,
    marginVertical: 5,
  },

  text: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});