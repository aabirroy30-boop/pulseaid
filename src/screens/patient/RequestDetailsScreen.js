import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function RequestDetailsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff7f7" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Request Details</Text>

        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
        <View style={styles.topCard}>
          <View style={styles.bloodCircle}>
            <Text style={styles.bloodText}>O+</Text>
          </View>

          <Text style={styles.mainTitle}>Emergency Blood Request</Text>
          <Text style={styles.subTitle}>City Care Hospital</Text>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Pending</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <InfoRow icon="🩸" label="Blood Group" value="O+" />
          <InfoRow icon="📦" label="Units Needed" value="2 Units" />
          <InfoRow icon="🏥" label="Hospital" value="City Care Hospital" />
          <InfoRow icon="📍" label="Location" value="Kolkata, West Bengal" />
          <InfoRow icon="📅" label="Needed By" value="25 May 2026, 10:00 AM" />
          <InfoRow icon="🚨" label="Request Type" value="Emergency" />
        </View>

        <Text style={styles.sectionTitle}>Request Progress</Text>

        <View style={styles.progressCard}>
          <ProgressItem active title="Request Submitted" time="Just now" />
          <ProgressItem active title="Nearby Donors Notified" time="18 donors" />
          <ProgressItem title="Donor Accepted" time="Waiting" />
          <ProgressItem title="Donation Completed" time="Pending" />
        </View>

        <Text style={styles.sectionTitle}>Donor Response</Text>

        <View style={styles.responseCard}>
          <View>
            <Text style={styles.responseTitle}>Interested Donors</Text>
            <Text style={styles.responseSub}>3 donors may be available</Text>
          </View>

          <View style={styles.countBox}>
            <Text style={styles.countText}>3</Text>
          </View>
        </View>

        <View style={styles.donorCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>R</Text>
          </View>

          <View style={styles.donorInfo}>
            <Text style={styles.donorName}>Rahul Sharma</Text>
            <Text style={styles.donorMeta}>A+ • 1.2 km away • ⭐ 4.8</Text>
          </View>

          <Text style={styles.availableText}>Available</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Call Donor</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Chat</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.trackButton}>
          <Text style={styles.trackText}>Track Donor</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>

      <View style={styles.infoTextBox}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function ProgressItem({ active, title, time }) {
  return (
    <View style={styles.progressItem}>
      <View style={[styles.progressDot, active && styles.activeDot]} />

      <View style={styles.progressTextBox}>
        <Text style={styles.progressTitle}>{title}</Text>
        <Text style={styles.progressTime}>{time}</Text>
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
    paddingTop: 42,
    paddingHorizontal: 18,
    paddingBottom: 16,
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

  topCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0dada",
    elevation: 3,
    marginBottom: 18,
  },

  bloodCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#fff0f2",
    alignItems: "center",
    justifyContent: "center",
  },

  bloodText: {
    fontSize: 30,
    color: "#ffffff",
    fontWeight: "900",
  },

  mainTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },

  subTitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
  },

  statusBadge: {
    marginTop: 14,
    backgroundColor: "#FFF7E6",
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 20,
  },

  statusText: {
    color: "#F59E0B",
    fontSize: 13,
    fontWeight: "900",
  },

  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f0dada",
    elevation: 2,
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  infoIcon: {
    fontSize: 23,
    marginRight: 14,
  },

  infoTextBox: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "700",
  },

  infoValue: {
    marginTop: 3,
    fontSize: 15,
    color: "#111827",
    fontWeight: "900",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },

  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f0dada",
    elevation: 2,
    marginBottom: 18,
  },

  progressItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  progressDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#d1d5db",
    marginRight: 14,
  },

  activeDot: {
    backgroundColor: "#ef233c",
  },

  progressTextBox: {
    flex: 1,
  },

  progressTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },

  progressTime: {
    marginTop: 3,
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },

  responseCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f0dada",
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  responseTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  responseSub: {
    marginTop: 4,
    fontSize: 13,
    color: "#555",
    fontWeight: "600",
  },

  countBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#ef233c",
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },

  donorCard: {
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f0dada",
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff0f2",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#ef233c",
    fontSize: 20,
    fontWeight: "900",
  },

  donorInfo: {
    flex: 1,
    marginLeft: 12,
  },

  donorName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },

  donorMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#555",
    fontWeight: "600",
  },

  availableText: {
    color: "#22C55E",
    fontSize: 12,
    fontWeight: "900",
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },

  secondaryButton: {
    flex: 1,
    height: 52,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ef233c",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryText: {
    color: "#ef233c",
    fontSize: 15,
    fontWeight: "900",
  },

  trackButton: {
    marginTop: 14,
    height: 56,
    backgroundColor: "#ef233c",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 35,
  },

  trackText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
});