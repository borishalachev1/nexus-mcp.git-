# 🖥️ Claude Desktop Setup Guide - Nexus MCP

## Step-by-Step Configuration

### Step 1: Locate Claude Desktop Config File

The config file location depends on your system:

**Linux (your system):**
```
~/.config/Claude/claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

---

### Step 2: Edit the Config File

#### Option A: Create New Config (if file doesn't exist)

```bash
# Create the directory if needed
mkdir -p ~/.config/Claude

# Copy the config file
cp /home/boris/Desktop/nexus-mcp.git-/nexus-mcp.git-/claude-desktop-config.json ~/.config/Claude/claude_desktop_config.json
```

#### Option B: Add to Existing Config (if file exists)

If you already have other MCP servers configured, add the Nexus server to your existing config:

```json
{
  "mcpServers": {
    "your-existing-server": {
      ...existing config...
    },
    "nexus": {
      "command": "node",
      "args": [
        "/home/boris/Desktop/nexus-mcp.git-/nexus-mcp.git-/dist/index.js"
      ],
      "env": {
        "THIRDWEB_CLIENT_ID": "7b747b322e1128ac0fc2a5c2c79b7504",
        "PAYMENT_RECIPIENT": "0xCE918BbF214E64951B2fFD3c0a895C1411fe3D85",
        "CHAIN_ID": "84532",
        "PAYMENT_TOKEN_ADDRESS": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        "RPC_URL": "https://sepolia.base.org",
        "X402_FACILITATOR_URL": "https://facilitator.x402.org",
        "PERMIT2_ADDRESS": "0x000000000022D473030F116dDEE9F6B43aC78BA3"
      }
    }
  }
}
```

---

### Step 3: Verify the Configuration

**Check the file:**
```bash
cat ~/.config/Claude/claude_desktop_config.json
```

**Should look like:**
```json
{
  "mcpServers": {
    "nexus": {
      "command": "node",
      "args": ["/home/boris/Desktop/nexus-mcp.git-/nexus-mcp.git-/dist/index.js"],
      "env": {
        "THIRDWEB_CLIENT_ID": "7b747b322e1128ac0fc2a5c2c79b7504",
        "PAYMENT_RECIPIENT": "0xCE918BbF214E64951B2fFD3c0a895C1411fe3D85",
        "CHAIN_ID": "84532",
        "PAYMENT_TOKEN_ADDRESS": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        "RPC_URL": "https://sepolia.base.org",
        "X402_FACILITATOR_URL": "https://facilitator.x402.org",
        "PERMIT2_ADDRESS": "0x000000000022D473030F116dDEE9F6B43aC78BA3"
      }
    }
  }
}
```

---

### Step 4: Restart Claude Desktop

**Important:** You MUST restart Claude Desktop for changes to take effect.

**Linux:**
```bash
# Close Claude Desktop completely
# Then reopen it
```

**macOS:**
```bash
# Quit Claude Desktop (Cmd+Q)
# Then reopen
```

**Windows:**
```bash
# Close Claude Desktop from system tray
# Then reopen
```

---

### Step 5: Verify Connection in Claude

Open Claude Desktop and start a new conversation:

**Test 1: List Available Tools**
```
You: What Nexus tools do you have available?
```

**Expected Response:**
```
I have access to 5 Nexus MCP tools:

1. nexus:get_service_info (FREE)
   - Get information about the Nexus MCP service
   
2. nexus:get_weather (0.10 USDC)
   - Get current weather for a city
   
3. nexus:search_web (0.15 USDC)
   - Search the web with AI-powered results
   
4. nexus:generate_image (0.25 USDC)
   - Generate an AI image from text description
   
5. nexus:analyze_code (0.20 USDC)
   - Analyze code quality and suggest improvements
```

---

### Step 6: Test Free Tool

**Test the free tool first (no payment required):**

```
You: Use the get_service_info tool
```

**Expected:**
- Tool executes immediately
- No payment UI opens
- Returns service information
- Shows available tools and pricing

**Example Response:**
```
The Nexus MCP service is running successfully!

Service Information:
- Version: 1.0.0
- Protocol: X402 Payment Protocol
- Network: Base Sepolia (Chain ID: 84532)
- Payment Token: USDC
- Available Tools: 5
- Status: Online

Tools Available:
1. get_service_info - FREE
2. get_weather - 0.10 USDC
3. search_web - 0.15 USDC
4. generate_image - 0.25 USDC
5. analyze_code - 0.20 USDC

