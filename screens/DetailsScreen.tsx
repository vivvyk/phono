"use client"
import { StyleSheet, View, Text, Image, ScrollView } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import Button from "../components/Button"

interface RouteParams {
  id: string
  title: string
  phone: {
    id: string
    name: string
    brand: string
    image: string
    description: string
  }
}

export default function DetailsScreen() {
  const route = useRoute<any, RouteParams>()
  const navigation = useNavigation()
  const { theme } = useTheme()
  const { phone } = route.params

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: phone.image }} style={styles.image} resizeMode="contain" />
      </View>

      <View style={styles.detailsContainer}>
        <Text style={[styles.brand, { color: theme.textSecondary }]}>{phone.brand}</Text>
        <Text style={[styles.name, { color: theme.text }]}>{phone.name}</Text>

        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>{phone.description}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Features</Text>
          <View style={styles.featureRow}>
            <FeatureItem
              icon="speedometer-outline"
              title="Performance"
              description="High-end processor"
              theme={theme}
            />
            <FeatureItem icon="camera-outline" title="Camera" description="Advanced lens system" theme={theme} />
          </View>
          <View style={styles.featureRow}>
            <FeatureItem
              icon="battery-charging-outline"
              title="Battery"
              description="All-day battery life"
              theme={theme}
            />
            <FeatureItem icon="hardware-chip-outline" title="Storage" description="Up to 1TB storage" theme={theme} />
          </View>
        </View>

        <Button title="Add to Cart" onPress={() => alert("Added to cart!")} icon="cart-outline" />
      </View>
    </ScrollView>
  )
}

interface FeatureItemProps {
  icon: string
  title: string
  description: string
  theme: any // Using 'any' for brevity, but ideally should use the proper theme type
}

function FeatureItem({ icon, title, description, theme }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.iconContainer, { backgroundColor: theme.accent + "20" }]}>
        <Ionicons name={icon} size={24} color={theme.accent} />
      </View>
      <Text style={[styles.featureTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>{description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 16,
  },
  detailsContainer: {
    flex: 1,
  },
  brand: {
    fontSize: 16,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  featureItem: {
    width: "48%",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
  },
})
