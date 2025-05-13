pp-level token (scope=general) – needs only client keys
curl -u "$CLIENT_ID:$CLIENT_SECRET" \
         -d "grant_type=client_credentials&scope=general" \
              https://sandbox-api.wire4.mx/token \
                   -s | jq -r '.access_token' > bearer.txt
                   export BEARER=$(cat bearer.txt)

                   # 2) Pre-register a subscription
                   # curl -X POST https://sandbox-api.wire4.mx/subscriptions/pre-subscription \
                   #      -H "Authorization: Bearer $BEARER" \
                   #           -H "Content-Type: application/json" \
                   #                -d '{
                   #                           "cancel_return_url": "https://example.com/cancel",
                   #                                      "return_url":   "https://example.com/success"
                   #                                               }' -s | jq .
                   #
