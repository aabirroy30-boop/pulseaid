import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";

export default function BloodRequestScreen({ navigation }) {
  const [requestType, setRequestType] = useState("Emergency");

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff7f7" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>New Blood Request</Text>

          <View style={{ width: 28 }} />
        </View>

        <View style={styles.card}>
          <View style={styles.leftRow}>
            <Text style={styles.icon}>🩸</Text>
            <View>
              <Text style={styles.label}>Blood Group</Text>
              <Text style={styles.value}>O+</Text>
            </View>
          </View>
          <Text style={styles.arrow}>›</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.leftRow}>
            <Text style={styles.icon}>🩸</Text>
            <View>
              <Text style={styles.label}>Units Needed</Text>
              <Text style={styles.value}>2 Units</Text>
            </View>
          </View>
          <Text style={styles.arrow}>›</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.leftRow}>
            <Text style={styles.icon}>🏥</Text>
            <View>
              <Text style={styles.label}>Hospital Name</Text>
              <Text style={styles.value}>City Care Hospital</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.leftRow}>
            <Text style={styles.icon}>📍</Text>
            <View>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>Ahmedabad, Gujarat</Text>
            </View>
          </View>
          <Text style={styles.arrow}>›</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.leftRow}>
            <Text style={styles.icon}>📅</Text>
            <View>
              <Text style={styles.label}>Need by Date & Time</Text>
              <Text style={styles.value}>25 May 2025, 10:00 AM</Text>
            </View>
          </View>
          <Text style={styles.calendar}>▣</Text>
        </View>

        <Text style={styles.sectionTitle}>Request Type</Text>

        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[
              styles.typeBox,
              requestType === "Emergency" && styles.activeTypeBox,
            ]}
            onPress={() => setRequestType("Emergency")}
          >
            <View
              style={[
                styles.radio,
                requestType === "Emergency" && styles.activeRadio,
              ]}
            />
            <Text
              style={[
                styles.typeText,
                requestType === "Emergency" && styles.activeTypeText,
              ]}
            >
              Emergency
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeBox,
              requestType === "Normal" && styles.activeTypeBox,
            ]}
            onPress={() => setRequestType("Normal")}
          >
            <View
              style={[
                styles.radio,
                requestType === "Normal" && styles.activeRadio,
              ]}
            />
            <Text
              style={[
                styles.typeText,
                requestType === "Normal" && styles.activeTypeText,
              ]}
            >
              Normal
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Additional Notes</Text>

        <TextInput
          style={styles.notesBox}
          placeholder="Please help urgently."
          placeholderTextColor="#111827"
          multiline
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => navigation.navigate("PatientHome")}
        >
          <Text style={styles.submitText}>Submit Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff7f7",
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 38,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  backText: {
    fontSize: 36,
    color: "#111827",
    fontWeight: "500",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },

  card: {
    height: 72,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eadede",
    paddingHorizontal: 14,
    marginBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },

  leftRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    fontSize: 24,
    marginRight: 13,
  },

  label: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },

  value: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "900",
    marginTop: 3,
  },

  arrow: {
    fontSize: 30,
    color: "#111827",
  },

  calendar: {
    fontSize: 22,
    color: "#ef233c",
  },

  sectionTitle: {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 16,
    color: "#111827",
    fontWeight: "900",
  },

  typeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  typeBox: {
    flex: 1,
    height: 54,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eadede",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  activeTypeBox: {
    backgroundColor: "#fff0f2",
    borderColor: "#ef233c",
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#c7c7c7",
    marginRight: 10,
  },

  activeRadio: {
    borderColor: "#ef233c",
    backgroundColor: "#ef233c",
  },

  typeText: {
    fontSize: 15,
    color: "#555",
    fontWeight: "700",
  },

  activeTypeText: {
    color: "#111827",
    fontWeight: "900",
  },

  notesBox: {
    height: 105,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eadede",
    paddingHorizontal: 16,
    paddingTop: 14,
    fontSize: 15,
    color: "#111827",
    textAlignVertical: "top",
    marginBottom: 28,
  },

  submitButton: {
    height: 60,
    backgroundColor: "#ef233c",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  submitText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
  },
});