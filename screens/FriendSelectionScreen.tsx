"use client"

import { useState, useEffect } from "react"
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
  StatusBar,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { getFriends, type FriendEntry } from "../supabase/getView"
import { useFriendsRealtime } from "../hooks/useFriendsRealTime"
import { sendFriendRequest, rejectFriendRequest, acceptFriendRequest } from "../supabase/queries/friends"

// Avatar colors array
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

export default function FriendsScreen({ navigation, route }) {
  const { theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [newFriendHandle, setNewFriendHandle] = useState("")
  const [activeTab, setActiveTab] = useState("friends") // "friends" or "pending"
  const [pendingRequests, setPendingRequests] = useState<FriendEntry[]>([])
  const [friendsData, setFriendsData] = useState<FriendEntry[] | null>(null)
  
  // Get the action from route params (pay or request)
  const action = route.params?.action || "pay"

  const fetchFriends = async () => {
    const data = await getFriends()
    setFriendsData(data)
  }

  useEffect(() => {
    fetchFriends()
  }, [])

  useFriendsRealtime(() => {
    fetchFriends()
  })

  useEffect(() => {
    if (friendsData) {
      // Update pending requests based on relationship_type
      const pending = friendsData.filter((item) => item.relationship_type === "pending")
      setPendingRequests(pending)
    }
  }, [friendsData])

  const handleFriendSelect = (friend) => {
    navigation.navigate("Payment", {
      friend: {
        id: friend.other_user_id,
        name: friend.name,
        handle: friend.handle,
      },
      action: action, // Pass the action (pay or request) to the Payment screen
    })
  }

  const handleSendRequest = async () => {
    if (newFriendHandle.trim()) {
      // Remove @ sign from handle before sending request
      const cleanHandle = newFriendHandle.replace(/@/g, "")
      const { success, message } = await sendFriendRequest(cleanHandle)
      console.log(success ? "Success" : "Error", message)
      Alert.alert("Request Sent", `Friend request sent to @${cleanHandle}`)
      if (success) setNewFriendHandle("")
    }
  }

  const handleAcceptRequest = async (item: FriendEntry) => {
    if (!item.request_id) return

    const success = await acceptFriendRequest(
      item.request_id,
      item.other_user_id, // sender
      item.current_user_id, // receiver (current user)
    )

    if (success) {
      Alert.alert("Request Accepted", `You are now friends with @${item.handle}`)
      // Optionally refresh state here (e.g., re-fetch data or remove the accepted request from the list)
    }
  }

  const handleRejectRequest = async (friend: FriendEntry) => {
    const success = await rejectFriendRequest(friend.request_id)
    if (success) {
      Alert.alert("Request Rejected", `Rejected request from @${friend.handle}`)
      // Remove from pending requests
      setPendingRequests(pendingRequests.filter((req) => req.other_user_id !== friend.other_user_id))
    }
  }

  const renderFriendItem = ({ item }: { item: any }) => {
    // Generate a consistent color based on the user ID
    const colorIndex = item.other_user_id.charCodeAt(0) % colors.length
    const avatarColor = colors[colorIndex]

    return (
      <TouchableOpacity style={styles.friendItem} onPress={() => handleFriendSelect(item)}>
        <View style={[styles.friendAvatarFallback, { backgroundColor: avatarColor }]}>
          <Text style={styles.friendInitials}>
            {item.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")}
          </Text>
        </View>
        <View style={styles.friendInfo}>
          <Text style={[styles.friendName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.friendLabel, { color: theme.textSecondary }]}>@{item.handle}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  const renderPendingRequestItem = ({ item }: { item: any }) => {
    // Generate a consistent color based on the user ID
    const colorIndex = item.other_user_id.charCodeAt(0) % colors.length
    const avatarColor = colors[colorIndex]

    return (
      <View style={styles.pendingItem}>
        <View style={styles.pendingItemLeft}>
          <View style={[styles.friendAvatarFallback, { backgroundColor: avatarColor }]}>
            <Text style={styles.friendInitials}>
              {item.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </Text>
          </View>
          <View style={styles.friendInfo}>
            <Text style={[styles.friendName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.friendLabel, { color: theme.textSecondary }]}>@{item.handle}</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.rejectButton, { borderColor: theme.border }]}
            onPress={() => handleRejectRequest(item)}
          >
            <Text style={[styles.rejectButtonText, { color: theme.text }]}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.acceptButton, { backgroundColor: theme.accent }]}
            onPress={() => handleAcceptRequest(item)}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" />

        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {action === "pay" ? "Pay" : "Request"} Friends
          </Text>
          <View style={styles.headerRight} />
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.cardBackground }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search friends"
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "friends" && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab("friends")}
          >
            <Text style={[styles.tabText, { color: activeTab === "friends" ? theme.accent : theme.textSecondary }]}>
              Friends
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "pending" && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab("pending")}
          >
            <Text style={[styles.tabText, { color: activeTab === "pending" ? theme.accent : theme.textSecondary }]}>
              Pending Requests
            </Text>
            {pendingRequests.length > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.accent }]}>
                <Text style={styles.badgeText}>{pendingRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        <View style={{ flex: 1 }}>
          {activeTab === "friends" ? (
            <FlatList
              data={
                friendsData
                  ? friendsData
                      .filter((friend) => friend.relationship_type === "friend")
                      .filter(
                        (friend) =>
                          friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          friend.handle.toLowerCase().includes(searchQuery.toLowerCase()),
                      )
                  : []
              }
              keyExtractor={(item) => item.other_user_id}
              renderItem={renderFriendItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    {friendsData === null ? "Loading friends..." : "No friends found"}
                  </Text>
                </View>
              }
            />
          ) : (
            <FlatList
              data={pendingRequests}
              keyExtractor={(item) => item.other_user_id}
              renderItem={renderPendingRequestItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No pending requests</Text>
                </View>
              }
            />
          )}
        </View>

        {/* Separator */}
        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        {/* Add Friend by Handle - Now with proper padding for Android */}
        <View style={[styles.addFriendContainer, { backgroundColor: theme.cardBackground }]}>
          <TextInput
            style={[styles.addFriendInput, { color: theme.text, borderColor: theme.border }]}
            placeholder="Add friend by @handle"
            placeholderTextColor={theme.textSecondary}
            value={newFriendHandle}
            onChangeText={setNewFriendHandle}
          />
          <TouchableOpacity
            style={[styles.addFriendButton, { backgroundColor: theme.accent }]}
            onPress={handleSendRequest}
            disabled={!newFriendHandle.trim()}
          >
            <Text style={styles.addFriendButtonText}>Send Request</Text>
          </TouchableOpacity>
        </View>

        {/* Add bottom padding to avoid navigation bar overlap on Android */}
        {Platform.OS === "android" && <View style={styles.androidNavSpacer} />}
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  headerRight: {
    width: 40, // To balance the header
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 22,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  addFriendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 50,
    borderRadius: 8,
  },
  addFriendInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    borderBottomWidth: 1,
    marginRight: 10,
  },
  addFriendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addFriendButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginRight: 24,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  pendingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  pendingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  friendAvatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  friendInitials: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  friendLabel: {
    fontSize: 14,
  },
  acceptButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  rejectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  rejectButtonText: {
    fontWeight: "500",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
  },
  androidNavSpacer: {
    height: 48, // Height to account for Android navigation bar
  },
})
