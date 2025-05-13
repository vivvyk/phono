"use client"

import { useState, useEffect } from "react"
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  InteractionManager,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import Svg, { Circle, Defs, RadialGradient, Stop, Path, Rect } from "react-native-svg"
import FloatingParticles from "../components/FloatingParticles"
import { verifyPhoneOtpAndRoute } from "../authentication/auth"
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field'

const CELL_COUNT = 6

export default function VerifyCodeScreen({ route, navigation }) {
  const { phoneNumber } = route.params
  const [value, setValue] = useState('')
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT })
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({ value, setValue })
  const [timer, setTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setCanResend(true)
    }
  }, [timer])

  useEffect(() => {
    // Focus the first cell when component mounts
    ref?.current?.focus();
  }, [ref])

  const handleVerify = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (value.length !== CELL_COUNT) {
      alert("Please enter the complete verification code");
      setIsSubmitting(false);
      return;
    }

    try {
      const nextScreen = await verifyPhoneOtpAndRoute(phoneNumber, value);

      InteractionManager.runAfterInteractions(() => {
        if (nextScreen === "Home") {
          navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          });
        } else {
          navigation.navigate("ProfileSetup");
        }
      });
    } catch (error) {
      console.error("Error verifying code:", error);
      alert("Invalid verification code. Please try again.");
      setIsSubmitting(false);
    }
  }

  const handleResendCode = () => {
    if (!canResend) return
    setTimer(30)
    setCanResend(false)
    alert("Verification code resent!")
  }

  const handleBack = () => {
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0A1A2A", "#102030", "#0A1A2A"]} style={styles.background}>
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
                <Text style={styles.headerTitle}>Verification Code</Text>
                <View style={styles.placeholder} />
              </View>

              <View style={styles.content}>
                <Text style={styles.description}>Enter the 6-digit code sent to {phoneNumber}</Text>

                <CodeField
                  ref={ref}
                  {...props}
                  value={value}
                  onChangeText={setValue}
                  cellCount={CELL_COUNT}
                  rootStyle={styles.codeInputContainer}
                  keyboardType="number-pad"
                  autoFocus
                  textContentType="oneTimeCode"
                  renderCell={({ index, symbol, isFocused }) => (
                    <View
                      key={index}
                      style={[styles.codeInput, isFocused && styles.focusCell]}
                      onLayout={getCellOnLayoutHandler(index)}
                    >
                      <Text style={styles.cellText}>{symbol || (isFocused ? <Cursor /> : null)}</Text>
                    </View>
                  )}
                />

                <TouchableOpacity style={styles.resendContainer} onPress={handleResendCode} disabled={!canResend}>
                  <Text style={[styles.resendText, !canResend && styles.resendTextDisabled]}>
                    {canResend ? "Resend code" : `Resend code in ${timer}s`}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.bottomContent}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.verifyButton, (value.length !== CELL_COUNT || isSubmitting) && styles.disabledButton]}
                  onPress={handleVerify}
                  disabled={value.length !== CELL_COUNT || isSubmitting}
                >
                  <Text style={styles.verifyButtonText}>{isSubmitting ? "Verifying..." : "Verify"}</Text>
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

      <Circle cx={width * 0.8} cy={height * 0.2} r={100} fill="url(#gradTeal)" />
      <Circle cx={width * 0.2} cy={height * 0.7} r={120} fill="url(#gradPink)" opacity={0.4} />

      <Path d={`M0,${height / 4} L${width},${height / 4}`} stroke="#FFFFFF" strokeWidth="0.3" opacity="0.05" />
      <Path d={`M0,${height / 2} L${width},${height / 2}`} stroke="#FFFFFF" strokeWidth="0.3" opacity="0.05" />
      <Path d={`M0,${(3 * height) / 4} L${width},${(3 * height) / 4}`} stroke="#FFFFFF" strokeWidth="0.3" opacity="0.05" />
      <Path d={`M${width / 4},0 L${width / 4},${height}`} stroke="#FFFFFF" strokeWidth="0.3" opacity="0.05" />
      <Path d={`M${width / 2},0 L${width / 2},${height}`} stroke="#FFFFFF" strokeWidth="0.3" opacity="0.05" />
      <Path d={`M${(3 * width) / 4},0 L${(3 * width) / 4},${height}`} stroke="#FFFFFF" strokeWidth="0.3" opacity="0.05" />

      <Rect x={width * 0.1} y={height * 0.3} width={30} height={2} rx={1} fill="#00ACC1" opacity={0.3} />
      <Rect x={width * 0.15} y={height * 0.32} width={15} height={2} rx={1} fill="#00ACC1" opacity={0.2} />
      <Rect x={width * 0.7} y={height * 0.6} width={40} height={2} rx={1} fill="#F8BBD0" opacity={0.3} />
      <Rect x={width * 0.75} y={height * 0.62} width={20} height={2} rx={1} fill="#F8BBD0" opacity={0.2} />
    </Svg>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, width: "100%", height: "100%" },
  backgroundDesign: { ...StyleSheet.absoluteFillObject },
  safeArea: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "space-between" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#FFFFFF" },
  placeholder: { width: 40 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: "center",
  },
  description: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.8,
    marginBottom: 30,
    textAlign: "center",
  },
  codeInputContainer: {
    marginTop: 20,
    width: 280,
    justifyContent: "space-between",
  },
  codeInput: {
    width: 45,
    height: 55,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  cellText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
  },
  focusCell: {
    borderColor: "#00ACC1",
    borderWidth: 2,
  },
  resendContainer: { marginTop: 10 },
  resendText: { color: "#00ACC1", fontSize: 16, fontWeight: "500" },
  resendTextDisabled: { opacity: 0.5 },
  bottomContent: { paddingHorizontal: 24, paddingBottom: 30 },
  verifyButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00ACC1",
    borderRadius: 50,
    paddingVertical: 16,
  },
  disabledButton: {
    backgroundColor: "rgba(0, 172, 193, 0.5)",
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})