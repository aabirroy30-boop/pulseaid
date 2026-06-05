import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function HospitalProfileScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#ef233c" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Hospital Profile</Text>

        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🏥</Text>
          </View>

          <Text style={styles.name}>City Care Hospital</Text>
          <Text style={styles.type}>Multi-Speciality Hospital</Text>
          <Text style={styles.location}>📍 Ahmedabad, Gujarat</Text>
        </View>

        <View style={styles.infoBox}>
          <InfoItem label="Hospital ID" value="HSP-2045" />
          <InfoItem label="License Number" value="GJ-MED-90876" />
          <InfoItem label="Contact Number" value="+91 98765 43210" />
          <InfoItem label="Emergency Contact" value="+91 99887 77665" />
          <InfoItem label="Email" value="citycare@hospital.com" />
          <InfoItem label="Address" value="SG Highway, Ahmedabad, Gujarat" />
        </View>

        <View style={styles.menuBox}>
          <MenuItem icon="🩸" title="Blood Requests" onPress={() => navigation.navigate("HospitalRequests")} />
          <MenuItem icon="📦" title="Inventory Management" onPress={() => navigation.navigate("HospitalInventory")} />
          <MenuItem icon="🤝" title="NGO Support" />
          <MenuItem icon="🚑" title="Emergency Assistance" />
          <MenuItem icon="⚙️" title="Settings" />
          <MenuItem icon="❓" title="Help & Support" />
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function InfoItem({ label, value }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function MenuItem({ icon, title, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Text style={styles.menuIcon}>{icon}</Text>
        <Text style={styles.menuTitle}>{title}</Text>
      </View>

      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff7f7",
  },

  header: {
    height: 120,
    backgroundColor: "#ef233c",
    paddingTop: 45,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },

  backText: {
    fontSize: 38,
    color: "#fff",
    fontWeight: "500",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
  },

  profileCard: {
    backgroundColor: "#fff",
    marginHorizontal: 18,
    marginTop: -32,
    borderRadius: 22,
    paddingVertical: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0dada",
    elevation: 4,
  },

  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#fff0f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  avatarText: {
    fontSize: 38,
  },

  name: {
    fontSize: 23,
    fontWeight: "900",
    color: "#111827",
  },

  type: {
    marginTop: 6,
    fontSize: 15,
    color: "#555",
    fontWeight: "700",
  },

  location: {
    marginTop: 6,
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
  },

  infoBox: {
    backgroundColor: "#fff",
    marginHorizontal: 18,
    marginTop: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f0dada",
    padding: 16,
    elevation: 3,
  },

  infoItem: {
    marginBottom: 15,
  },

  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "700",
  },

  infoValue: {
    marginTop: 4,
    fontSize: 15,
    color: "#111827",
    fontWeight: "900",
  },

  menuBox: {
    backgroundColor: "#fff",
    marginHorizontal: 18,
    marginTop: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f0dada",
    overflow: "hidden",
    elevation: 3,
  },

  menuItem: {
    height: 62,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f5e5e5",
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuIcon: {
    fontSize: 22,
    marginRight: 14,
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  menuArrow: {
    fontSize: 28,
    color: "#9ca3af",
  },

  logoutButton: {
    height: 58,
    backgroundColor: "#ef233c",
    borderRadius: 14,
    marginHorizontal: 18,
    marginTop: 28,
    marginBottom: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
});