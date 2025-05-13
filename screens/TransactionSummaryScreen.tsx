"use client"
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

const TransactionSummaryScreen = ({ navigation, route }) => {
  const { theme } = useTheme()

  // Create a safe default transaction object
  const defaultTransaction = {
    amount: 0,
    category: "",
    counterparty_handle: "",
    counterparty_name: "Unknown",
    description: "",
    destination_user_id: "",
    direction: "outbound",
    origin_user_id: "",
    status: "complete",
    transaction_datetime: "",
    transaction_id: "0"
  }

  // Use the specified pattern to get the transaction
  const transaction = route && route.params && route.params.transaction ? route.params.transaction : defaultTransaction

  // Format date from ISO string
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "food":
        return "restaurant-outline"
      case "transportation":
        return "car-outline"
      case "entertainment":
        return "film-outline"
      case "shopping":
        return "cart-outline"
      default:
        return "apps-outline"
    }
  }

  // Colors for categories
  const colors = ["#EC4899", "#06B6D4", "#0EA5E9", "#F472B6", "#22D3EE", "#3B82F6", "#6366F1", "#A78BFA"]

  const getColorForCategory = (category) => {
    if (!category) return "#6B7280" // fallback gray
    let hash = 0
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }
  
  // Get category name with proper formatting
  const getCategoryName = (category) => {
    if (!category) return "Uncategorized"
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  // Determine if transaction is received or sent
  const isReceived = transaction.direction === "inbound"

  // Get counterparty color (deterministic based on handle)
  const getCounterpartyColor = (handle) => {
    if (!handle) return "#6366F1"
    let hash = 0
    for (let i = 0; i < handle.length; i++) {
      hash = handle.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Transaction</Text>
        <View style={{ width: 24 }} /> {/* Empty view for spacing */}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Transaction Status */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIconContainer,
              {
                backgroundColor: isReceived ? "#10B981" : "#6366F1",
              },
            ]}
          >
            <Ionicons
              name={isReceived ? "arrow-down" : "arrow-up"}
              size={24}
              color="#FFFFFF"
            />
          </View>

          <Text style={[styles.statusText, { color: theme.text }]}>
            {transaction.description || (isReceived ? "Payment Received" : "Payment Sent")}
          </Text>

          <Text style={[styles.amountText, { color: isReceived ? "#10B981" : "#EF4444" }]}>
            {isReceived ? "+" : "-"} ${transaction.amount}
          </Text>

          {/* Category badge removed as requested */}
        </View>

        {/* Transaction Details Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Details</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {transaction.status === "complete" ? "Completed" : transaction.status}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Date</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {formatDate(transaction.transaction_datetime)}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Type</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {isReceived ? "Payment Received" : "Payment Sent"}
            </Text>
          </View>

          {/* Category detail item */}
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Category</Text>
            {transaction.category ? (
              <View style={[styles.detailCategoryBadge, { backgroundColor: getColorForCategory(transaction.category) }]}>
                <Ionicons
                  name={getCategoryIcon(transaction.category)}
                  size={14}
                  color="#FFFFFF"
                  style={styles.detailCategoryIcon}
                />
                <Text style={styles.detailCategoryText}>{getCategoryName(transaction.category)}</Text>
              </View>
            ) : (
              <Text style={[styles.detailValue, { color: theme.text }]}>Uncategorized</Text>
            )}
          </View>
        </View>

        {/* Person Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {isReceived ? "From" : "To"}
            </Text>
          </View>

          <View style={styles.personContainer}>
            <View style={[styles.personAvatar, { backgroundColor: getCounterpartyColor(transaction.counterparty_handle) }]}>
              <Ionicons name="person" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.personDetails}>
              <Text style={[styles.personName, { color: theme.text }]}>{transaction.counterparty_name}</Text>
              <Text style={[styles.personHandle, { color: theme.textSecondary }]}>@{transaction.counterparty_handle}</Text>
            </View>
          </View>
        </View>

        {/* Action buttons section removed as requested */}
      </ScrollView>
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
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  amountText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
  },
  // Category container styles kept for reference but not used
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
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
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  statusBadge: {
    backgroundColor: "#10B981",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  detailCategoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  detailCategoryIcon: {
    marginRight: 4,
  },
  detailCategoryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  personContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  personAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  personHandle: {
    fontSize: 14,
  },
})

export default TransactionSummaryScreen