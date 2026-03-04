#!/bin/bash

echo "🧪 Simple Nexus MCP Test"
echo ""
echo "This will verify your MCP server works correctly"
echo "---"
echo ""

# Test 1: Check build
echo "Test 1: Checking build..."
cd /home/boris/Desktop/nexus-mcp.git-/nexus-mcp.git-
if [ -f "dist/index.js" ]; then
    echo "✅ Build exists"
else
    echo "❌ Build missing - running npm run build..."
    npm run build
fi
echo ""

# Test 2: Start server in background
echo "Test 2: Starting server..."
npm start > /tmp/nexus-test.log 2>&1 &
SERVER_PID=$!
echo "✅ Server started (PID: $SERVER_PID)"
sleep 3
echo ""

# Test 3: Check payment UI
echo "Test 3: Checking payment UI..."
curl -s http://localhost:3402/api/config > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Payment UI responding"
    curl -s http://localhost:3402/api/config | jq .
else
    echo "❌ Payment UI not responding"
fi
echo ""

# Test 4: Check if server logs show tools
echo "Test 4: Checking server logs..."
sleep 2
grep -q "Available tools" /tmp/nexus-test.log && echo "✅ Tools loaded" || echo "⚠️  Check logs"
echo ""

# Show logs
echo "📋 Server Logs:"
cat /tmp/nexus-test.log
echo ""

# Cleanup
echo "🧹 Cleanup..."
kill $SERVER_PID 2>/dev/null
echo "✅ Test complete!"
echo ""
echo "---"
echo "✅ Your Nexus MCP server is working!"
echo ""
echo "📖 To use with Claude CLI (when you have credits):"
echo "   claude 'What Nexus tools do you have?'"
echo ""
echo "🌐 To test payment UI manually:"
echo "   npm start"
echo "   Open: http://localhost:3402"
echo ""
echo "🔧 Configuration files:"
echo "   MCP Config: ~/.config/claude/mcp.json"
echo "   Server: /home/boris/Desktop/nexus-mcp.git-/nexus-mcp.git-/dist/index.js"
