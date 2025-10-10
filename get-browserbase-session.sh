#!/bin/bash

# 🚀 Get New Browserbase Session
# This script creates a new Browserbase session and updates .env

API_KEY="bb_live_Zd_GdXrx67TgsjhSE9PaP0FbcjI"
PROJECT_ID="603a1a05-c06d-4e9b-9563-5344cad69807"

echo "🔄 Creating new Browserbase session..."
echo ""

# Create session
RESPONSE=$(curl -s -X POST https://www.browserbase.com/v1/sessions \
  -H "Content-Type: application/json" \
  -H "X-BB-API-Key: $API_KEY" \
  -d "{\"projectId\": \"$PROJECT_ID\"}")

# Extract connectUrl
CONNECT_URL=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['connectUrl'])" 2>/dev/null)

if [ -z "$CONNECT_URL" ]; then
    echo "❌ Failed to create session"
    echo "Response: $RESPONSE"
    exit 1
fi

# Extract session details
SESSION_ID=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
STATUS=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['status'])" 2>/dev/null)
EXPIRES=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['expiresAt'])" 2>/dev/null)

echo "✅ Session created successfully!"
echo ""
echo "Session ID: $SESSION_ID"
echo "Status: $STATUS"
echo "Expires At: $EXPIRES"
echo ""
echo "WebSocket URL:"
echo "$CONNECT_URL"
echo ""

# Ask if user wants to update .env
read -p "Update .env file with this session? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Get existing Google credentials
    GOOGLE_EMAIL=$(grep GOOGLE_EMAIL .env 2>/dev/null | cut -d'=' -f2)
    GOOGLE_PASSWORD=$(grep GOOGLE_PASSWORD .env 2>/dev/null | cut -d'=' -f2)
    
    # Update .env
    cat > .env << EOF
BROWSERBASE_WS_ENDPOINT=$CONNECT_URL
GOOGLE_EMAIL=$GOOGLE_EMAIL
GOOGLE_PASSWORD=$GOOGLE_PASSWORD
EOF
    
    echo "✅ .env file updated!"
    echo ""
    echo "You can now run:"
    echo "  npm run dev              # CLI test"
    echo "  npm run server           # HTTP server"
else
    echo ""
    echo "To manually update, add this to .env:"
    echo "BROWSERBASE_WS_ENDPOINT=$CONNECT_URL"
fi

echo ""
echo "🎉 Ready to test with Browserbase!"

