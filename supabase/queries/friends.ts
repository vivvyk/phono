import { supabase } from "../supabaseClient"  // adjust the import path
import { putNotification } from "./notifications"

export async function sendFriendRequest(handle: string): Promise<{ success: boolean; message: string }> {
  const trimmedHandle = handle.trim()

  if (!trimmedHandle) {
    return { success: false, message: "Handle is empty." }
  }

  // Get sender (current authenticated user)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, message: "Authentication failed." }
  }

  const senderId = user.id

  // Get receiverId by handle
  const { data: receiverData, error: receiverError } = await supabase
    .from("users")
    .select("user_id")
    .eq("handle", trimmedHandle)
    .single()

  if (receiverError || !receiverData) {
    return { success: false, message: `User @${trimmedHandle} not found.` }
  }

  const receiverId = receiverData.user_id

  // Check for existing pending request
  const { data: existingRequest, error: existingError } = await supabase
    .from("friend_requests")
    .select("request_id")
    .eq("sender_id", senderId)
    .eq("receiver_id", receiverId)
    .eq("status", "pending")
    .maybeSingle()

  if (existingError) {
    return { success: false, message: "Error checking existing requests." }
  }

  if (existingRequest) {
    return { success: false, message: "Friend request already sent." }
  }

  // Insert friend request and return the request_id immediately
  const { data: insertedRequest, error: insertError } = await supabase
    .from("friend_requests")
    .insert([
      {
        sender_id: senderId,
        receiver_id: receiverId,
      },
    ])
    .select("request_id")
    .single()

  if (insertError || !insertedRequest) {
    return { success: false, message: "Failed to send friend request." }
  }

  const requestId = insertedRequest.request_id

  // Get sender's handle
  const { data: senderData, error: senderError } = await supabase
    .from("users")
    .select("handle")
    .eq("user_id", senderId)
    .single()

  if (!senderData || senderError) {
    return { success: false, message: "Friend request sent, but failed to get sender info." }
  }

  // Send notification
  await putNotification(
    receiverId,
    senderId,
    `You have a new friend request from @${senderData.handle}`,
    "friend_request",
    {
      friend_request_id: requestId,
    }
  )

  return { success: true, message: `Friend request sent to @${trimmedHandle}` }
}



export async function rejectFriendRequest(requestId: string) {
  const { error } = await supabase
    .from("friend_requests")
    .update({
      status: "rejected",
      responded_at: new Date().toISOString(),
    })
    .eq("request_id", requestId)

  if (error) {
    console.error("❌ Error rejecting friend request:", error)
    return false
  }

  console.log("✅ Friend request rejected.")
  return true
}

export async function acceptFriendRequest(requestId: string, senderId: string, receiverId: string) {
    const client = supabase
  
    // Step 1: Update the request to 'accepted'
    const { error: updateError } = await client
      .from("friend_requests")
      .update({
        status: "accepted",
        responded_at: new Date().toISOString(),
      })
      .eq("request_id", requestId)
  
    if (updateError) {
      console.error("❌ Error accepting friend request:", updateError)
      return false
    }
  
    // Step 2: Insert bidirectional friendship
    const { error: insertError } = await client.from("friends").insert([
      { user_id: receiverId, friend_id: senderId },
      { user_id: senderId, friend_id: receiverId },
    ])
  
    if (insertError) {
      console.error("❌ Error creating friendship:", insertError)
      return false
    }
  
    console.log("✅ Friend request accepted.")
    return true
  }
  