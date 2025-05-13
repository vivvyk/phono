"use client"

import { useEffect, useState } from "react"
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { getAllTransactions, type Transaction } from "../supabase/getView"

export default function TransactionsScreen({ navigation }) {
  const { theme } = useTheme()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const data = await getAllTransactions()
      setTransactions(data || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTransactionPress = (transaction) => {
    navigation.navigate("TransactionSummary", { transaction })
  }

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case "food":
        return "restaurant-outline"
      case "transport":
        return "car-outline"
      case "entertainment":
        return "film-outline"
      case "shopping":
        return "cart-outline"
      default:
        return "apps-outline"
    }
  }

  // Group transactions by date
  const groupTransactionsByDate = (transactions) => {
    const grouped = {}

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transaction_datetime)
      const dateString = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })

      if (!grouped[dateString]) {
        grouped[dateString] = []
      }

      grouped[dateString].push(transaction)
    })

    return grouped
  }

  const groupedTransactions = groupTransactionsByDate(transactions)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Transactions</Text>
        <View style={{ width: 24 }} /> {/* Empty view for spacing */}
      </View>

      <ScrollView style={styles.scrollContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading transactions...</Text>
          </View>
        ) : Object.keys(groupedTransactions).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No transactions found</Text>
          </View>
        ) : (
          Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
            <View key={date}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{date}</Text>
              </View>
              <View style={styles.transactionsContainer}>
                {dateTransactions
                  .sort((a, b) => new Date(b.transaction_datetime) - new Date(a.transaction_datetime))
                  .map((transaction) => {
                    const isReceived = transaction.direction === "inbound"
                    const amountPrefix = isReceived ? "+" : "-"
                    const typeColor = isReceived ? "#0EA5E9" : "#F472B6"
                    const counterparty = transaction.counterparty_name || "Someone"

                    // Extract initials
                    const getInitials = (name) => {
                      if (!name) return "?"
                      const words = name.trim().split(" ")
                      return words.length === 1 ? words[0][0].toUpperCase() : (words[0][0] + words[1][0]).toUpperCase()
                    }

                    const colors = [
                      "#EC4899",
                      "#06B6D4",
                      "#0EA5E9",
                      "#F472B6",
                      "#22D3EE",
                      "#3B82F6",
                      "#6366F1",
                      "#A78BFA",
                    ]

                    const getColorForCategory = (category) => {
                      if (!category) return "#6B7280" // fallback gray
                      let hash = 0
                      for (let i = 0; i < category.length; i++) {
                        hash = category.charCodeAt(i) + ((hash << 5) - hash)
                      }
                      return colors[Math.abs(hash) % colors.length]
                    }

                    const initials = getInitials(counterparty)
                    const avatarColor = getColorForCategory(transaction.category) || "#6B7280"

                    return (
                      <TouchableOpacity
                        key={transaction.transaction_id}
                        style={styles.transactionItem}
                        onPress={() => handleTransactionPress(transaction)}
                      >
                        <View style={styles.transactionLeftSection}>
                          {/* Type icon */}
                          <View style={styles.transactionIconContainer}>
                            <Ionicons
                              name={isReceived ? "add-circle" : "checkmark-circle"}
                              size={20}
                              color={typeColor}
                            />
                          </View>

                          {/* Avatar with initials */}
                          <View
                            style={[
                              styles.friendAvatar,
                              {
                                width: 40,
                                height: 40,
                                backgroundColor: avatarColor,
                                alignItems: "center",
                                justifyContent: "center",
                              },
                            ]}
                          >
                            <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 14 }}>{initials}</Text>
                          </View>

                          {/* Details */}
                          <View style={styles.transactionDetails}>
                            <Text style={[styles.transactionPerson, { color: theme.textSecondary }]}>
                              {isReceived ? `${counterparty} paid you` : `You paid ${counterparty}`}
                            </Text>

                            <View style={styles.transactionDescriptionRow}>
                              <Text style={[styles.transactionDescription, { color: theme.text }]}>
                                {transaction.description}
                              </Text>
                              {transaction.category && (
                                <View style={[styles.categoryBadge, { backgroundColor: avatarColor }]}>
                                  <Ionicons name={getCategoryIcon(transaction.category)} size={12} color="#FFFFFF" />
                                </View>
                              )}
                            </View>
                          </View>
                        </View>

                        {/* Amount */}
                        <Text style={isReceived ? styles.transactionAmountPositive : styles.transactionAmountNegative}>
                          {amountPrefix}${transaction.amount.toFixed(2)}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
              </View>
            </View>
          ))
        )}
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
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  transactionsContainer: {
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  transactionLeftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionIconContainer: {
    position: "absolute",
    left: -5,
    top: -5,
    zIndex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  friendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  transactionDetails: {
    marginLeft: 12,
  },
  transactionPerson: {
    fontSize: 14,
  },
  transactionDescriptionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 6,
  },
  categoryBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionAmountPositive: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
  },
  transactionAmountNegative: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#EF4444",
  },
})