Ready to accept payments!
```

---

### Step 7: Test Paid Tool (Full Flow)

**Now test a paid tool:**

```
You: What's the weather in London?
```

**Expected Flow:**

1. **Claude responds:**
   ```
   I need to use the get_weather tool which costs 0.10 USDC.
   A payment window should open for you to approve.
   ```

2. **Browser opens automatically** showing:
   ```
   💳 Payment Gateway
   
   Tool: nexus:get_weather
   Amount: 0.10 USDC
   Description: Get current weather for a city
   Network: Base Sepolia
   Recipient: 0xCE91...3D85
   ```

3. **You click "Connect MetaMask"**
   - MetaMask prompts for connection
   - You approve

4. **You click "Approve Payment"**
   - MetaMask shows signature request
   - Permit2 typed data
   - You sign (no gas fee!)

5. **Payment processes:**
   - Signature validated
   - Payment settles on-chain
   - Transaction hash generated

6. **Tool executes:**
   - Weather data retrieved
   - Browser closes automatically

7. **Claude responds with result:**
   ```
   ✅ Payment successful! (0.10 USDC)
   Transaction: 0x1234...5678
   
   Current weather in London:
   🌡️ Temperature: 12°C
   ☁️ Conditions: Partly cloudy
   💨 Wind: 15 km/h
   💧 Humidity: 65%
   ```

---

## Troubleshooting

### Issue: "MCP server not found" in Claude

**Check:**
1. Config file location is correct
2. JSON syntax is valid (no trailing commas)
3. File path to `dist/index.js` is absolute and correct
4. Node.js is installed: `node --version`
5. Restart Claude Desktop completely

**Fix:**
```bash
# Verify config
cat ~/.config/Claude/claude_desktop_config.json | jq .

# If jq not installed:
cat ~/.config/Claude/claude_desktop_config.json

# Check file exists
ls -la /home/boris/Desktop/nexus-mcp.git-/nexus-mcp.git-/dist/index.js
```

---

### Issue: "Tools not appearing"

**Check:**
1. MCP server built: `npm run build`
2. No syntax errors in code
3. Restart Claude Desktop
4. Check Claude Desktop logs (if available)

**Fix:**
```bash
# Rebuild
cd /home/boris/Desktop/nexus-mcp.git-/nexus-mcp.git-
npm run build

# Test manually
node dist/index.js
```

---

### Issue: "Payment window doesn't open"

**Check:**
1. Browser popup blocker
2. Default browser is set
3. Server is running (check logs)
4. Port 3402 is free

**Fix:**
```bash
# Check if port is in use
lsof -i :3402

# Kill if needed
pkill -9 -f "node dist/index.js"
```

---

### Issue: "Payment timeout"

**Reasons:**
- Took longer than 3 minutes to approve
- Browser window closed accidentally
- Network issues

**Solution:**
- Try the request again
- Payment UI will reopen
- Approve within 3 minutes

---

## Configuration Options

### Change Payment Recipient

To receive payments at a different address:

```json
"env": {
  "PAYMENT_RECIPIENT": "0xYourWalletAddress"
}
```

### Change Network

For mainnet (when ready):

```json
"env": {
  "CHAIN_ID": "8453",
  "RPC_URL": "https://mainnet.base.org",
  "PAYMENT_TOKEN_ADDRESS": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
}
```

### Add More Tools

Edit `src/tools.ts` to add your own paid APIs!

---

## Testing Checklist

After configuring Claude Desktop:

- [ ] Claude Desktop restarted
- [ ] MCP server appears in Claude
- [ ] Free tool works (`get_service_info`)
- [ ] Paid tool triggers payment UI
- [ ] MetaMask connects successfully
- [ ] Signature request appears
- [ ] Payment completes
- [ ] Tool executes and returns result

---

## Example Conversations

### Test 1: Service Info (Free)
```
You: What Nexus tools are available?
Claude: [Lists all 5 tools with pricing]

You: Use get_service_info
Claude: [Returns service information, no payment needed]
```

### Test 2: Weather (Paid - 0.10 USDC)
```
You: What's the weather in New York?
Claude: I'll check the weather. This costs 0.10 USDC.
[Payment UI opens]
[You approve payment]
Claude: ✅ Payment successful! Here's the weather...
```

### Test 3: Web Search (Paid - 0.15 USDC)
```
You: Search the web for "latest AI news"
Claude: This requires 0.15 USDC for web search.
[Payment UI opens]
[You approve]
Claude: ✅ Paid. Here are the latest AI news...
```

### Test 4: Image Generation (Paid - 0.25 USDC)
```
You: Generate an image of a sunset over mountains
Claude: Image generation costs 0.25 USDC.
[Payment UI opens]
[You approve]
Claude: ✅ Payment received. Generating image...
[Returns generated image]
```

---

## Production Deployment

When ready for mainnet:

1. **Switch to Base Mainnet:**
   - Chain ID: 8453
   - USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

2. **Test with small amounts first**

3. **Set up monitoring:**
   - Track payment success rate
   - Monitor transaction fees
   - Alert on failures

4. **Add receipts:**
   - Email confirmations
   - Transaction history
   - Downloadable invoices

---

## Support

**Issues?**
- Check logs in Claude Desktop
- Review TEST-GUIDE.md
- Check VERIFICATION-REPORT.md
- All documentation in project root

**Ready to accept payments!** 🚀

---

**Next:** Start Claude Desktop and test the integration!
