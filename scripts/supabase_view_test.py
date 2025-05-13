from supabase import create_client, Client
import os

# Supabase credentials
SUPABASE_URL = "https://wigpjgdplntvtcutkxem.supabase.co"
SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZ3BqZ2RwbG50dnRjdXRreGVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDMwNzEsImV4cCI6MjA2MTk3OTA3MX0.f-bWfkZ7gk_NK5jpJpaYU8S19D8jZYChZlqQIuEDKLY"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_API_KEY)

# Step 1: Request OTP for phone number
phone_number = "+18605157641"
print(f"Sending OTP to {phone_number}...")
supabase.auth.sign_in_with_otp({"phone": phone_number})

# Step 2: User enters OTP
otp_code = input("Enter the OTP code you received: ").strip()

# Step 3: Verify OTP
verify_response = supabase.auth.verify_otp({
    "phone": phone_number,
    "token": otp_code,
    "type": "sms"
})

if verify_response.user:
    print("✅ OTP verified! Signed in as user ID:", verify_response.user.id)

    # Step 4: Query the secure_dashboard_view
    response = supabase.table("dashboard_view").select("*").single().execute()

    print(response)

    # Handle the response based on its .data attribute
    if response.data is None:
        print("❌ No data returned from secure_dashboard_view.")
    else:
        dashboard = response.data
        print("\n📊 Dashboard Data:")
        print("Name:", dashboard.get("name"))
        print("Role:", dashboard.get("role"))
        print("Balance:", dashboard.get("balance"))
        print("Friends:", dashboard.get("friends"))
        print("Recent Transactions:", dashboard.get("recent_transactions"))
        print("Balance Change Last Day:", dashboard.get("balance_change_last_day"))
        print("Unread Count:", dashboard.get("unread_notifications_count"))
        print("Unread Notifications:", dashboard.get("unread_notifications"))

else:
    print("❌ OTP verification failed.")
