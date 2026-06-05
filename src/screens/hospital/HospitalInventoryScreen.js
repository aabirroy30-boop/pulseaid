import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";

export default function HospitalInventoryScreen({ navigation }) {
  const inventory = [
    { group: "A+", units: 45, expiry: 2 },
    { group: "A-", units: 12, expiry: 1 },
    { group: "B+", units: 28, expiry: 0 },
    { group: "B-", units: 8, expiry: 1 },
    { group: "O+", units: 60, expiry: 3 },
    { group: "O-", units: 15, expiry: 2 },
    { group: "AB+", units: 10, expiry: 0 },
    { group: "AB-", units: 5, expiry: 0 },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff7f7" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Inventory Management</Text>

        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>183</Text>
            <Text style={styles.statLabel}>Total Units</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>171</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Expiry Soon</Text>
          </View>
        </View>

        <TextInput
          placeholder="Search blood group..."
          placeholderTextColor="#8b8b8b"
          style={styles.searchInput}
        />

        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Blood Group</Text>
            <Text style={styles.headerCell}>Units</Text>
            <Text style={styles.headerCell}>Expiry Soon</Text>
          </View>

          {inventory.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.groupText}>{item.group}</Text>
              <Text style={styles.cellText}>{item.units}</Text>
              <Text
                style={[
                  styles.cellText,
                  item.expiry > 0 && styles.expiryText,
                ]}
              >
                {item.expiry}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add New Stock</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff7f7",
  },

  header: {
    paddingTop: 42,
    paddingHorizontal: 18,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backText: {
    fontSize: 36,
    color: "#111827",
    fontWeight: "500",
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#111827",
  },

  body: {
    paddingHorizontal: 18,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  statCard: {
    width: "31%",
    height: 95,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f0dada",
    elevation: 3,
  },

  statNumber: {
    fontSize: 25,
    fontWeight: "900",
    color: "#ef233c",
  },

  statLabel: {
    marginTop: 6,
    fontSize: 11,
    color: "#555",
    fontWeight: "800",
  },

  searchInput: {
    height: 56,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eadede",
    paddingHorizontal: 18,
    fontSize: 15,
    color: "#111827",
    marginBottom: 16,
  },

  tableCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#f0dada",
    overflow: "hidden",
    elevation: 3,
  },

  tableHeader: {
    height: 54,
    backgroundColor: "#ef233c",
    flexDirection: "row",
    alignItems: "center",
  },

  headerCell: {
    flex: 1,
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },

  tableRow: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f5e5e5",
  },

  groupText: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "900",
    color: "#ef233c",
  },

  cellText: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  expiryText: {
    color: "#F59E0B",
  },

  addButton: {
    height: 60,
    backgroundColor: "#ef233c",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 35,
    elevation: 4,
  },

  addButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
  },
});