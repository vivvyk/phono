"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useMemo } from "react"
import { useColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Define theme types
const lightTheme = {
  dark: false,
  background: "#F9F9F9",
  cardBackground: "#FFFFFF",
  text: "#000000",
  textSecondary: "#666666",
  textDisabled: "#AAAAAA",
  accent: "#5E72E4",
  disabled: "#E0E0E0",
  border: "#EEEEEE",
}

const darkTheme = {
  dark: true,
  background: "#0A1622", // Dark blue background from the images
  cardBackground: "#162736", // Slightly lighter blue for cards/inputs
  text: "#FFFFFF",
  textSecondary: "#AAAAAA",
  textDisabled: "#666666",
  accent: "#00BCD4", // Teal accent color from the images
  disabled: "#333333",
  border: "#2A3A4A", // Darker border color that matches the theme
}

// Create context
type Theme = typeof lightTheme

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  toggleTheme: () => {},
})

// Theme provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme()
  const [themeMode, setThemeMode] = useState("system")

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem("themeMode")
        if (savedThemeMode) {
          setThemeMode(savedThemeMode)
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error)
      }
    }

    loadThemePreference()
  }, [])

  // Save theme preference when it changes
  useEffect(() => {
    const saveThemePreference = async () => {
      try {
        await AsyncStorage.setItem("themeMode", themeMode)
      } catch (error) {
        console.error("Failed to save theme preference:", error)
      }
    }

    saveThemePreference()
  }, [themeMode])

  // Memoize the active theme to avoid triggering state updates during render
  const activeTheme = useMemo(() => {
    if (themeMode === "system") {
      return systemColorScheme === "dark" ? darkTheme : lightTheme
    }
    return themeMode === "dark" ? darkTheme : lightTheme
  }, [themeMode, systemColorScheme])

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setThemeMode((prevMode) => {
      if (prevMode === "system") {
        return systemColorScheme === "dark" ? "light" : "dark"
      }
      return prevMode === "dark" ? "light" : "dark"
    })
  }

  return (
    <ThemeContext.Provider value={{ theme: activeTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook to use the theme
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
