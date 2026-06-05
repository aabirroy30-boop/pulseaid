import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";

export default function HospitalBloodRequestScreen({ navigation }) {
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [units, setUnits] = useState("2 Units");
  const [priority, setPriority] = useState("Emergency");

  const [showBloodList, setShowBloodList] = useState(false);
  const [showUnitList, setShowUnitList] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const unitOptions = ["1 Unit", "2 Units", "3 Units", "4 Units", "5 Units"];

  const handleSubmit = () => {
    Alert.alert(
      "Request Sent",
      "Your hospital blood request has been sent to PulseAid blood vault, donors and NGO network.",
      [
        {
          text: "OK",
          onPress: () => navigation.navigate("HospitalHome"),
        },
      ]
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff7f7" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Hospital Blood Request</Text>

          <View style={{ width: 28 }} />
        </View>

        <TouchableOpacity
          style={styles.card}
          onPress={() => setShowBloodList(!showBloodList)}
        >
          <View style={styles.leftRow}>
            <Text style={styles.icon}>🩸</Text>
            <View>
              <Text style={styles.label}>Blood Group</Text>
              <Text style={styles.value}>{bloodGroup}</Text>
            </View>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {showBloodList && (
          <View style={styles.optionBox}>
            {bloodGroups.map((group) => (
              <TouchableOpacity
                key={group}
                style={styles.optionItem}
                onPress={() => {
                  setBloodGroup(group);
                  setShowBloodList(false);
                }}
              >
                <Text style={styles.optionText}>{group}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.card}
          onPress={() => setShowUnitList(!showUnitList)}
        >
          <View style={styles.leftRow}>
            <Text style={styles.icon}>📦</Text>
            <View>
              <Text style={styles.label}>Units Required</Text>
              <Text style={styles.value}>{units}</Text>
            </View>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {showUnitList && (
          <View style={styles.optionBox}>
            {unitOptions.map((unit) => (
              <TouchableOpacity
                key={unit}
                style={styles.optionItem}
                onPress={() => {
                  setUnits(unit);
                  setShowUnitList(false);
                }}
              >
                <Text style={styles.optionText}>{unit}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Priority Level</Text>

        <View style={styles.priorityRow}>
          {["Emergency", "Urgent", "Normal"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.priorityChip,
                priority === item && styles.activePriority,
              ]}
              onPress={() => setPriority(item)}
            >
              <Text
                style={[
                  styles.priorityText,
                  priority === item && styles.activePriorityText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.icon}>🆔</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Patient Case ID</Text>
            <TextInput
              placeholder="Example: PA-2045"
              placeholderTextColor="#8b8b8b"
              style={styles.textInput}
            />
          </View>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.icon}>🏥</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Hospital Name</Text>
            <TextInput
              placeholder="City Care Hospital"
              placeholderTextColor="#8b8b8b"
              style={styles.textInput}
            />
          </View>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.icon}>📍</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Hospital Location</Text>
            <TextInput
              placeholder="Enter hospital location"
              placeholderTextColor="#8b8b8b"
              style={styles.textInput}
            />
          </View>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.icon}>📅</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Required Date & Time</Text>
            <TextInput
              placeholder="Example: 25 June 2026, 10:00 AM"
              placeholderTextColor="#8b8b8b"
              style={styles.textInput}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Additional Notes</Text>

        <TextInput
          style={styles.notesBox}
          placeholder="Patient requires immediate transfusion."
          placeholderTextColor="#8b8b8b"
          multiline
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Send Request</Text>
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
    fontSize: 19,
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

  optionBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eadede",
    marginTop: -5,
    marginBottom: 13,
    paddingVertical: 8,
    elevation: 2,
  },

  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f5e5e5",
  },

  optionText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "800",
  },

  sectionTitle: {
    marginTop: 4,
    marginBottom: 10,
    fontSize: 16,
    color: "#111827",
    fontWeight: "900",
  },

  priorityRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  priorityChip: {
    flex: 1,
    height: 46,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eadede",
    alignItems: "center",
    justifyContent: "center",
  },

  activePriority: {
    backgroundColor: "#ef233c",
    borderColor: "#ef233c",
  },

  priorityText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "800",
  },

  activePriorityText: {
    color: "#fff",
  },

  inputCard: {
    minHeight: 72,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eadede",
    paddingHorizontal: 14,
    marginBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  inputWrapper: {
    flex: 1,
  },

  textInput: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "700",
    paddingVertical: 2,
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