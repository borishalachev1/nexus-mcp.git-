# 💳 Nexus MCP - Automatic Payment UI Setup

## 🎉 What's New

Your Nexus MCP server now includes **automatic payment handling**! When Claude (or any AI agent) requests a paid tool, a beautiful payment UI will automatically open in your browser for you to approve the payment.

## ✨ How It Works

```
1. Claude requests a paid tool (e.g., weather lookup)
   ↓
2. Nexus MCP detects payment is required
   ↓
3. 🌐 Payment UI opens in your browser automatically
   ↓
4. You connect your wallet and approve payment
   ↓
5. Tool executes and returns results to Claude
```

## 🚀 Quick Start

### 1. Start the Server

```bash
cd nexus-mcp
npm start
```

You'll see:
```
💳 Payment UI running at http://localhost:3402
   Open this URL in your browser to approve payments

🚀 Nexus MCP Server running
📡 Powered by X402 Protocol + Thirdweb
💳 Payment recipient: 0xYourAddress
⛓️  Chain: 84532
🔧 Available tools: 5
🌐 Payment UI: http://localhost:3402

Waiting for MCP client connection...
```

### 2. Connect to Claude Desktop

Add to your Claude config (`%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "nexus": {
      "command": "node",
      "args": ["C:\\Users\\boris\\nexus-mcp\\dist\\index.js"],
      "env": {
        "THIRDWEB_CLIENT_ID": "your_client_id_here",
        "PAYMENT_RECIPIENT": "0xYourWalletAddress"
      }
    }
  }
}
```

**Important**: Use the full absolute path to `dist/index.js`

### 3. Restart Claude Desktop

Completely quit and restart Claude Desktop.

### 4. Test It!

In Claude, ask:
```
What tools do you have available?
```

Claude should list:
- ✅ nexus:get_service_info (FREE)
- 💰 nexus:get_weather (0.10 USDC)
- 💰 nexus:search_web (0.15 USDC)
- 💰 nexus:analyze_data (0.25 USDC)
- 💰 nexus:generate_image (0.50 USDC)

Then ask:
```
What's the weather in London?
```

**What happens next:**

1. ⚡ Payment UI opens automatically in your browser
2. 🔐 You connect your wallet (MetaMask, Coinbase, etc.)
3. ✍️ You approve the 0.10 USDC payment signature
4. ✅ Tool executes and Claude gets the weather!

## 🎨 Payment UI Features

The payment UI at `http://localhost:3402` includes:

- 🎯 **Beautiful Interface** - Modern, responsive design
- 🔒 **Secure** - Uses X402 protocol (no private keys stored)
- ⚡ **Fast** - Approval in seconds
- 💰 **Transparent** - Shows exact amount and recipient
- 🌐 **Multi-Wallet** - Works with MetaMask, Coinbase Wallet, WalletConnect, etc.

## 📋 Payment Flow Example

### In Your Terminal:
```
💳 Payment required for nexus:get_weather
   Requesting 0.10 USDC from user...

💳 PAYMENT REQUIRED
   Tool: nexus:get_weather
   Amount: 0.10 USDC
   
   👉 Opening payment page: http://localhost:3402?payment=pay_123...

✅ Payment approved by user

⛓️  Settling payment on-chain...
✅ Payment settled: 0xabc123...
```

### In Your Browser:
1. Page opens showing payment details
2. Click "Connect Wallet"
3. Approve connection in your wallet
4. Click "Approve Payment"
5. Sign the message (no gas fees!)
6. ✅ Success! Tool executes

### In Claude:
```
The current weather in London is 15°C and partly cloudy.
Payment verified ✓
Transaction: 0xabc123...
```

## 🔧 Configuration

### Environment Variables

All settings in `.env`:

```bash
# Required
THIRDWEB_CLIENT_ID=your_client_id        # Get from thirdweb.com
PAYMENT_RECIPIENT=0xYourWallet           # Where payments go

# Optional (defaults shown)
CHAIN_ID=84532                           # Base Sepolia testnet
PAYMENT_TOKEN_ADDRESS=0x036CbD...        # USDC on Base Sepolia
X402_FACILITATOR_URL=https://...         # X402 payment processor
PERMIT2_ADDRESS=0x000000000022...        # Canonical Permit2
```

### Supported Networks

| Network | Chain ID | USDC Address |
|---------|----------|--------------|
| Base Sepolia (testnet) | 84532 | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| Base Mainnet | 8453 | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Arbitrum One | 42161 | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` |

## 🎓 For Users (No Coding Required!)

You don't need to write any code! Just:

1. ✅ Start the Nexus server
2. ✅ Connect Claude Desktop
3. ✅ Ask Claude to use a tool
4. ✅ Approve payment in browser
5. ✅ Done!

**No programming, no command line (except starting the server), no complex setup!**

## 🔐 Security

### What's Secure:
- ✅ No private keys stored anywhere
- ✅ Payments use EIP-712 signatures (industry standard)
- ✅ Amount and recipient locked in signature
- ✅ Payments settle on-chain (verifiable)
- ✅ No gas fees for you (uses Permit2)

### What You Control:
- ✅ You approve every payment manually
- ✅ You see exactly what you're paying
- ✅ You can cancel anytime
- ✅ Your wallet, your keys, your control

## 🐛 Troubleshooting

### "Payment UI won't open"

**Issue**: Browser doesn't open automatically

**Solution**: Manually open `http://localhost:3402`

---

### "Can't connect wallet"

**Issue**: Wallet connection fails

**Solutions**:
1. Make sure you have a Web3 wallet installed (MetaMask, Coinbase Wallet, etc.)
2. Try a different wallet
3. Refresh the page and try again

---

### "Payment approval failed"

**Issue**: Transaction fails or times out

**Solutions**:
1. Check you have USDC in your wallet
2. Make sure you're on the correct network (Base Sepolia for testing)
3. Try again - payment proofs expire after 5 minutes

---

### "Tool says payment required but UI doesn't open"

**Issue**: Server can't launch browser

**Solutions**:
1. Manually navigate to `http://localhost:3402`
2. Look for the payment ID in server logs
3. Use that URL directly

---

### "How do I get testnet USDC?"

For testing on Base Sepolia:

1. Get Sepolia ETH from https://sepoliafaucet.com/
2. Bridge to Base Sepolia: https://bridge.base.org/
3. Swap ETH for USDC on a testnet DEX

## 📊 What Gets Logged

Server logs show:

```
💳 Payment required for nexus:get_weather
   Requesting 0.10 USDC from user...

💳 PAYMENT REQUIRED
   Tool: nexus:get_weather
   Amount: 0.10 USDC

   👉 Opening payment page: http://localhost:3402?payment=pay_...

🔌 Payment UI client connected
✅ Payment approved by user

⛓️  Settling payment on-chain...
✅ Payment settled: 0xabc123...
```

## 🎯 Next Steps

### Start Using It

1. Ask Claude to use different tools
2. Try different payment amounts
3. Experiment with your own tools

### Go to Mainnet

When ready for production:

1. Update `.env` to use Base Mainnet (Chain ID: 8453)
2. Update USDC address to mainnet
3. Get real USDC on Base
4. Start accepting real payments!

### Build Custom Tools

Add your own payment-gated APIs in `src/tools.ts`:

```typescript
const myTool: ToolConfig = {
  name: 'nexus:my_api',
  description: 'My awesome API (0.05 USDC/call)',
  price: '0.05',
  inputSchema: {
    type: 'object',
    properties: {
      input: { type: 'string' },
      payment: { type: 'object' }
    },
    required: ['input', 'payment']
  },
  handler: async (args) => {
    // Your API logic
    return { result: 'success' };
  }
};
```

## 💡 Tips

- **Keep the server running** - Leave it open in a terminal while using Claude
- **Browser stays open** - The payment UI can stay open in a tab for quick approvals
- **Check transaction hashes** - All payments are verifiable on-chain
- **Test with small amounts** - Start with 0.01 USDC to test the flow

## 🎉 Success Indicators

You know it's working when you see:

✅ Server starts with "Payment UI running at..."
✅ Claude lists the Nexus tools
✅ Browser opens automatically when payment needed
✅ Payment approves successfully
✅ Tool executes and returns results
✅ Transaction hash appears in logs

## 📞 Support

Having issues?

1. Check the troubleshooting section above
2. Review server logs for errors
3. Check browser console for errors
4. Open an issue on GitHub with full error details

## 🌟 You're All Set!

You now have a fully functional payment-gated AI agent system! Claude can use premium tools and you approve payments with a simple browser click.

**Enjoy your monetized AI tools! 🚀**

---

*Powered by X402 Protocol + Thirdweb + Model Context Protocol*
