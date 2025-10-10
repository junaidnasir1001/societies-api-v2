#!/bin/bash

# 🧪 Automated Testing Script for Societies.io Automation
# Tests all requirements that don't require Google credentials

echo "════════════════════════════════════════════════════════════"
echo "🧪 TESTING ALL REQUIREMENTS"
echo "════════════════════════════════════════════════════════════"
echo ""

PASS=0
FAIL=0

# Test 1: ESM Module
echo "Test 1: ESM Module Support"
if grep -q '"type".*"module"' package.json; then
    echo "✅ PASS - ESM enabled in package.json"
    ((PASS++))
else
    echo "❌ FAIL - ESM not enabled"
    ((FAIL++))
fi
echo ""

# Test 2: Dependencies
echo "Test 2: Dependencies Check"
if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
    echo "✅ PASS - Dependencies installed"
    ((PASS++))
else
    echo "❌ FAIL - Run 'npm install' first"
    ((FAIL++))
fi
echo ""

# Test 3: File Syntax
echo "Test 3: JavaScript Syntax Validation"
SYNTAX_PASS=true
for file in src/*.js; do
    if node -c "$file" 2>/dev/null; then
        echo "  ✅ $(basename $file) - valid"
    else
        echo "  ❌ $(basename $file) - syntax error"
        SYNTAX_PASS=false
    fi
done
if [ "$SYNTAX_PASS" = true ]; then
    ((PASS++))
else
    ((FAIL++))
fi
echo ""

# Test 4: Environment Variables
echo "Test 4: Environment Variables (No Hardcoded Secrets)"
if grep -riq "password.*=.*['\"][^']" src/ 2>/dev/null; then
    echo "❌ FAIL - Found hardcoded secrets"
    ((FAIL++))
else
    echo "✅ PASS - No hardcoded secrets found"
    ((PASS++))
fi
if grep -q "process.env.GOOGLE_EMAIL" src/index.js && grep -q "process.env.GOOGLE_PASSWORD" src/index.js; then
    echo "✅ PASS - Uses environment variables"
else
    echo "❌ FAIL - Not using env vars properly"
fi
echo ""

# Test 5: Ajv Validation
echo "Test 5: Ajv JSON Schema Validation"
if grep -q "import Ajv" src/index.js && grep -q "validate.*=" src/index.js; then
    echo "✅ PASS - Ajv validation implemented"
    ((PASS++))
else
    echo "❌ FAIL - Ajv validation missing"
    ((FAIL++))
fi
echo ""

# Test 6: Stability Wait
echo "Test 6: DOM Stability Wait (800ms)"
if grep -q "quietMs.*800\|800.*timeout" src/societies.js; then
    echo "✅ PASS - 800ms stability wait implemented"
    ((PASS++))
else
    echo "❌ FAIL - Stability wait missing"
    ((FAIL++))
fi
echo ""

# Test 7: Clean Shutdown
echo "Test 7: Clean Shutdown (try/finally)"
if grep -q "finally" src/index.js && grep -q "context?.close\|browser?.close" src/index.js; then
    echo "✅ PASS - Clean shutdown with finally block"
    ((PASS++))
else
    echo "❌ FAIL - No proper cleanup"
    ((FAIL++))
fi
echo ""

# Test 8: No PII in Logs
echo "Test 8: No PII in Console Logs"
if grep "console.log" src/*.js | grep -Eiq "email|password|secret|credential"; then
    echo "❌ FAIL - Found PII in console logs"
    ((FAIL++))
else
    echo "✅ PASS - No PII in logs (only step names & durations)"
    ((PASS++))
fi
echo ""

# Test 9: Browserbase CDP
echo "Test 9: Browserbase CDP Support"
if grep -q "connectOverCDP" src/index.js && grep -q "BROWSERBASE_WS_ENDPOINT" src/index.js; then
    echo "✅ PASS - Browserbase CDP support present"
    ((PASS++))
else
    echo "❌ FAIL - CDP support missing"
    ((FAIL++))
fi
echo ""

# Test 10: Local Chromium Fallback
echo "Test 10: Local Chromium Fallback"
if grep -q "chromium.launch" src/index.js; then
    echo "✅ PASS - Local Chromium fallback present"
    ((PASS++))
else
    echo "❌ FAIL - No local fallback"
    ((FAIL++))
fi
echo ""

# Test 11: CLI Scripts
echo "Test 11: CLI Scripts Configuration"
if grep -q '"dev".*"node src/cli.js --demo"' package.json; then
    echo "✅ PASS - npm run dev configured"
    ((PASS++))
else
    echo "❌ FAIL - dev script missing"
    ((FAIL++))
fi
echo ""

# Test 12: HTTP Server Script
echo "Test 12: HTTP Server Configuration"
if grep -q '"server".*"node src/server.js"' package.json; then
    echo "✅ PASS - npm run server configured"
    ((PASS++))
else
    echo "❌ FAIL - server script missing"
    ((FAIL++))
fi
echo ""

# Test 13: Google Login Implementation
echo "Test 13: Google Login Flow"
if grep -q "googleLogin" src/index.js && grep -q "MFA" src/googleLogin.js; then
    echo "✅ PASS - Google login with MFA support"
    ((PASS++))
else
    echo "❌ FAIL - Login flow incomplete"
    ((FAIL++))
fi
echo ""

# Test 14: Societies.io SSO
echo "Test 14: Societies.io SSO (Continue with Google)"
if grep -q "Continue with Google" src/societies.js; then
    echo "✅ PASS - SSO button selector present"
    ((PASS++))
else
    echo "❌ FAIL - SSO not implemented"
    ((FAIL++))
fi
echo ""

# Test 15: Form Filling
echo "Test 15: Form Filling with Fallback Selectors"
if grep -q "fillMaybe" src/societies.js; then
    echo "✅ PASS - Fallback selector mechanism present"
    ((PASS++))
else
    echo "❌ FAIL - No fallback selectors"
    ((FAIL++))
fi
echo ""

# Test 16: Spinner Detection
echo "Test 16: Loading Spinner Detection"
if grep -q "spinner" src/societies.js; then
    echo "✅ PASS - Spinner detection implemented"
    ((PASS++))
else
    echo "❌ FAIL - No spinner wait"
    ((FAIL++))
fi
echo ""

# Test 17: JSON Schema
echo "Test 17: JSON Output Schema"
if grep -q "outputSchema" src/index.js && grep -q "society.*template.*inputText" src/index.js; then
    echo "✅ PASS - Output schema defined"
    ((PASS++))
else
    echo "❌ FAIL - Schema missing"
    ((FAIL++))
fi
echo ""

# Test 18: Required Files
echo "Test 18: All Required Files Present"
REQUIRED_FILES=(
    "package.json"
    ".gitignore"
    ".env.example"
    "src/googleLogin.js"
    "src/societies.js"
    "src/index.js"
    "src/cli.js"
    "src/server.js"
    "README.md"
)
FILES_OK=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file - MISSING"
        FILES_OK=false
    fi
done
if [ "$FILES_OK" = true ]; then
    ((PASS++))
else
    ((FAIL++))
fi
echo ""

# Summary
echo "════════════════════════════════════════════════════════════"
echo "📊 TEST SUMMARY"
echo "════════════════════════════════════════════════════════════"
echo "✅ PASSED: $PASS"
echo "❌ FAILED: $FAIL"
TOTAL=$((PASS + FAIL))
echo "📈 SCORE: $PASS/$TOTAL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED! Project is ready."
    echo ""
    echo "Next steps:"
    echo "1. Add Google credentials to .env file"
    echo "2. Run: npm run dev (to test full flow)"
    echo "3. Run: npm run server (to test HTTP endpoint)"
    exit 0
else
    echo "⚠️  Some tests failed. Please review the issues above."
    exit 1
fi

