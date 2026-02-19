#!/bin/bash

# Quick test script for admin and user

echo "=== Testing Quiz Server Scripts ==="
echo ""

# Test 1: Check admin script connects
echo "Test 1: Checking admin script..."
timeout 5 bun run admin 2>&1 | head -20 &
sleep 3

# Test 2: Check build output
echo ""
echo "Test 2: Checking compiled files..."
if [ -f "dist/simulate/server-admin.js" ]; then
  echo "✓ server-admin.js compiled successfully"
else
  echo "✗ server-admin.js not found"
fi

if [ -f "dist/simulate/server-user.js" ]; then
  echo "✓ server-user.js compiled successfully"
else
  echo "✗ server-user.js not found"
fi

echo ""
echo "=== Test Complete ==="
echo ""
echo "To run the admin: bun run admin"
echo "To run a user: bun run user <activity-key> <nickname>"
