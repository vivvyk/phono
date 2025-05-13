"""
End-to-end SPEI sandbox demo with Wire4 - pure Python version
-------------------------------------------------------------

Prereqs
-------
pip install requests python-dotenv

Set the following env-vars (recommended) or hard-code them only for quick tests:

    W4_CLIENT_ID
    W4_CLIENT_SECRET

The script will:
1) Fetch an *application-level* token (scope=general)
2) Create a **pre-subscription** → returns user_key / user_secret
3) Fetch a **user-level** token (scope=spei_admin)
4) Call a sample endpoint (list institutions) to prove everything works
"""

import os
import uuid
import requests
from dotenv import load_dotenv

load_dotenv()                                     # optional .env support

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
TOKEN_URL  = "https://sandbox-api.wire4.mx/token"           # <- stays un-versioned
API_BASE   = "https://sandbox-api.wire4.mx/wire4/1.0.0"     # <- everything else


# ---------------------------------------------------------------------------
# 0. secrets
# ---------------------------------------------------------------------------
CLIENT_ID     = "788RWZfEMh9sTq_zfXBp8c8JpQIa"
CLIENT_SECRET = "_zJscmT8NWPmc6lwnbqPTZiZYRoa"

assert CLIENT_ID and CLIENT_SECRET, "Set W4_CLIENT_ID / W4_CLIENT_SECRET env-vars!"

# ---------------------------------------------------------------------------
# 1. get APPLICATION token  (client-credentials → scope=general)
# ---------------------------------------------------------------------------
def get_app_token() -> str:
    resp = requests.post(
        TOKEN_URL,                      # <-- use TOKEN_URL
        auth=(CLIENT_ID, CLIENT_SECRET),
        data={"grant_type": "client_credentials",
            "scope": "general"},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]

app_token = get_app_token()
print("✅ Got application token")

headers_app = {"Authorization": f"Bearer {app_token}",
               "Content-Type":  "application/json"}

# NGROK - 2wpTZDC51V2p7VeZN2E31Um0bA9_7ZjuQCjy78QkBwRVK7pr

# ---------------------------------------------------------------------------
# 2. create a pre-subscription  →  user_key / user_secret
# ---------------------------------------------------------------------------
def create_subscription(alias: str, name: str = "Demo Wallet User") -> dict:
    body = {
        "cancel_return_url": "https://example.com/cancel",
        "return_url":        "https://example.com/success"
    }
    resp = requests.post(
        f"{API_BASE}/subscriptions/pre-subscription",  # <-- API_BASE
        json=body,
        headers=headers_app,
        timeout=15,
    )
    if resp.status_code == 202:
        data = resp.json()          # {'subscription_id': '…', 'url': 'https://center-sndbx.wire4.mx/authorize/…'}
        print("✅ Pre-subscription OK → open this URL once in a browser:")
        print("   ", data["url"])
    else:
        print("❌", resp.status_code, resp.text)   # helps you see any 400/401/412 details
    resp.raise_for_status()
    return resp.json()

sub = create_subscription(alias=f"demo-{uuid.uuid4().hex[:8]}")
user_key    = sub["user_key"]
user_secret = sub["user_secret"]

print("✅ Subscription created")
print(f"   user_key    = {user_key}")
print(f"   user_secret = {user_secret}")

# ---------------------------------------------------------------------------
# 3. get USER token  (password-grant → scope=spei_admin)
# ---------------------------------------------------------------------------
def get_user_token(u_key: str, u_secret: str) -> str:
    data = {
        "grant_type": "password",
        "scope":      "spei_admin",
        "username":   u_key,
        "password":   u_secret,
    }
    resp = requests.post(
        f"{API_BASE}/token",
        auth=(CLIENT_ID, CLIENT_SECRET),
        data=data,
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]

spei_token = get_user_token(user_key, user_secret)
print("✅ Got SPEI (user) token")

headers_spei = {"Authorization": f"Bearer {spei_token}",
                "Content-Type":  "application/json"}

# ---------------------------------------------------------------------------
# 4. sample call – list SPEI institutions
# ---------------------------------------------------------------------------
institutions = requests.get(f"{API_BASE}/institutions",
                            headers=headers_spei,
                            timeout=15).json()

print(f"🏦 {len(institutions)} banks returned. First 5:\n",
      "\n ".join(f"{i['code']} – {i['name']}" for i in institutions[:5]))

# ---------------------------------------------------------------------------
# You now have everything needed for:
#   • POST /beneficiaries/spei
#   • POST /transactions/outcoming/spei
#   • GET  /ceps/{cep_id}
# etc. – just reuse `headers_spei` in your requests.
# ---------------------------------------------------------------------------

