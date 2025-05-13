"use client"
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native"
import { useTheme } from "../context/ThemeContext"

interface Phone {
  id: string
  name: string
  brand: string
  image: string
  description: string
}

interface PhoneCardProps {
  phone: Phone
  onPress: () => void
}

export default function PhoneCard({ phone, onPress }: PhoneCardProps) {
  const { theme } = useTheme()

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.cardBackground }]} onPress={onPress}>
      <Image source={{ uri: phone.image }} style={styles.image} resizeMode="contain" />
      <View style={styles.content}>
        <Text style={[styles.brand, { color: theme.textSecondary }]}>{phone.brand}</Text>
        <Text style={[styles.name, { color: theme.text }]}>{phone.name}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
          {phone.description}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  brand: {
    fontSize: 14,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
})
