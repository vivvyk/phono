import { supabase } from "../supabaseClient"

/**
 * Resets the user's balance to zero
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function resetBalance(): Promise<boolean> {
  try {
    // Get the current authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("❌ Failed to get current user:", userError)
      return false
    }

    // Update the user's balance to 0
    const { error: updateError } = await supabase
      .from("users")
      .update({ balance: 0 })
      .eq("user_id", user.id)

    if (updateError) {
      console.error("❌ Failed to reset balance:", updateError)
      return false
    }

    console.log("✅ Balance reset successfully for user:", user.id)
    return true
  } catch (error) {
    console.error("❌ Unexpected error resetting balance:", error)
    return false
  }
}
