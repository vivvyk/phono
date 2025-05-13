import { supabase } from "../supabaseClient"
import { acceptFriendRequest, rejectFriendRequest } from "./friends"
import { updateTransactionStatus } from "./payments"
/**
 * Inserts a new notification into the notifications table
 * @param userId - The ID of the user receiving the notification
 * @param senderId - The ID of the user sending the notification (optional)
 * @param text - The notification text content
 * @param type - The type of notification (e.g., 'payment_request', 'friend_request', 'system')
 * @param metadata - Optional metadata object with additional information
 * @returns The newly created notification or null if there was an error
 */
export async function putNotification(
  userId: string,
  senderId: string | null,
  text: string,
  type: string,
  metadata: Record<string, any> = {}
) {
  console.log("🔍 Putting notification:", userId, senderId, text, type, metadata)
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        sender_id: senderId,
        notification_text: text,
        notification_type: type,
        notification_status: "unread",
        notification_metadata: metadata,
        notification_datetime: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Error creating notification:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("❌ Exception in putNotification:", error);
    return null;
  }
}

export async function respondToRequest(notificationId: string, response: "accept" | "reject") {
    console.log("respondToRequest", notificationId, response)
    try {
      // First, get the notification to determine its type
      const { data: notification, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .eq("notification_id", notificationId)
        .single()
  
      if (fetchError) {
        console.error("❌ Error fetching notification:", fetchError)
        throw fetchError
      }

  
      // Process based on notification type
      if (notification.notification_type === "payment_request") {
        if (response === "accept") {
        await updateTransactionStatus(notification.notification_metadata.transaction_id, 'complete')
        } else if (response === "reject") {
        await updateTransactionStatus(notification.notification_metadata.transaction_id, 'rejected')
        }

        const { error } = await supabase
        .from("notifications")
        .update({
        notification_status: "read",
        notification_metadata: {
            ...notification.notification_metadata,
            response: response,
        },
        })
        .eq("notification_id", notificationId)
        if (error) throw error
        console.log("notification", notification)
  
        if (error) throw error
      } else if (notification.notification_type === "friend_request") {        
        if (response === "accept") {
            await acceptFriendRequest(notification.notification_metadata.friend_request_id, notification.sender_id, notification.user_id)
        } else if (response === "reject") {
            await rejectFriendRequest(notification.notification_metadata.request_id)
        }

        const { error } = await supabase
        .from("notifications")
        .update({
          notification_status: "read",
          notification_metadata: {
            ...notification.notification_metadata,
            response: response,
          },
        })
        .eq("notification_id", notificationId)
  
        if (error) throw error
        console.log("notification", notification)
      }
  
      return true
    } catch (error) {
      console.error(`❌ Error ${response}ing request:`, error)
      throw error
    }
  }