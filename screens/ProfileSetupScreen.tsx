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
import { createOrUpdateUserProfile } from "../authentication/auth"

export default function ProfileSetupScreen({ navigation }) {
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [handle, setHandle] = useState("")
  const nameInputRef = useRef(null)
  const roleInputRef = useRef(null)

  const generateHandle = (inputName) => {
    if (!inputName) return ""
    // Remove special characters, spaces, and make lowercase
    return inputName
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "")
      .substring(0, 15) // Limit length to 15 characters
  }

  const handleNext = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    if (!name.trim()) {
      alert("Please enter your name")
      nameInputRef.current?.focus()
      setIsSubmitting(false)
      return
    }

    if (!role.trim()) {
      alert("Please enter your role")
      roleInputRef.current?.focus()
      setIsSubmitting(false)
      return
    }

    try {
      await createOrUpdateUserProfile({
        name: name.trim(),
        role: role.trim(),
        handle: handle.trim(), // You must have this as state
      })

      InteractionManager.runAfterInteractions(() => {
        navigation.navigate("Home")
      })
    } catch (error) {
      alert("Error saving profile: " + error.message)
      console.error("Profile save error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    navigation.goBack()
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
                <Text style={styles.headerTitle}>Complete Your Profile</Text>
                <View style={styles.placeholder} />
              </View>

              <View style={styles.content}>
                <Text style={styles.description}>Tell us a bit about yourself</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput
                    ref={nameInputRef}
                    style={styles.textInput}
                    placeholder="Enter your name"
                    placeholderTextColor="#FFFFFF80"
                    value={name}
                    onChangeText={(text) => {
                      setName(text)
                      setHandle(generateHandle(text))
                    }}
                    autoFocus
                    returnKeyType="next"
                    onSubmitEditing={() => roleInputRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                  {name && (
                    <Text style={styles.handleText} accessibilityLabel={`Your handle is @${handle}`}>
                      @{handle}
                    </Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Role</Text>
                  <TextInput
                    ref={roleInputRef}
                    style={styles.textInput}
                    placeholder="Enter your role (e.g., Student, Professional)"
                    placeholderTextColor="#FFFFFF80"
                    value={role}
                    onChangeText={setRole}
                    returnKeyType="done"
                    onSubmitEditing={handleNext}
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              <View style={styles.bottomContent}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.nextButton, (!name.trim() || !role.trim() || isSubmitting) && styles.disabledButton]}
                  onPress={handleNext}
                  disabled={!name.trim() || !role.trim() || isSubmitting}
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
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  textInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#FFFFFF",
  },
  roleSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  roleSelectorText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  rolePlaceholder: {
    color: "#FFFFFF80",
  },
  rolePickerContainer: {
    backgroundColor: "rgba(10, 26, 42, 0.95)",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  roleItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  roleItemText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  selectedRoleText: {
    color: "#00ACC1",
    fontWeight: "500",
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
  handleText: {
    fontSize: 14,
    color: "#00ACC1",
    marginTop: 4,
    marginLeft: 2,
  },
})
