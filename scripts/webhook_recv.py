from fastapi import FastAPI, Request
import uvicorn, os, json, base64

app = FastAPI()

CIPHER_KEY = os.getenv("WIRE4_CIPHER_KEY")  # wh_***

@app.post("/wire4/webhook")
async def wire4_webhook(req: Request):
    payload = await req.json()
    # decrypt if you enabled encryption
    # decrypted = decrypt_wire4(payload, CIPHER_KEY)
    print(json.dumps(payload, indent=2))
    return {"ok": True}

if __name__ == "__main__":
    uvicorn.run(app, port=8000)
