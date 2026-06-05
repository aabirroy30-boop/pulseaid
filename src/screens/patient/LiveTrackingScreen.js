import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
} from "react-native";

export default function LiveTrackingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff7f7" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Live Tracking</Text>

        <View style={{ width: 28 }} />
      </View>

      <View style={styles.donorCard}>
        <Image
          source={require("../../../assets/user.png")}
          style={styles.avatar}
        />

        <View style={styles.donorInfo}>
          <Text style={styles.name}>Rahul Sharma</Text>
          <Text style={styles.role}>Donor</Text>
          <Text style={styles.distance}>1.2 km away</Text>
        </View>

        <TouchableOpacity style={styles.callButton}>
          <Text style={styles.callText}>☎</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapBox}>
        <Text style={styles.mapBg}>╲╱╲╱╲╱╲╱╲╱╲╱</Text>

        <View style={styles.patientPin}>
          <Text style={styles.pinText}>📍</Text>
        </View>

        <View style={styles.donorPin}>
          <Text style={styles.avatarPin}>👤</Text>
        </View>

        <View style={styles.routeLineOne} />
        <View style={styles.routeLineTwo} />
        <View style={styles.routeLineThree} />
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Estimated Time</Text>
          <Text style={styles.infoValue}>12 min</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Distance</Text>
          <Text style={styles.infoValue}>1.2 km</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.liveButton}>
        <Text style={styles.liveText}>Live Tracking</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff7f7",
    paddingHorizontal: 18,
  },

  header: {
    paddingTop: 42,
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
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },

  donorCard: {
    height: 86,
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#eadede",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    elevation: 3,
    marginBottom: 14,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff0f2",
  },

  donorInfo: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  role: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
    fontWeight: "600",
  },

  distance: {
    fontSize: 12,
    color: "#111827",
    marginTop: 2,
    fontWeight: "700",
  },

  callButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#ef233c",
    alignItems: "center",
    justifyContent: "center",
  },

  callText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },

  mapBox: {
    height: 430,
    backgroundColor: "#eef6ef",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#dbe8dc",
    position: "relative",
  },

  mapBg: {
    position: "absolute",
    top: 40,
    left: -30,
    fontSize: 42,
    color: "#d8e6d9",
    transform: [{ rotate: "-25deg" }],
  },

  patientPin: {
    position: "absolute",
    top: 95,
    left: 78,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
  },

  donorPin: {
    position: "absolute",
    bottom: 95,
    right: 78,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#2563eb",
  },

  pinText: {
    fontSize: 25,
    color: "#fff",
  },

  avatarPin: {
    fontSize: 26,
  },

  routeLineOne: {
    position: "absolute",
    top: 142,
    left: 100,
    width: 4,
    height: 115,
    backgroundColor: "#2563eb",
    transform: [{ rotate: "30deg" }],
  },

  routeLineTwo: {
    position: "absolute",
    top: 245,
    left: 140,
    width: 130,
    height: 4,
    backgroundColor: "#2563eb",
  },

  routeLineThree: {
    position: "absolute",
    top: 245,
    right: 92,
    width: 4,
    height: 95,
    backgroundColor: "#2563eb",
    transform: [{ rotate: "-25deg" }],
  },

  infoRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },

  infoCard: {
    flex: 1,
    height: 72,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#eadede",
    elevation: 2,
  },

  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "700",
  },

  infoValue: {
    marginTop: 5,
    fontSize: 17,
    color: "#111827",
    fontWeight: "900",
  },

  liveButton: {
    height: 58,
    backgroundColor: "#ef233c",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    elevation: 4,
  },

  liveText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
  },
});