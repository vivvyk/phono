"use client"

import { useEffect, useState, useCallback } from "react"
import { useFocusEffect } from "@react-navigation/native"
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  RefreshControl, // Import RefreshControl
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { getDashboard, type DashboardData } from "../supabase/getView"
import { useDashboardRealtime } from "../hooks/useDashboardRealTime"
import { resetBalance } from "@/supabase/queries/transfer"

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme()
  const [menuVisible, setMenuVisible] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  // Add refreshing state
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboard = async () => {
    const data = await getDashboard()
    console.log("dashboardData", data)
    setDashboardData(data)
    // Make sure to set refreshing to false when fetch completes
    setRefreshing(false)
  }

  // Add onRefresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchDashboard()
  }, [])

  useDashboardRealtime(() => {
    fetchDashboard()
  })

  useEffect(() => {
    fetchDashboard()
  }, [])

  // Run when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchDashboard()
    }, []),
  )

  const handlePayPress = () => {
    navigation.navigate("FriendSelection", { action: "pay" })
  }

  const handleRequestPress = () => {
    navigation.navigate("FriendSelection", { action: "request" })
  }

  const handleSplitPress = () => {
    navigation.navigate("SplitExpense")
  }

  const handleInvitePress = () => {
    navigation.navigate("Invite")
  }

  const handleSearchPress = () => {
    navigation.navigate("FriendSelection", { action: "pay" })
  }

  const handleFriendPress = (friend) => {
    // Create a friend object with the necessary data
    const friendData = {
      id: friend.user_id || Date.now().toString(),
      name: friend.name,
      color: friend.color,
      image: friend.image,
      handle: friend.handle || friend.name.toLowerCase().replace(/\s/g, ""),
    }

    // Navigate directly to payment screen with the selected friend
    navigation.navigate("Payment", { friend: friendData, action: "pay" })
  }

  const handleMenuPress = () => {
    setMenuVisible(true)
  }

  const handleMenuClose = () => {
    setMenuVisible(false)
  }

  const handleTransferPress = async () => {
    setMenuVisible(false)
    try {
      const success = await resetBalance()
      if (success) {
        alert("Successfully transferred to bank account")
        fetchDashboard() // Re-fetch dashboard data after successful transfer
      } else {
        alert("Failed to transfer to bank account")
      }
    } catch (error) {
      console.error("Error transferring to bank account:", error)
      alert("An error occurred while transferring to bank account")
    }
  }

  const handleInsightsPress = () => {
    setMenuVisible(false)
    navigation.navigate("Insights")
  }

  const handleTransactionPress = (transaction) => {
    navigation.navigate("TransactionSummary", { transaction })
  }

  const handleNotificationsPress = () => {
    navigation.navigate("Notifications")
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingTop: 60 }} // Add this line with a larger value
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#0EA5E9"]} // Android
          tintColor={theme.dark ? "#0EA5E9" : "#333333"} // iOS
          title="Pull to refresh..." // iOS
          titleColor={theme.textSecondary} // iOS
          progressViewOffset={60} // Add this line for Android
        />
      }
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View>
          <Text style={[styles.profileName, { color: theme.text }]}>{dashboardData?.name ?? ""}</Text>
          <Text style={[styles.profileSubtitle, { color: theme.textSecondary }]}>{dashboardData?.role ?? ""}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.notificationIcon} onPress={handleNotificationsPress}>
            {dashboardData?.unread_notifications_count && dashboardData.unread_notifications_count > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{dashboardData.unread_notifications_count}</Text>
              </View>
            )}
            <Ionicons name="notifications-outline" size={28} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileImageContainer} onPress={() => navigation.navigate("Profile")}>
            <Ionicons name="person-circle" size={50} color={theme.dark ? "#0EA5E9" : "#CCCCCC"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Rest of your component remains unchanged */}
      {/* Balance Card */}
      <View style={[styles.balanceCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.balanceHeader}>
          <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Your balance</Text>
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: theme.dark ? "#333333" : "#F5F5F5" }]}
            onPress={handleMenuPress}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.balanceAmount, { color: theme.text }]}>
          {dashboardData?.balance !== undefined
            ? new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(dashboardData.balance)
            : "$0.00"}
        </Text>

        <Text style={[styles.balanceChange, { color: dashboardData?.balance_change_last_day >= 0 ? "green" : "red" }]}>
          {dashboardData?.balance_change_last_day !== undefined
            ? `${
                dashboardData.balance_change_last_day >= 0 ? "+$" : "-$"
              }${Math.abs(dashboardData.balance_change_last_day).toFixed(2)} since yesterday`
            : ""}
        </Text>
      </View>

      {/* Menu Modal */}
      <Modal visible={menuVisible} transparent={true} animationType="fade" onRequestClose={handleMenuClose}>
        <TouchableOpacity style={styles.modalOverlay} onPress={handleMenuClose} activeOpacity={1}>
          <View
            style={[
              styles.menuContainer,
              {
                backgroundColor: theme.dark ? "#333333" : "#FFFFFF",
                top: 180, // Position below the balance card
                right: 20,
              },
            ]}
          >
            <TouchableOpacity style={styles.menuItem} onPress={handleTransferPress}>
              <Ionicons
                name="arrow-forward-circle-outline"
                size={20}
                color={theme.dark ? "#FFFFFF" : "#000000"}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, { color: theme.dark ? "#FFFFFF" : "#000000" }]}>Transfer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleInsightsPress}>
              <Ionicons
                name="bar-chart-outline"
                size={20}
                color={theme.dark ? "#FFFFFF" : "#000000"}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, { color: theme.dark ? "#FFFFFF" : "#000000" }]}>Insights</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handlePayPress}>
          <View style={[styles.actionIconContainer, { backgroundColor: theme.cardBackground }]}>
            <Ionicons name="paper-plane-outline" size={24} color={theme.textSecondary} />
          </View>
          <Text style={[styles.actionButtonText, { color: theme.textSecondary }]}>Pay</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleRequestPress}>
          <View style={[styles.actionIconContainer, { backgroundColor: theme.cardBackground }]}>
            <Ionicons name="refresh-outline" size={24} color={theme.textSecondary} />
          </View>
          <Text style={[styles.actionButtonText, { color: theme.textSecondary }]}>Request</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleSplitPress}>
          <View style={[styles.actionIconContainer, { backgroundColor: theme.cardBackground }]}>
            <Ionicons name="infinite-outline" size={24} color={theme.textSecondary} />
          </View>
          <Text style={[styles.actionButtonText, { color: theme.textSecondary }]}>Split</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleInvitePress}>
          <View style={[styles.actionIconContainer, { backgroundColor: theme.cardBackground }]}>
            <Ionicons name="add-outline" size={24} color={theme.textSecondary} />
          </View>
          <Text style={[styles.actionButtonText, { color: theme.textSecondary }]}>Invite</Text>
        </TouchableOpacity>
      </View>

      {/* Friends Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Friends</Text>
        <TouchableOpacity onPress={() => navigation.navigate("FriendSelection")}>
          <Text style={[styles.viewAllText, { color: theme.textSecondary }]}>View all Friends</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.friendsContainer}>
        {/* Search Shortcut */}
        <TouchableOpacity style={styles.friendItem} onPress={handleSearchPress}>
          <View style={[styles.friendAvatar, styles.searchAvatar, { borderColor: theme.border }]}>
            <Ionicons name="search" size={24} color={theme.textSecondary} />
          </View>
          <Text style={[styles.friendName, { color: theme.textSecondary }]}>Search</Text>
        </TouchableOpacity>

        {/* Dynamically Render Friends */}
        {dashboardData?.friends?.map((friend, index) => {
          const colors = [
            "#EC4899", // Electric Pink
            "#06B6D4", // Vibrant Cyan
            "#0EA5E9", // Bright Blue
            "#F472B6", // Light Pink
            "#22D3EE", // Sky Cyan
            "#3B82F6", // Soft Blue
            "#6366F1", // Indigo Blue
            "#A78BFA", // Lavender Blue
          ]
          const backgroundColor = colors[index % colors.length]

          return (
            <TouchableOpacity key={friend.user_id} style={styles.friendItem} onPress={() => handleFriendPress(friend)}>
              <View style={[styles.friendAvatar, { backgroundColor }]}>
                <Ionicons name="person" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.friendName, { color: theme.textSecondary }]}>{friend.name.split(" ")[0]}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* Transactions Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Today</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Transactions")}>
          <Text style={[styles.viewAllText, { color: theme.textSecondary }]}>View all Transactions</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.transactionsContainer}>
        {dashboardData?.recent_transactions
          ?.sort((a, b) => new Date(b.transaction_datetime) - new Date(a.transaction_datetime))
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

            // Before map:
            const colors = ["#EC4899", "#06B6D4", "#0EA5E9", "#F472B6", "#22D3EE", "#3B82F6", "#6366F1", "#A78BFA"]

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
                    <Ionicons name={isReceived ? "add-circle" : "checkmark-circle"} size={20} color={typeColor} />
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
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20, // Reduced from 60 to 20
    paddingBottom: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  profileSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationIcon: {
    marginRight: 16,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 16,
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 4,
  },
  balanceChange: {
    fontSize: 16,
    color: "#10B981",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuContainer: {
    position: "absolute",
    width: 150,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  menuIcon: {
    marginRight: 8,
  },
  menuText: {
    fontSize: 16,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionButton: {
    alignItems: "center",
    width: "22%",
  },
  actionIconContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  friendsContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  friendItem: {
    alignItems: "center",
    marginRight: 20,
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
  searchAvatar: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  friendName: {
    fontSize: 14,
  },
  transactionsContainer: {
    marginBottom: 24,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
})
