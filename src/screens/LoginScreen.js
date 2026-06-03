import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff7f7" />

      <TouchableOpacity style={styles.backButton}>
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>

      <Image
        source={require("../../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Email or Phone"
          placeholderTextColor="#8b8b8b"
          style={styles.input}
        />

        <View style={styles.passwordBox}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#8b8b8b"
            secureTextEntry
            style={styles.passwordInput}
          />
          <Text style={styles.eye}>👁</Text>
        </View>

        <TouchableOpacity>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
  style={styles.loginButton}
  onPress={() => navigation.navigate("PatientHome")}
>
  <Text style={styles.loginText}>Login</Text>
</TouchableOpacity>
      </View>

      <View style={styles.dividerBox}>
        <View style={styles.line} />
        <Text style={styles.orText}>or continue with</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialButton}>
          <Image
            source={require("../../assets/google.png")}
            style={styles.socialIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <Image
            source={require("../../assets/Facebook.png")}
            style={styles.socialIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.signupRow}>
  <Text style={styles.signupText}>
    Don't have an account?
  </Text>

  <TouchableOpacity
    onPress={() => navigation.navigate("Register")}
  >
    <Text style={styles.signupLink}>
      Sign Up
    </Text>
  </TouchableOpacity>
</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff7f7",
    paddingHorizontal: 24,
    alignItems: "center",
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
    width: 118,
    height: 118,
    marginTop: 48,
  },

  title: {
    marginTop: 10,
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    marginTop: 7,
    fontSize: 17,
    color: "#111827",
    fontWeight: "500",
  },

  form: {
    width: "100%",
    marginTop: 30,
  },

  input: {
    width: "100%",
    height: 60,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eadede",
    paddingHorizontal: 18,
    fontSize: 17,
    color: "#111827",
    marginBottom: 16,
  },

  passwordBox: {
    width: "100%",
    height: 60,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eadede",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 18,
    fontSize: 17,
    color: "#111827",
  },

  eye: {
    fontSize: 18,
    color: "#9ca3af",
    marginRight: 16,
  },

  forgot: {
    alignSelf: "flex-end",
    color: "#ef233c",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 22,
  },

  loginButton: {
    height: 60,
    backgroundColor: "#ef233c",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ef233c",
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },

  loginText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },

  dividerBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    width: "100%",
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#eadede",
  },

  orText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },

  socialRow: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 28,
  marginTop: 24,
  marginBottom: 35,
},

  socialButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ececec",
    elevation: 3,
  },

  socialIcon: {
    width: 36,
    height: 36,
  },

 signupRow: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 35, // space after social icons
},

signupText: {
  fontSize: 15,
  color: "#111827",
  fontWeight: "500",
},

signupLink: {
  color: "#ef233c",
  fontWeight: "900",
  fontSize: 15,
  marginLeft: 4,
},
});