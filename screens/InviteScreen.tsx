"use client"

import { useState } from "react"
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

export default function InviteScreen({ navigation }) {
  const { theme } = useTheme()
  const [contactInput, setContactInput] = useState("")

  const handleSendInvite = () => {
    if (!contactInput.trim()) {
      Alert.alert("Error", "Please enter an email, phone number, or handle")
      return
    }

    // Simulate sending invitation
    Alert.alert("Success", `Invitation sent to ${contactInput}`)
    setContactInput("")
  }

  const handleShareVia = (platform) => {
    Alert.alert("Share", `Sharing via ${platform}`)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Invite Friends</Text>
        <View style={{ width: 24 }} /> {/* Empty view for spacing */}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.sendInviteContainer}>
            <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Invite a Friend</Text>
              <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
                Send an invitation to your friends to join Phono
              </Text>

              <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
                <Ionicons name="person-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Email, phone, or handle"
                  placeholderTextColor={theme.textSecondary}
                  value={contactInput}
                  onChangeText={setContactInput}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: "#00BCD4" }]}
                onPress={handleSendInvite}
              >
                <Text style={styles.sendButtonText}>Send Invitation</Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                <Text style={[styles.dividerText, { color: theme.textSecondary }]}>or share via</Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              </View>

              <View style={styles.socialIconsContainer}>
                <TouchableOpacity
                  style={[styles.socialIconButton, { backgroundColor: "#25D366" }]}
                  onPress={() => handleShareVia("WhatsApp")}
                >
                  <Ionicons name="logo-whatsapp" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialIconButton, { backgroundColor: "#0088cc" }]}
                  onPress={() => handleShareVia("Telegram")}
                >
                  <Ionicons name="paper-plane" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialIconButton, { backgroundColor: "#000000" }]}
                  onPress={() => handleShareVia("X")}
                >
                  <Text style={styles.xLogo}>𝕏</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  sendInviteContainer: {},
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  sendButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialIconsContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  socialIconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
  },
  xLogo: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
})