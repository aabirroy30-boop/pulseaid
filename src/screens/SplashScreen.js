import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  Image,
} from "react-native";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff6f6" />

      {/* Background Hearts */}
      <Text style={[styles.bgHeart, styles.h1]}>♡</Text>
      <Text style={[styles.bgHeart, styles.h2]}>♡</Text>
      <Text style={[styles.bgHeart, styles.h3]}>♡</Text>
      <Text style={[styles.bgHeart, styles.h4]}>♡</Text>

      {/* Logo + Title */}
      <View style={styles.logoSection}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>PulseAid</Text>
        <Text style={styles.subtitle}>Donate Blood, Save Lives</Text>
      </View>

      {/* Bottom Text */}
      <View style={styles.bottomTextBox}>
        <Text style={styles.smallHeart}>❤</Text>
        <Text style={styles.bottomText}>Every drop counts</Text>
      </View>

      {/* Bottom Wave */}
      <View style={styles.waveContainer}>
        <Svg height="190" width={width} viewBox={`0 0 ${width} 190`}>
          <Path
            d={`M0 55 C ${width * 0.25} 15, ${width * 0.45} 105, ${
              width * 0.68
            } 65 C ${width * 0.86} 35, ${width} 50, ${width} 50 L ${width} 190 L 0 190 Z`}
            fill="#ff4d5e"
          />

          <Path
            d={`M0 120 C ${width * 0.25} 45, ${width * 0.5} 115, ${
              width * 0.74
            } 72 C ${width * 0.9} 45, ${width} 70, ${width} 70 L ${width} 190 L 0 190 Z`}
            fill="#ef233c"
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff6f6",
    alignItems: "center",
    overflow: "hidden",
  },

  logoSection: {
    position: "absolute",
    top: height * 0.19,
    alignItems: "center",
  },

  logo: {
    width: 145,
    height: 145,
  },

  title: {
    marginTop: 6,
    fontSize: 46,
    fontWeight: "900",
    color: "#ef233c",
    letterSpacing: -1.2,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  bottomTextBox: {
    position: "absolute",
    bottom: height * 0.18,
    alignItems: "center",
    zIndex: 10,
  },

  smallHeart: {
    fontSize: 34,
    color: "#ef233c",
  },

  bottomText: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: "800",
    color: "#ef233c",
  },

  waveContainer: {
    position: "absolute",
    bottom: 0,
    width: width,
    height: 190,
  },

  bgHeart: {
    position: "absolute",
    color: "#ffdadd",
    fontSize: 38,
    opacity: 0.75,
  },

  h1: {
    top: 72,
    right: 56,
    fontSize: 42,
  },

  h2: {
    top: 150,
    left: 45,
    fontSize: 31,
  },

  h3: {
    top: height * 0.31,
    right: 45,
    fontSize: 30,
  },

  h4: {
    bottom: height * 0.29,
    left: 60,
    fontSize: 32,
  },
});