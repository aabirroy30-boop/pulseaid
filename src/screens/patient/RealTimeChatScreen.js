import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";

export default function RealTimeChatScreen({ navigation }) {
  const [message, setMessage] = useState("");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff7f7" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>R</Text>
          </View>
          <View>
            <Text style={styles.name}>Rahul Sharma</Text>
            <Text style={styles.status}>Online</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.callButton}>
          <Text style={styles.callText}>☎</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.chatBox} showsVerticalScrollIndicator={false}>
        <View style={styles.receiverBubble}>
          <Text style={styles.receiverText}>Yes, I'm available.</Text>
          <Text style={styles.time}>10:31 AM</Text>
        </View>

        <View style={styles.senderBubble}>
          <Text style={styles.senderText}>
            Hello Rahul, are you available to donate?
          </Text>
          <Text style={styles.senderTime}>10:32 AM</Text>
        </View>

        <View style={styles.receiverBubble}>
          <Text style={styles.receiverText}>Ok, on my way.</Text>
          <Text style={styles.time}>10:34 AM</Text>
        </View>

        <View style={styles.senderBubble}>
          <Text style={styles.senderText}>
            Great! Please start your journey.
          </Text>
          <Text style={styles.senderTime}>10:35 AM</Text>
        </View>
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Type a message..."
          placeholderTextColor="#8b8b8b"
          style={styles.input}
          value={message}
          onChangeText={setMessage}
        />

        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
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
    backgroundColor: "#fff7f7",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0dada",
  },

  backText: {
    fontSize: 36,
    color: "#111827",
    fontWeight: "500",
    marginRight: 12,
  },

  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ef233c",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },

  name: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },

  status: {
    fontSize: 12,
    color: "#22C55E",
    fontWeight: "700",
    marginTop: 2,
  },

  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ef233c",
    alignItems: "center",
    justifyContent: "center",
  },

  callText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "900",
  },

  chatBox: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
  },

  senderBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#ef233c",
    borderRadius: 18,
    borderTopRightRadius: 4,
    padding: 14,
    maxWidth: "75%",
    marginBottom: 16,
  },

  senderText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  senderTime: {
    color: "#ffe3e6",
    fontSize: 11,
    alignSelf: "flex-end",
    marginTop: 6,
  },

  receiverBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 18,
    borderTopLeftRadius: 4,
    padding: 14,
    maxWidth: "75%",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eadede",
  },

  receiverText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
  },

  time: {
    color: "#6b7280",
    fontSize: 11,
    alignSelf: "flex-end",
    marginTop: 6,
  },

  inputRow: {
    height: 78,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0dada",
  },

  input: {
    flex: 1,
    height: 50,
    backgroundColor: "#fff7f7",
    borderRadius: 25,
    paddingHorizontal: 18,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#eadede",
  },

  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ef233c",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  sendText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },
});