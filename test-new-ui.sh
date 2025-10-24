#!/bin/bash

# Test script for Societies.io New UI API
# Usage: ./test-new-ui.sh

BASE_URL="http://161.35.34.121:3001"
API_KEY="your_api_key_here"  # Replace with your actual API key

echo "🧪 Testing Societies.io New UI API"
echo "=================================="

# Test 1: Health Check
echo "1. Testing health endpoint..."
curl -s "$BASE_URL/health" | jq '.' || echo "Health check failed"

echo -e "\n2. Testing API info..."
curl -s -H "X-API-Key: $API_KEY" "$BASE_URL/api/info" | jq '.' || echo "API info failed"

# Test 2: Email Subject - Single String (Backward Compatible)
echo -e "\n3. Testing email subject (single string)..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/societies/test-content" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "testType": "email_subject",
    "testString": "Get 50% off today!\nLimited time offer\nSave big this weekend",
    "societyName": "UK Marketing Leaders",
    "mode": "async"
  }')

echo "$RESPONSE" | jq '.'

# Extract jobId for status checking
JOB_ID=$(echo "$RESPONSE" | jq -r '.jobId // empty')
if [ -n "$JOB_ID" ]; then
    echo "Job ID: $JOB_ID"
    
    # Test 3: Check job status
    echo -e "\n4. Checking job status..."
    sleep 5  # Wait a bit before checking status
    
    STATUS_RESPONSE=$(curl -s -H "X-API-Key: $API_KEY" "$BASE_URL/api/jobs/$JOB_ID")
    echo "$STATUS_RESPONSE" | jq '.'
    
    # Check if completed
    STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.status // empty')
    if [ "$STATUS" = "completed" ]; then
        echo "✅ Test completed successfully!"
        echo "Winner: $(echo "$STATUS_RESPONSE" | jq -r '.results.winner // "N/A"')"
        echo "Impact Score: $(echo "$STATUS_RESPONSE" | jq -r '.results.impactScore.value // "N/A"')"
        echo "Uplift: $(echo "$STATUS_RESPONSE" | jq -r '.results.uplift // "N/A"')%"
    else
        echo "⏳ Test still processing... Status: $STATUS"
    fi
else
    echo "❌ Failed to get job ID"
fi

# Test 4: Meta Ad - Multiple Strings (New Format)
echo -e "\n5. Testing meta ad (multiple strings)..."
RESPONSE2=$(curl -s -X POST "$BASE_URL/api/societies/test-content" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "testType": "meta_ad",
    "testStrings": [
      "Transform your business today",
      "Unlock your potential",
      "Join thousands of successful entrepreneurs"
    ],
    "societyName": "UK Enterprise Marketing Leaders",
    "mode": "async"
  }')

echo "$RESPONSE2" | jq '.'

# Test 5: Different Audience
echo -e "\n6. Testing HR Decision-Makers audience..."
curl -s -X POST "$BASE_URL/api/societies/test-content" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "testType": "email_subject",
    "testString": "New HR software solution\nStreamline your processes\nReduce admin time by 50%",
    "societyName": "UK HR Decision-Makers",
    "mode": "async"
  }' | jq '.'

echo -e "\n✅ All tests completed!"
echo "Check the job status endpoints to see results when processing is complete."
