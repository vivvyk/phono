import requests

SUPABASE_URL = "https://wigpjgdplntvtcutkxem.supabase.co"
SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZ3BqZ2RwbG50dnRjdXRreGVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjQwMzA3MSwiZXhwIjoyMDYxOTc5MDcxfQ.W9THbnTEbt-T9k1pa1AfrG1CvsHnnS7C6Fmx2vEL76c"

def sign_up_user(email, password, name, handle, role, phone):
    url = f"{SUPABASE_URL}/auth/v1/signup"
    headers = {
        "Content-Type": "application/json",
        "apikey": SUPABASE_API_KEY,
        "Authorization": f"Bearer {SUPABASE_API_KEY}"
    }

    data = {
        "email": email,
        "password": password,
        "data": {
            "phone": phone,
            "name": name,
            "handle": handle,
            "role": role,
        }
    }

    response = requests.post(url, json=data, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(response.json())

# Example usage:
sign_up_user(
    email="15kumarviv@gmail.com",
    password="SecurePass123!",
    name="Alice Example",
    handle="alice123",
    role="This is a test role.",
    phone="+5215551234567"
)
