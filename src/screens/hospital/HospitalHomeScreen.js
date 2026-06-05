import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function HospitalHomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#ef233c" />

      <View style={styles.header}>
        <View>
          <Text style={styles.hospitalName}>City Care Hospital</Text>
          <Text style={styles.subtitle}>Emergency Blood Support</Text>
        </View>

        <TouchableOpacity style={styles.bellBox}>
          <Text style={styles.bell}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>42</Text>
            <Text style={styles.statLabel}>Blood Units</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>08</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>15</Text>
            <Text style={styles.statLabel}>Supplied</Text>
          </View>
        </View>

        <View style={styles.vaultCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Digital Blood Vault</Text>
            <Text style={styles.viewAll}>View All</Text>
          </View>

          <View style={styles.bloodGrid}>
            <BloodUnit group="A+" units="12" />
            <BloodUnit group="O+" units="08" />
            <BloodUnit group="B+" units="05" />
            <BloodUnit group="AB+" units="03" />
          </View>
        </View>

        <Text style={styles.quickTitle}>Quick Actions</Text>

        <View style={styles.actionGrid}>
          <TouchableOpacity
  style={styles.actionCard}
  onPress={() => navigation.navigate("HospitalBloodRequest")}
>
  <Text style={styles.actionIcon}>🩸</Text>
  <Text style={styles.actionTitle}>Request Blood</Text>
</TouchableOpacity>
<TouchableOpacity
  style={styles.actionCard}
  onPress={() => navigation.navigate("HospitalInventory")}
>
  <Text style={styles.actionIcon}>📦</Text>
  <Text style={styles.actionTitle}>Inventory</Text>
</TouchableOpacity>          
<ActionCard icon="🤝" title="NGO Support" />
          <ActionCard icon="🚑" title="Emergency" />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Requests</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>

        <RequestItem
          bloodGroup="O+"
          units="2 Units"
          status="Pending"
          color="#F59E0B"
          bg="#FFF7E6"
        />

        <RequestItem
          bloodGroup="A+"
          units="1 Unit"
          status="Approved"
          color="#22C55E"
          bg="#E8F8EC"
        />

        <RequestItem
          bloodGroup="B+"
          units="3 Units"
          status="Supplied"
          color="#2563EB"
          bg="#EAF2FF"
        />
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.activeNavIcon}>⌂</Text>
          <Text style={styles.activeNavText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
  style={styles.navItem}
  onPress={() => navigation.navigate("HospitalRequests")}
>
  <Text style={styles.navIcon}>▣</Text>
  <Text style={styles.navText}>Requests</Text>
</TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>▤</Text>
          <Text style={styles.navText}>Vault</Text>
        </TouchableOpacity>

        <TouchableOpacity
  style={styles.navItem}
  onPress={() => navigation.navigate("HospitalProfile")}
>
  <Text style={styles.navIcon}>◎</Text>
  <Text style={styles.navText}>Profile</Text>
</TouchableOpacity>
      </View>
    </View>
  );
}

function BloodUnit({ group, units }) {
  return (
    <View style={styles.bloodUnitCard}>
      <Text style={styles.bloodGroup}>{group}</Text>
      <Text style={styles.unitText}>{units} Units</Text>
    </View>
  );
}

function ActionCard({ icon, title }) {
  return (
    <TouchableOpacity style={styles.actionCard}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

function RequestItem({ bloodGroup, units, status, color, bg }) {
  return (
    <View style={styles.requestItem}>
      <View style={styles.requestBloodBox}>
        <Text style={styles.requestBlood}>{bloodGroup}</Text>
      </View>

      <View style={styles.requestInfo}>
        <Text style={styles.requestTitle}>{units} Required</Text>
        <Text style={styles.requestSub}>Patient Case #PA-2045</Text>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: bg }]}>
        <Text style={[styles.statusText, { color }]}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff7f7",
  },

  header: {
    height: 185,
    backgroundColor: "#ef233c",
    paddingTop: 52,
    paddingHorizontal: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  hospitalName: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "900",
  },

  subtitle: {
    color: "#ffe1e5",
    fontSize: 14,
    marginTop: 6,
    fontWeight: "600",
  },

  bellBox: {
    marginTop: 2,
  },

  bell: {
    fontSize: 24,
    color: "#fff",
  },

  body: {
    flex: 1,
    paddingHorizontal: 18,
    marginTop: -58,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  statCard: {
    width: "31%",
    height: 105,
    backgroundColor: "#fff",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f0dada",
    elevation: 4,
  },

  statNumber: {
    fontSize: 27,
    fontWeight: "900",
    color: "#ef233c",
  },

  statLabel: {
    marginTop: 6,
    fontSize: 12,
    color: "#555",
    fontWeight: "800",
  },

  vaultCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f0dada",
    elevation: 3,
    marginBottom: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111827",
  },

  viewAll: {
    fontSize: 13,
    color: "#ef233c",
    fontWeight: "900",
  },

  bloodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  bloodUnitCard: {
    width: "48%",
    height: 78,
    backgroundColor: "#fff0f2",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  bloodGroup: {
    fontSize: 24,
    fontWeight: "900",
    color: "#ef233c",
  },

  unitText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "800",
    marginTop: 4,
  },

  quickTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 14,
  },

  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
    marginBottom: 22,
  },

  actionCard: {
    width: "48%",
    height: 94,
    backgroundColor: "#fff",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f0dada",
    elevation: 3,
  },

  actionIcon: {
    fontSize: 27,
    marginBottom: 8,
  },

  actionTitle: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "900",
  },

  requestItem: {
    height: 74,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f0dada",
    paddingHorizontal: 13,
    marginBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  requestBloodBox: {
    width: 54,
    height: 48,
    backgroundColor: "#fff0f2",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  requestBlood: {
    fontSize: 22,
    color: "#ef233c",
    fontWeight: "900",
  },

  requestInfo: {
    flex: 1,
    marginLeft: 13,
  },

  requestTitle: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "900",
  },

  requestSub: {
    marginTop: 4,
    fontSize: 12,
    color: "#555",
    fontWeight: "600",
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

  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 78,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#f0dada",
  },

  navItem: {
    alignItems: "center",
  },

  activeNavIcon: {
    color: "#ef233c",
    fontSize: 24,
    fontWeight: "900",
  },

  activeNavText: {
    color: "#ef233c",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 2,
  },

  navIcon: {
    color: "#777",
    fontSize: 23,
  },

  navText: {
    color: "#777",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
});