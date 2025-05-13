"use client"

import { useEffect, useState } from "react"
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { getNotifications, markNotificationAsRead } from "../supabase/getView"
import { respondToRequest } from "../supabase/queries/notifications"
import { useNotificationsRealTime } from "../hooks/useNotificationsRealTime"
export default function NotificationsScreen({ navigation }) {
  const { theme } = useTheme()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState([])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const data = await getNotifications()
      setNotifications(data || [])
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  useNotificationsRealTime(() => {
    fetchNotifications()
  })

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleNotificationPress = async (notification) => {
    if (notification.notification_status === "unread") {
      try {
        await markNotificationAsRead(notification.notification_id)
        // Update local state
        setNotifications(
          notifications.map((n) =>
            n.notification_id === notification.notification_id ? { ...n, notification_status: "read" } : n,
          ),
        )
      } catch (error) {
        console.error("Error marking notification as read:", error)
      }
    }
  }

  const handleRequestResponse = async (notificationId, response) => {
    setProcessingIds((prev) => [...prev, notificationId])

    try {
      await respondToRequest(notificationId, response)
      // Update local state - remove the notification
      setNotifications(notifications.filter((n) => n.notification_id !== notificationId))
    } catch (error) {
      console.error(`Error ${response}ing request:`, error)
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== notificationId))
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`

    return date.toLocaleDateString()
  }

  // Function to generate initials from a name
  const getInitials = (name) => {
    if (!name) return "?"
    const words = name.trim().split(" ")
    return words.length === 1 ? words[0][0].toUpperCase() : (words[0][0] + words[1][0]).toUpperCase()
  }

  // Function to get a consistent color based on a string
  const getColorForName = (name) => {
    if (!name) return "#6B7280" // Default gray

    const colors = [
      "#4F46E5", // Indigo
      "#7C3AED", // Violet
      "#EC4899", // Pink
      "#06B6D4", // Cyan
      "#10B981", // Emerald
      "#F59E0B", // Amber
      "#EF4444", // Red
      "#3B82F6", // Blue
    ]

    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }

    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.dark ? "#0F172A" : theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06B6D4" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No notifications yet</Text>
        </View>
      ) : (
        <ScrollView style={styles.notificationsList}>
          {notifications.map((notification) => {
            const isUnread = notification.notification_status === "unread"
            const isPaymentRequest = notification.notification_type === "payment_request"
            const isFriendRequest = notification.notification_type === "friend_request"
            const isProcessing = processingIds.includes(notification.notification_id)

            // Get sender name or fallback
            const senderName = notification.sender_name || "Someone"

            // Generate initials and color for avatar
            const initials = getInitials(senderName)
            const avatarColor = getColorForName(senderName)

            // Extract metadata if available
            const metadata = notification.notification_metadata || {}

            return (
              <TouchableOpacity
                key={notification.notification_id}
                style={[
                  styles.notificationItem,
                  { backgroundColor: isUnread ? theme.highlightBackground : theme.cardBackground },
                ]}
                onPress={() => handleNotificationPress(notification)}
                disabled={isProcessing}
              >
                <View style={styles.notificationContent}>
                  {/* Unread indicator */}
                  {isUnread && <View style={[styles.unreadIndicator, { backgroundColor: "#06B6D4" }]} />}

                  {/* User Avatar */}
                  <View style={[styles.avatarContainer, { backgroundColor: avatarColor }]}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>

                  {/* Notification details */}
                  <View style={styles.notificationDetails}>
                    <Text
                      style={[styles.notificationText, { color: theme.text, fontWeight: isUnread ? "600" : "400" }]}
                    >
                      {notification.notification_text}
                    </Text>

                    {notification.sender_handle && (
                      <Text style={[styles.handleText, { color: theme.textSecondary }]}>
                        @{notification.sender_handle}
                      </Text>
                    )}

                    <Text style={[styles.notificationTime, { color: theme.textSecondary }]}>
                      {formatDate(notification.notification_datetime)}
                    </Text>

                    {/* Action buttons for requests */}
                    {(isPaymentRequest || isFriendRequest) && !isProcessing && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.rejectButton}
                          onPress={() => handleRequestResponse(notification.notification_id, "reject")}
                        >
                          <Text style={styles.rejectButtonText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.acceptButton}
                          onPress={() => handleRequestResponse(notification.notification_id, "accept")}
                        >
                          <Text style={styles.acceptButtonText}>Accept</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Loading indicator when processing */}
                    {isProcessing && (
                      <View style={styles.processingContainer}>
                        <ActivityIndicator size="small" color="#06B6D4" />
                        <Text style={[styles.processingText, { color: theme.textSecondary }]}>Processing...</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerRight: {
    width: 40, // Balance the header
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  notificationItem: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationContent: {
    flexDirection: "row",
    position: "relative",
  },
  unreadIndicator: {
    position: "absolute",
    left: -8,
    top: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  notificationDetails: {
    flex: 1,
  },
  notificationText: {
    fontSize: 16,
    marginBottom: 4,
  },
  handleText: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 13,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "flex-end",
  },
  acceptButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#06B6D4", // Cyan color from screenshot
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  rejectButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Transparent white
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  processingText: {
    marginLeft: 8,
    fontSize: 14,
  },
})
