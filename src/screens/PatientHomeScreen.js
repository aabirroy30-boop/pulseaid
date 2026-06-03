import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function PatientHomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#ef233c" />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Arjun 👋</Text>
          <Text style={styles.subGreeting}>What would you like to do today?</Text>
        </View>

        <TouchableOpacity style={styles.bellBox}>
          <Text style={styles.bell}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
        <View style={styles.requestCard}>
          <View>
            <Text style={styles.cardTitle}>Need Blood?</Text>
            <Text style={styles.cardSubtitle}>Request blood in emergency</Text>

            <TouchableOpacity style={styles.requestButton} onPress={() => navigation.navigate("BloodRequest")}>
              <Text style={styles.requestButtonText}>Request Now</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bloodIconBox}>
            <Text style={styles.bloodIcon}>🩸</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Donors</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>

        <View style={styles.donorCard}>
          <View style={styles.bloodGroupBox}>
            <Text style={styles.bloodGroup}>A+</Text>
          </View>

          <View style={styles.donorInfo}>
            <Text style={styles.donorName}>Rahul Sharma</Text>
            <Text style={styles.distance}>1.2 km away</Text>
          </View>

          <TouchableOpacity style={styles.callButton}>
            <Text style={styles.callText}>☎</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.donorCard}>
          <View style={styles.bloodGroupBox}>
            <Text style={styles.bloodGroup}>O+</Text>
          </View>

          <View style={styles.donorInfo}>
            <Text style={styles.donorName}>Neha Patel</Text>
            <Text style={styles.distance}>2.3 km away</Text>
          </View>

          <TouchableOpacity style={styles.callButton}>
            <Text style={styles.callText}>☎</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.donorCard}>
          <View style={styles.bloodGroupBox}>
            <Text style={styles.bloodGroup}>B+</Text>
          </View>

          <View style={styles.donorInfo}>
            <Text style={styles.donorName}>Amit Verma</Text>
            <Text style={styles.distance}>3.1 km away</Text>
          </View>

          <TouchableOpacity style={styles.callButton}>
            <Text style={styles.callText}>☎</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.serviceTitle}>Emergency Services</Text>

        <View style={styles.serviceRow}>
          <TouchableOpacity style={styles.serviceCard}>
            <Text style={styles.serviceIcon}>🚑</Text>
            <Text style={styles.serviceText}>Ambulance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard}>
            <Text style={styles.serviceIcon}>🏥</Text>
            <Text style={styles.serviceText}>Hospitals</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard}>
            <Text style={styles.serviceIcon}>🩸</Text>
            <Text style={styles.serviceText}>Blood Banks</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <View style={styles.navItem}>
          <Text style={styles.activeNavIcon}>⌂</Text>
          <Text style={styles.activeNavText}>Home</Text>
        </View>

        <View style={styles.navItem}>
          <Text style={styles.navIcon}>▣</Text>
          <Text style={styles.navText}>Requests</Text>
        </View>

        <View style={styles.navItem}>
          <Text style={styles.navIcon}>☏</Text>
          <Text style={styles.navText}>Chat</Text>
        </View>

        <View style={styles.navItem}>
          <Text style={styles.navIcon}>◎</Text>
          <Text style={styles.navText}>Profile</Text>
        </View>
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

  greeting: {
    color: "#fff",
    fontSize: 27,
    fontWeight: "900",
  },

  subGreeting: {
    color: "#ffe1e5",
    fontSize: 14,
    marginTop: 6,
    fontWeight: "500",
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
    marginTop: -62,
  },

  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    minHeight: 155,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f3d4d8",
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },

  cardSubtitle: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
    fontWeight: "500",
  },

  requestButton: {
    marginTop: 18,
    backgroundColor: "#ef233c",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  requestButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },

  bloodIconBox: {
    width: 95,
    height: 95,
    borderRadius: 22,
    backgroundColor: "#fff0f2",
    alignItems: "center",
    justifyContent: "center",
  },

  bloodIcon: {
    fontSize: 52,
  },

  sectionHeader: {
    marginTop: 26,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },

  viewAll: {
    color: "#ef233c",
    fontSize: 14,
    fontWeight: "900",
  },

  donorCard: {
    height: 72,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0dada",
    elevation: 2,
  },

  bloodGroupBox: {
    width: 58,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff1f2",
    alignItems: "center",
    justifyContent: "center",
  },

  bloodGroup: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
  },

  donorInfo: {
    flex: 1,
    marginLeft: 18,
  },

  donorName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  distance: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
    fontWeight: "500",
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

  serviceTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111827",
    marginTop: 16,
    marginBottom: 14,
  },

  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 95,
  },

  serviceCard: {
    width: "31%",
    height: 88,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f0dada",
    elevation: 2,
  },

  serviceIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  serviceText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
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