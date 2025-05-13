"use client"

import { useState } from "react"
import { TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import SettingsModal from "./SettingsModal"

const SettingsButton = ({ color }) => {
  const [modalVisible, setModalVisible] = useState(false)
  // Get theme from parent component's color prop
  const theme = {
    text: color,
    primary: "#6366F1", // Default primary color
    secondaryText: "gray",
    background: "#FFFFFF", // Default background
    card: "#FFFFFF", // Default card background
  }

  return (
    <>
      <TouchableOpacity style={{ padding: 8 }} onPress={() => setModalVisible(true)}>
        <Ionicons name="settings-outline" size={24} color={color} />
      </TouchableOpacity>

      <SettingsModal visible={modalVisible} onClose={() => setModalVisible(false)} theme={theme} />
    </>
  )
}

export default SettingsButton
