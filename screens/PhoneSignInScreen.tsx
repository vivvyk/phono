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
  ScrollView,
  InteractionManager,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import Svg, { Circle, Defs, RadialGradient, Stop, Path, Rect } from "react-native-svg"
import FloatingParticles from "../components/FloatingParticles"
import { sendPhoneOtp } from "../authentication/auth"

export default function PhoneSignInScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("+1")
  const [showCountryPicker, setShowCountryPicker] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const phoneInputRef = useRef(null)

  const countryCodes = [
    { code: "+1", country: "United States" },
    { code: "+52", country: "Mexico" },
  ]

  const handleNext = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return
    setIsSubmitting(true)

    // Validate phone number
    if (phoneNumber.length < 5) {
      alert("Please enter a valid phone number")
      setIsSubmitting(false)
      return
    }

    // Log the phone number to the console
    console.log("Phone number:", countryCode + phoneNumber)

    try {
      await sendPhoneOtp(countryCode + phoneNumber)

      // Use InteractionManager to ensure navigation happens after any animations/interactions
      InteractionManager.runAfterInteractions(() => {
        navigation.navigate("VerifyCode", {
          phoneNumber: countryCode + phoneNumber,
        })
      })
    } catch (error) {
      console.error("Error sending OTP:", error)
      alert("Failed to send verification code. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    navigation.goBack()
  }

  const selectCountryCode = (code) => {
    setCountryCode(code)
    setShowCountryPicker(false)
    // Focus back on the phone input after selecting country code
    if (phoneInputRef.current) {
      phoneInputRef.current.focus()
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0A1A2A", "#102030", "#0A1A2A"]} style={styles.background}>
        {/* Background design */}
        <View style={styles.backgroundDesign}>
          <BackgroundDesign />
          <FloatingParticles />
        </View>

        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
              <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Enter Phone Number</Text>
                <View style={styles.placeholder} />
              </View>

              <View style={styles.content}>
                <Text style={styles.description}>We'll send a verification code to your phone number</Text>

                <View style={styles.phoneInputContainer}>
                  <TouchableOpacity
                    style={styles.countryCodeButton}
                    onPress={() => setShowCountryPicker(!showCountryPicker)}
                  >
                    <Text style={styles.countryCodeText}>{countryCode}</Text>
                    <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
                  </TouchableOpacity>

                  <TextInput
                    ref={phoneInputRef}
                    style={styles.phoneInput}
                    placeholder="Phone number"
                    placeholderTextColor="#FFFFFF80"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleNext}
                    blurOnSubmit={false}
                  />
                </View>

                {showCountryPicker && (
                  <View style={styles.countryPickerContainer}>
                    {countryCodes.map((item) => (
                      <TouchableOpacity
                        key={item.code}
                        style={styles.countryItem}
                        onPress={() => selectCountryCode(item.code)}
                      >
                        <Text style={styles.countryItemText}>
                          {item.country} ({item.code})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.bottomContent}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.nextButton, (phoneNumber.length < 5 || isSubmitting) && styles.disabledButton]}
                  onPress={handleNext}
                  disabled={phoneNumber.length < 5 || isSubmitting}
                >
                  <Text style={styles.nextButtonText}>{isSubmitting ? "Processing..." : "Next"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  )
}

const BackgroundDesign = () => {
  const { width, height } =
    Platform.OS === "web"
      ? { width: window.innerWidth, height: window.innerHeight }
      : require("react-native").Dimensions.get("window")

  return (
    <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="gradTeal" cx="50%" cy="35%" rx="50%" ry="50%" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#00ACC1" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#00ACC1" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="gradPink" cx="50%" cy="35%" rx="50%" ry="50%" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#F8BBD0" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#F8BBD0" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Abstract shapes - one teal, one pink */}
      <Circle cx={width * 0.8} cy={height * 0.2} r={100} fill="url(#gradTeal)" />
      <Circle cx={width * 0.2} cy={height * 0.7} r={120} fill="url(#gradPink)" opacity={0.4} />

      {/* Subtle grid pattern */}
      <Path d={`M0,${height / 4} L${width},${height / 4}`} stroke="#FFFFFF" strokeWidth="0.3" opacity="0.05" />
      <Path d={`M0,${height / 2} L${width},${height / 2}`} stroke="#FFFFFF" strokeWidth="0.3" opacity="0.05" />
      <Path
        d={`M0,${(3 * height) / 4} L${width},${(3 * height) / 4}`}
        stroke="#FFFFFF"
        strokeWidth="0.3"
        opacity="0.05"
      />
      <Path d={`M${width / 4},0 L${width / 4},${height}`} stroke="#FFFFFF" strokeWidth="0.3" opacity="0.05" />
      <Path d={`M${width / 2},0 L${width / 2},${height}`} stroke="#FFFFFF" strokeWidth="0.3" opacity="0.05" />
      <Path
        d={`M${(3 * width) / 4},0 L${(3 * width) / 4},${height}`}
        stroke="#FFFFFF"
        strokeWidth="0.3"
        opacity="0.05"
      />

      {/* Decorative elements */}
      <Rect x={width * 0.1} y={height * 0.3} width={30} height={2} rx={1} fill="#00ACC1" opacity={0.3} />
      <Rect x={width * 0.15} y={height * 0.32} width={15} height={2} rx={1} fill="#00ACC1" opacity={0.2} />
      <Rect x={width * 0.7} y={height * 0.6} width={40} height={2} rx={1} fill="#F8BBD0" opacity={0.3} />
      <Rect x={width * 0.75} y={height * 0.62} width={20} height={2} rx={1} fill="#F8BBD0" opacity={0.2} />
    </Svg>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundDesign: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  description: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.8,
    marginBottom: 30,
    textAlign: "center",
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginRight: 10,
  },
  countryCodeText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginRight: 5,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#FFFFFF",
  },
  countryPickerContainer: {
    backgroundColor: "rgba(10, 26, 42, 0.95)",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  countryItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  countryItemText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  bottomContent: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  nextButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00ACC1",
    borderRadius: 50,
    paddingVertical: 16,
  },
  disabledButton: {
    backgroundColor: "rgba(0, 172, 193, 0.5)",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})
