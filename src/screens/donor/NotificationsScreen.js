import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";

export default function NotificationsScreen() {
  const notifications = [
    {
      id: "1",
      title: "Emergency Blood Request",
      message: "A+ blood required at Apollo Hospital.",
      time: "10 mins ago",
    },
    {
      id: "2",
      title: "Donation Successful",
      message: "Your donation has been added to the Blood Vault.",
      time: "2 days ago",
    },
    {
      id: "3",
      title: "Health Reminder",
      message: "You are eligible to donate blood again.",
      time: "1 week ago",
    },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>

      <Text style={styles.message}>
        {item.message}
      </Text>

      <Text style={styles.time}>
        {item.time}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Notifications
      </Text>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 15,
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D62828",
    marginBottom: 5,
  },

  message: {
    fontSize: 15,
    color: "#333",
    marginBottom: 8,
  },

  time: {
    fontSize: 12,
    color: "#777",
    textAlign: "right",
  },
});