import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function HospitalRequestsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff7f7" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Hospital Requests</Text>

        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
        <RequestCard
          bloodGroup="O+"
          units="2 Units"
          caseId="PA-2045"
          priority="Emergency"
          status="Pending"
          statusColor="#F59E0B"
          bgColor="#FFF7E6"
        />

        <RequestCard
          bloodGroup="A+"
          units="1 Unit"
          caseId="PA-2038"
          priority="Urgent"
          status="Approved"
          statusColor="#22C55E"
          bgColor="#E8F8EC"
        />

        <RequestCard
          bloodGroup="B+"
          units="3 Units"
          caseId="PA-2019"
          priority="Normal"
          status="Supplied"
          statusColor="#2563EB"
          bgColor="#EAF2FF"
        />

        <RequestCard
          bloodGroup="AB-"
          units="1 Unit"
          caseId="PA-1998"
          priority="Emergency"
          status="Rejected"
          statusColor="#EF4444"
          bgColor="#FEE2E2"
        />
      </ScrollView>
    </View>
  );
}

function RequestCard({
  bloodGroup,
  units,
  caseId,
  priority,
  status,
  statusColor,
  bgColor,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.bloodBox}>
          <Text style={styles.bloodText}>{bloodGroup}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.caseText}>Case ID: {caseId}</Text>
          <Text style={styles.unitsText}>{units} Required</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {status}
          </Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.priorityBox}>
          <Text style={styles.priorityText}>{priority}</Text>
        </View>

        <Text style={styles.dateText}>📅 25 June 2026</Text>
      </View>

      <TouchableOpacity style={styles.detailsButton}>
        <Text style={styles.detailsText}>View Details</Text>
      </TouchableOpacity>
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
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },

  body: {
    paddingHorizontal: 18,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0dada",
    elevation: 3,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  bloodBox: {
    width: 62,
    height: 58,
    borderRadius: 15,
    backgroundColor: "#fff0f2",
    alignItems: "center",
    justifyContent: "center",
  },

  bloodText: {
    color: "#ef233c",
    fontSize: 23,
    fontWeight: "900",
  },

  infoBox: {
    flex: 1,
    marginLeft: 14,
  },

  caseText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },

  unitsText: {
    marginTop: 5,
    fontSize: 13,
    color: "#555",
    fontWeight: "700",
  },

  statusBadge: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "900",
  },

  bottomRow: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  priorityBox: {
    backgroundColor: "#fff0f2",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
  },

  priorityText: {
    color: "#ef233c",
    fontSize: 12,
    fontWeight: "900",
  },

  dateText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "700",
  },

  detailsButton: {
    marginTop: 16,
    height: 48,
    backgroundColor: "#ef233c",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  detailsText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
});