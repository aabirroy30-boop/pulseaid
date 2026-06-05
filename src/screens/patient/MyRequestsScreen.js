import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function MyRequestsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff7f7" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Requests</Text>

        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
        <RequestCard
          navigation={navigation}
          bloodGroup="O+"
          units="2 Units"
          hospital="City Care Hospital"
          date="25 May 2025, 10:00 AM"
          status="Pending"
          statusColor="#F59E0B"
          bgColor="#FFF7E6"
          tag="Emergency"
        />

        <RequestCard
          navigation={navigation}
          bloodGroup="A+"
          units="1 Unit"
          hospital="Apollo Hospital"
          date="22 May 2025, 04:30 PM"
          status="Accepted"
          statusColor="#22C55E"
          bgColor="#E8F8EC"
          tag="Normal"
        />

        <RequestCard
          navigation={navigation}
          bloodGroup="B+"
          units="3 Units"
          hospital="AMRI Hospital"
          date="18 May 2025, 09:00 AM"
          status="Completed"
          statusColor="#2563EB"
          bgColor="#EAF2FF"
          tag="Emergency"
        />
      </ScrollView>
    </View>
  );
}

function RequestCard({
    navigation,
  bloodGroup,
  units,
  hospital,
  date,
  status,
  statusColor,
  bgColor,
  tag,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.bloodBox}>
          <Text style={styles.bloodText}>{bloodGroup}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.hospital}>{hospital}</Text>
          <Text style={styles.detail}>{units}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {status}
          </Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.date}>📅 {date}</Text>

        <View style={styles.tagBox}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      </View>

      <TouchableOpacity
  style={styles.trackButton}
  onPress={() => {
    if (status === "Accepted") {
      navigation.navigate("LiveTracking");
    }
  }}
>
  {status === "Pending" && (
    <>
      <Text style={styles.trackText}>
        Searching for nearby donors...
      </Text>
      <Text style={styles.trackSubText}>
        2 donors notified
      </Text>
    </>
  )}

  {status === "Accepted" && (
    <>
      <Text style={styles.trackText}>
        Donor Found: Rahul Sharma
      </Text>
      <Text style={styles.trackSubText}>
        ETA: 12 minutes
      </Text>
    </>
  )}

  {status === "Completed" && (
    <>
      <Text style={styles.trackText}>
        Request Successfully Completed
      </Text>
      <Text style={styles.trackSubText}>
        Thank you for saving lives ❤️
      </Text>
    </>
  )}
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
    fontSize: 24,
    fontWeight: "900",
  },

  infoBox: {
    flex: 1,
    marginLeft: 14,
  },

  hospital: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  detail: {
    marginTop: 4,
    fontSize: 13,
    color: "#555",
    fontWeight: "600",
  },

  statusBadge: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "900",
  },

  bottomRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  date: {
    fontSize: 13,
    color: "#555",
    fontWeight: "600",
  },

  tagBox: {
    backgroundColor: "#fff0f2",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
  },

  tagText: {
    color: "#ef233c",
    fontSize: 12,
    fontWeight: "900",
  },

  trackButton: {
  marginTop: 16,
  minHeight: 60,
  backgroundColor: "#ef233c",
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 10,
},

trackText: {
  color: "#fff",
  fontSize: 15,
  fontWeight: "900",
},

trackSubText: {
  color: "#ffe3e6",
  fontSize: 12,
  marginTop: 4,
  fontWeight: "600",
},
});