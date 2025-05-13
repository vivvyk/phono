"use client"
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

interface ButtonProps {
  title: string
  onPress: () => void
  icon?: string
  loading?: boolean
  disabled?: boolean
  variant?: "primary" | "secondary"
  size?: "small" | "medium" | "large"
}

export default function Button({
  title,
  onPress,
  icon,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "medium",
}: ButtonProps) {
  const { theme } = useTheme()

  const getBackgroundColor = () => {
    if (disabled) return theme.disabled
    if (variant === "secondary") return "transparent"
    return theme.accent
  }

  const getTextColor = () => {
    if (disabled) return theme.textDisabled
    if (variant === "secondary") return theme.accent
    return "#FFFFFF"
  }

  const getBorderColor = () => {
    if (variant === "secondary") return theme.accent
    return "transparent"
  }

  const getHeight = () => {
    switch (size) {
      case "small":
        return 36
      case "large":
        return 56
      default:
        return 48
    }
  }

  const getFontSize = () => {
    switch (size) {
      case "small":
        return 14
      case "large":
        return 18
      default:
        return 16
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          height: getHeight(),
        },
        variant === "secondary" && styles.secondaryButton,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && (
            <Ionicons name={icon} size={size === "small" ? 16 : 20} color={getTextColor()} style={styles.icon} />
          )}
          <Text style={[styles.text, { color: getTextColor(), fontSize: getFontSize() }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
  },
  secondaryButton: {
    backgroundColor: "transparent",
  },
  text: {
    fontWeight: "600",
  },
  icon: {
    marginRight: 8,
  },
})
