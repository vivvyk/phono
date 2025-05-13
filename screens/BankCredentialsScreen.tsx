"use client"

import { useState, useRef } from "react"
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"

export default function BankCredentialsScreen() {
  const navigation = useNavigation()
  const route = useRoute()

  // Safely access the bank parameter with a default value
  const bank = route.params?.bank || "BBVA"

  const [routingNumber, setRoutingNumber] = useState("123456789") // Pre-filled for testing
  const [accountNumber, setAccountNumber] = useState("987654321") // Pre-filled for testing
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("987654321") // Pre-filled for testing

  // Create refs for TextInputs to handle focus
  const accountNumberRef = useRef(null)
  const confirmAccountNumberRef = useRef(null)

  const handleBack = () => {
    navigation.goBack()
  }

  const handleContinue = () => {
    // Simple navigation to Home screen
    navigation.navigate("Home")
  }

  // Get bank logo based on selected bank
  const getBankLogo = () => {
    switch (bank) {
      case "BBVA":
        return (
          <View style={styles.bbvaLogo}>
            <Text style={styles.bbvaLogoText}>BBVA</Text>
          </View>
        )
      case "Banorte":
        return (
          <View style={[styles.bankLogo, { backgroundColor: "#EC1C24" }]}>
            <Text style={styles.bankLogoText}>B</Text>
          </View>
        )
      case "Banco Azteca":
        return (
          <View style={[styles.bankLogo, { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DDDDDD" }]}>
            <Text style={[styles.bankLogoText, { color: "#000000" }]}>BA</Text>
          </View>
        )
      default:
        return (
          <View style={[styles.bankLogo, { backgroundColor: "#004481" }]}>
            <Text style={styles.bankLogoText}>BANK</Text>
          </View>
        )
    }
  }

  const isFormValid = routingNumber && accountNumber && confirmAccountNumber && accountNumber === confirmAccountNumber

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <View style={styles.content}>
          <View style={styles.topSection}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>

            <View style={styles.spacer} />

            {getBankLogo()}

            <Text style={styles.title}>Connect to {bank}</Text>
            <Text style={styles.subtitle}>Set up your bank to send money instantly.</Text>

            <View style={styles.inputsContainer}>
              <TextInput
                style={styles.input}
                placeholder="Routing Number"
                placeholderTextColor="#888888" // Darker placeholder text
                value={routingNumber}
                onChangeText={setRoutingNumber}
                keyboardType="number-pad"
                returnKeyType="next"
                onSubmitEditing={() => accountNumberRef.current?.focus()}
                blurOnSubmit={false}
              />

              <TextInput
                ref={accountNumberRef}
                style={styles.input}
                placeholder="Account Number"
                placeholderTextColor="#888888" // Darker placeholder text
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="number-pad"
                returnKeyType="next"
                onSubmitEditing={() => confirmAccountNumberRef.current?.focus()}
                blurOnSubmit={false}
              />

              <TextInput
                ref={confirmAccountNumberRef}
                style={styles.input}
                placeholder="Confirm Account Number"
                placeholderTextColor="#888888" // Darker placeholder text
                value={confirmAccountNumber}
                onChangeText={setConfirmAccountNumber}
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={() => {
                  Keyboard.dismiss()
                  if (isFormValid) {
                    handleContinue()
                  }
                }}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.continueButton, isFormValid ? styles.validButton : styles.disabledButton]}
            onPress={handleContinue}
            disabled={!isFormValid}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  backButton: {
    padding: 4,
  },
  spacer: {
    height: 24, // Added spacer between back button and bank logo
  },
  topSection: {
    alignItems: "flex-start",
  },
  bbvaLogo: {
    width: 80,
    height: 80,
    backgroundColor: "#004481",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  bbvaLogoText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  bankLogo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  bankLogoText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000000",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 32,
  },
  inputsContainer: {
    width: "100%",
    marginTop: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 50,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: "#000000", // Ensure text is dark
  },
  continueButton: {
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    width: "100%",
  },
  disabledButton: {
    backgroundColor: "#BBBBBB",
    opacity: 0.8,
  },
  validButton: {
    backgroundColor: "#007AFF", // Blue color when form is valid
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
})
