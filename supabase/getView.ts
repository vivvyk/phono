// getDashboard
import { supabase } from "./supabaseClient"

export interface DashboardData {
  user_id: string
  name: string
  role: string
  balance: number
  friends: string[] | null
  recent_transactions: any[] | null
  balance_change_last_day: number
  unread_notifications_count: number
  unread_notifications: any[] | null
}

export interface ProfileData {
  user_id: string
  name: string
  role: string
  balance: number
  recent_transactions: any[]
  friends: any[]
}

export interface FriendEntry {
  current_user_id: string
  other_user_id: string
  name: string
  handle: string
  relationship_type: "friend" | "pending"
  friended_at: string
  request_id: string | null // will only be non-null if it's a pending request
}

export interface Transaction {
  transaction_id: string
  origin_user_id: string
  destination_user_id: string
  amount: number
  description: string
  category: string | null
  transaction_datetime: string
  status: "pending" | "complete" | "cancelled"
  direction: "inbound" | "outbound"
  counterparty_name: string
  counterparty_handle: string
}

export interface Notification {
  notification_id: string
  user_id: string
  sender_id: string | null
  notification_datetime: string
  notification_text: string
  notification_type: string
  notification_status: "unread" | "read"
  notification_metadata: any | null
  minutes_ago: number
  sender_name: string | null
  sender_handle: string | null
  is_unread: boolean
}

export async function getDashboard() {
  const { data, error } = await supabase.from("dashboard_view").select("*").single()

  if (error) {
    console.error("❌ Error fetching dashboard:", error)
    return null
  }

  return data
}

export async function getFriends() {
  const { data, error } = await supabase
    .from("friends_view") // or 'friends_view'
    .select("*")

  if (error) {
    console.error("❌ Error fetching friends:", error)
    return null
  }

  return data
}

export async function getAllTransactions() {
  try {
    const { data, error } = await supabase
      .from("transactions_view") // Assuming you have a view or table for transactions
      .select("*")
      .order("transaction_datetime", { ascending: false })

    if (error) {
      console.error("❌ Error fetching all transactions:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("❌ Error fetching all transactions:", error)
    return null
  }
}

export async function getNotifications() {
  try {
    const { data, error } = await supabase
      .from("notifications_view")
      .select("*")
      .order("notification_datetime", { ascending: false })

    if (error) {
      console.error("❌ Error fetching notifications:", error)
      return null
    }

    // Process the data to ensure all fields are properly formatted
    const processedData = data?.map((notification) => ({
      ...notification,
      // Ensure minutes_ago is a number
      minutes_ago:
        typeof notification.minutes_ago === "number"
          ? notification.minutes_ago
          : notification.notification_datetime
            ? (Date.now() - new Date(notification.notification_datetime).getTime()) / (1000 * 60)
            : 0,

      // Ensure sender fields are properly typed
      sender_name: notification.sender_name || null,
      sender_handle: notification.sender_handle || null,

      // Ensure is_unread is a boolean
      is_unread: notification.is_unread === true || notification.notification_status === "unread",
    }))

    return processedData
  } catch (error) {
    console.error("❌ Error fetching notifications:", error)
    return null
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ notification_status: "read" })
      .eq("notification_id", notificationId)

    if (error) {
      console.error("❌ Error marking notification as read:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("❌ Error marking notification as read:", error)
    throw error
  }
}

export async function getProfile() {
  const { data, error } = await supabase.from("profile_view").select("*").single()

  if (error) {
    console.error("❌ Error fetching user profile:", error)
    return null
  }
  return data
}