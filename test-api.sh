#!/bin/bash

# Test API endpoints
echo "=== DevInsight2 API Test Script ==="
echo ""

# Admin credentials
ADMIN_EMAIL="admin@devinsight.com"
ADMIN_PASS="Admin@123"
BASE_URL="http://localhost:8080/api"

echo "🔐 Step 1: Login as Admin"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASS\"
  }")

echo "$LOGIN_RESPONSE" | python3 -m json.tool

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('token', ''))")

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  exit 1
fi

echo ""
echo "✅ Token: ${TOKEN:0:20}..."
echo ""

echo "📚 Step 2: Get All Questions"
curl -s -X GET "$BASE_URL/questions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool

echo ""
echo "🔍 Step 3: Get Question by ID (ID=1)"
curl -s -X GET "$BASE_URL/questions/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool

echo ""
echo "✅ API Test Complete!"
