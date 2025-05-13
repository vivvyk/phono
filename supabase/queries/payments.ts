import { supabase } from "../supabaseClient"
import { putNotification } from "./notifications"

/**
 * Updates the balances of two users involved in a transaction
 */
async function updateUserBalances(
  origin_user_id: string,
  destination_user_id: string,
  amount: number
): Promise<boolean> {
  // Fetch balances for both users
  const { data: balances, error: fetchError } = await supabase
    .from("users")
    .select("user_id, balance")
    .in("user_id", [origin_user_id, destination_user_id])

  if (fetchError || !balances || balances.length < 2) {
    console.error("❌ Failed to fetch user balances:", fetchError)
    return false
  }

  const originUser = balances.find((u) => u.user_id === origin_user_id)
  const destUser = balances.find((u) => u.user_id === destination_user_id)

  if (!originUser || !destUser) {
    console.error("❌ Could not find both users in balance fetch")
    return false
  }

  const originNewBalance = parseFloat(originUser.balance || 0) - amount
  const destNewBalance = parseFloat(destUser.balance || 0) + amount

  // Update origin user balance
  const { error: originUpdateError } = await supabase
    .from("users")
    .update({ balance: originNewBalance })
    .eq("user_id", origin_user_id)

  if (originUpdateError) {
    console.error("❌ Failed to update origin user balance:", originUpdateError)
    return false
  }

  // Update destination user balance
  const { error: destUpdateError } = await supabase
    .from("users")
    .update({ balance: destNewBalance })
    .eq("user_id", destination_user_id)

  if (destUpdateError) {
    console.error("❌ Failed to update destination user balance:", destUpdateError)
    return false
  }

  console.log("✅ Updated balances. Origin:", originNewBalance, "Destination:", destNewBalance)
  return true
}

export async function insertTransaction({
  destination_user_id,
  origin_clabe,
  destination_clabe,
  amount,
  currency = "MXN",
  description,
  category = "transportation",
  request = false,
  direction,
  status,
}: {
  destination_user_id: string
  origin_clabe: string
  destination_clabe: string
  amount: number
  currency?: string
  description: string
  category?: string
  request?: boolean
  direction: "inbound" | "outbound"
  status: "pending" | "rejected" | "complete"
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("❌ Failed to get current user:", userError)
    return false
  }

  const origin_user_id = user.id

  // Step 1: Insert the transaction
  const { data: insertedTransaction, error: insertError } = await supabase.from("transactions").insert([
    {
      origin_user_id: request ? destination_user_id : origin_user_id,
      destination_user_id: request ? origin_user_id : destination_user_id,
      origin_clabe,
      destination_clabe,
      amount,
      currency,
      description,
      category,
      request,
      direction,
      status,
    },
  ])
  .select("transaction_id")
  .single();

  if (insertError || !insertedTransaction) {
    console.error("❌ Error inserting transaction:", insertError)
    return false
  }

  const transaction_id = insertedTransaction.transaction_id
  console.log("✅ Transaction inserted with ID:", transaction_id)

  // Step 2: Update user balances (only if transaction is complete)
  let balanceUpdateSuccess = true
  if (status === "complete") {
    balanceUpdateSuccess = await updateUserBalances(origin_user_id, destination_user_id, amount)
  }
  
  if (!balanceUpdateSuccess) {
    return false
  }

  
  // Only send notification if this is a payment request
  if (request) {
    // Get the origin user's handle from the users table
    const { data: originUserData } = await supabase
      .from("users")
      .select("handle")
      .eq("user_id", origin_user_id)
      .single();
      
    await putNotification(destination_user_id, origin_user_id, `You have a new payment request from @${originUserData?.handle}`, 'payment_request', {
      transaction_id: insertedTransaction?.transaction_id,
    })
  }

  return true
}

/**
 * Updates the status of a transaction to either 'complete' or 'rejected'
 * @param transaction_id The ID of the transaction to update
 * @param newStatus The new status to set ('complete' or 'rejected')
 * @returns Promise<boolean> True if successful, false otherwise
 */
export async function updateTransactionStatus(
  transaction_id: string,
  newStatus: 'complete' | 'rejected'
): Promise<boolean> {
  if (!transaction_id) {
    console.error("❌ Transaction ID is required")
    return false
  }

  if (newStatus !== 'complete' && newStatus !== 'rejected') {
    console.error("❌ Invalid status. Must be 'complete' or 'rejected'")
    return false
  }

  // Step 1: Get the current transaction details
  const { data: transaction, error: fetchError } = await supabase
    .from("transactions")
    .select("*")
    .eq("transaction_id", transaction_id)
    .single()

  if (fetchError || !transaction) {
    console.error("❌ Error fetching transaction:", fetchError)
    return false
  }

  // Step 2: Update the transaction status
  const { error: updateError } = await supabase
    .from("transactions")
    .update({ status: newStatus })
    .eq("transaction_id", transaction_id)

  if (updateError) {
    console.error("❌ Error updating transaction status:", updateError)
    return false
  }

  console.log(`✅ Transaction status updated to ${newStatus} successfully`)

  // Step 3: If status is changed to 'complete', update user balances
  let balanceUpdateSuccess = true
  if (newStatus === 'complete' && transaction.status !== 'complete') {
    balanceUpdateSuccess = await updateUserBalances(
      transaction.origin_user_id,
      transaction.destination_user_id,
      transaction.amount
    )
  }

  if (!balanceUpdateSuccess) {
    console.error("❌ Failed to update user balances")
    return false
  }

  return true
}

