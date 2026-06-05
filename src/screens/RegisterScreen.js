import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function RegisterScreen({ navigation }) {
  const [selectedRole, setSelectedRole] = useState("Donor");
  const [agreed, setAgreed] = useState(false);

  const roles = ["Donor", "Patient", "Hospital", "NGO"];
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const handleCreateAccount = () => {
  if (selectedRole === "Patient") {
    navigation.replace("PatientHome");
  } else if (selectedRole === "Hospital") {
    navigation.replace("HospitalHome");
  }else if (selectedRole === "Donor") {
    navigation.replace("DonorHome");
  } else {
    alert(`${selectedRole} module will be added soon`);
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff7f7" />

     <TouchableOpacity
  style={styles.backButton}
  onPress={() => navigation.goBack()}
>
  <Text style={styles.backText}>‹</Text>
</TouchableOpacity>
      <Image
        source={require("../../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join PulseAid today</Text>

      <View style={styles.form}>
        <TextInput placeholder="First Name" placeholderTextColor="#8b8b8b" style={styles.input} />
        <TextInput placeholder="Last Name" placeholderTextColor="#8b8b8b" style={styles.input} />
        <TextInput placeholder="Email" placeholderTextColor="#8b8b8b" style={styles.input} />
        <TextInput placeholder="Phone Number" placeholderTextColor="#8b8b8b" keyboardType="phone-pad" style={styles.input} />

        <Text style={styles.sectionTitle}>Blood Group</Text>
        <View style={styles.bloodGrid}>
          {bloodGroups.map((group) => (
            <TouchableOpacity key={group} style={styles.bloodChip}>
              <Text style={styles.bloodText}>{group}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Register As</Text>
        <View style={styles.roleGrid}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleChip,
                selectedRole === role && styles.activeRoleChip,
              ]}
              onPress={() => setSelectedRole(role)}
            >
              <Text
                style={[
                  styles.roleText,
                  selectedRole === role && styles.activeRoleText,
                ]}
              >
                {role}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput placeholder="Password" placeholderTextColor="#8b8b8b" secureTextEntry style={styles.input} />
        <TextInput placeholder="Confirm Password" placeholderTextColor="#8b8b8b" secureTextEntry style={styles.input} />

        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAgreed(!agreed)}
        >
          <View style={[styles.checkbox, agreed && styles.checkedBox]}>
            {agreed && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>I agree to the Terms & Conditions</Text>
        </TouchableOpacity>

        <TouchableOpacity
  style={styles.signupButton}
  onPress={handleCreateAccount}
>
          <Text style={styles.signupButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.loginRow}>
  <Text style={styles.loginText}>Already have an account? </Text>

  <TouchableOpacity onPress={() => navigation.navigate("Login")}>
    <Text style={styles.loginLink}>Login</Text>
  </TouchableOpacity>
</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff7f7",
    paddingHorizontal: 24,
    alignItems: "center",
    paddingBottom: 35,
  },

  backButton: {
    position: "absolute",
    top: 38,
    left: 18,
    zIndex: 20,
  },

  backText: {
    fontSize: 38,
    color: "#111827",
    fontWeight: "500",
  },

  logo: {
    width: 100,
    height: 100,
    marginTop: 38,
  },

  title: {
    marginTop: 6,
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },

  form: {
    width: "100%",
    marginTop: 24,
  },

  input: {
    width: "100%",
    height: 56,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eadede",
    paddingHorizontal: 18,
    fontSize: 16,
    color: "#111827",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
    marginTop: 2,
  },

  bloodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },

  bloodChip: {
    width: "22%",
    height: 42,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0dada",
    alignItems: "center",
    justifyContent: "center",
  },

  bloodText: {
    color: "#ef233c",
    fontSize: 15,
    fontWeight: "900",
  },

  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },

  roleChip: {
    width: "47%",
    height: 46,
    backgroundColor: "#fff",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#f0dada",
    alignItems: "center",
    justifyContent: "center",
  },

  activeRoleChip: {
    backgroundColor: "#ef233c",
    borderColor: "#ef233c",
  },

  roleText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
  },

  activeRoleText: {
    color: "#fff",
  },

  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 20,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#ef233c",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  checkedBox: {
    backgroundColor: "#ef233c",
  },

  checkMark: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },

  termsText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },

  signupButton: {
    height: 60,
    backgroundColor: "#ef233c",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  signupButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },

  loginText: {
    marginTop: 28,
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
loginRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 28,
},
  loginLink: {
    color: "#ef233c",
    fontWeight: "900",
  },
});