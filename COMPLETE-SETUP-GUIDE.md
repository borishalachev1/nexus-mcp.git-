# 🚀 Complete Setup Guide - Nexus MCP with Automatic Payment UI

## 🎯 What You're Building

A complete payment-gated AI agent system where:
- Claude (or any AI) can discover and use your premium tools
- Payment UI automatically opens in browser when payment needed
- You approve payments with one click
- Payments settle on-chain with USDC
- Everything is secure, verifiable, and automatic

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
cd nexus-mcp
npm install
npm run build
```

### Step 2: Get Thirdweb Client ID

1. Go to https://thirdweb.com/dashboard
2. Sign in (free account)
3. Create a new project
4. Copy your **Client ID**

### Step 3: Configure Environment

Create `.env` file:

```bash
# Copy from example
cp .env.example .env

# Edit .env and add:
THIRDWEB_CLIENT_ID=your_client_id_from_thirdweb
PAYMENT_RECIPIENT=0xYourWalletAddressHere
```

**Get your wallet address**: From MetaMask or any Web3 wallet

### Step 4: Start the Server

```bash
npm start
```

You should see:
```
💳 Payment UI running at http://localhost:3402
🚀 Nexus MCP Server running
🌐 Payment UI: http://localhost:3402
```

### Step 5: Connect to Claude Desktop

**Windows**: Edit `%APPDATA%\Claude\claude_desktop_config.json`
**Mac**: Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

Add this (update the path to match your system):

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

**Important**: 
- Use **full absolute path** to `dist/index.js`
- On Windows, use double backslashes: `C:\\Users\\...`
- On Mac/Linux, use forward slashes: `/Users/...`

### Step 6: Restart Claude

1. Completely quit Claude Desktop (not just close window)
2. Start it again
3. Wait 10 seconds for MCP to connect

### Step 7: Test!

Ask Claude:
```
What Nexus tools do you have?
```

Claude should respond with 5 tools including:
- ✅ get_service_info (FREE)
- 💰 get_weather (0.10 USDC)
- 💰 search_web (0.15 USDC)
- 💰 analyze_data (0.25 USDC)
- 💰 generate_image (0.50 USDC)

Then try a paid tool:
```
What's the weather in London?
```

**What happens:**
1. 🌐 Browser opens to http://localhost:3402
2. 💳 Payment UI shows: "0.10 USDC required"
3. 🔐 You connect your wallet
4. ✅ You approve the payment
5. ⚡ Tool executes and Claude gets the result!

## 🎨 Full Payment Flow Walkthrough

### In Terminal (Server Logs):

```bash
💳 Payment required for nexus:get_weather
   Requesting 0.10 USDC from user...

💳 PAYMENT REQUIRED
   Tool: nexus:get_weather
   Amount: 0.10 USDC
   
   👉 Opening payment page: http://localhost:3402?payment=pay_1735...

🔌 Payment UI client connected
✅ Payment approved by user

⛓️  Settling payment on-chain...
✅ Payment settled: 0xabc123def456...
```

### In Browser (Payment UI):

**Screen 1: Payment Details**
```
💳 Payment Required
━━━━━━━━━━━━━━━━━━━
Tool:     get_weather
Amount:   0.10 USDC
Network:  Base Sepolia

[ Connect Wallet ]
```

**Screen 2: After Connecting**
```
✅ Wallet Connected
0x1234...5678

[ Approve Payment ]
```

**Screen 3: Processing**
```
⏳ Processing payment...
Please wait while we verify
```

**Screen 4: Success!**
```
✅ Payment Approved!
Your tool is now executing...
You can close this window
```

### In Claude:

```
The current weather in London is 15°C with partly cloudy skies.

✅ Payment verified
Transaction: 0xabc123def456...
```

## 📁 Project Structure

```
nexus-mcp/
├── dist/                        # Compiled JavaScript
│   ├── index.js                 # Main server
│   ├── payment-ui-server.js     # Payment UI backend
│   └── ...
│
├── ui/                          # Payment UI frontend
│   └── payment.html             # Beautiful payment interface
│
├── src/                         # TypeScript source
│   ├── index.ts                 # Main MCP server
│   ├── payment-ui-server.ts     # Express + Socket.IO server
│   ├── wallet-connector.ts      # Thirdweb wallet integration
│   ├── payment.ts               # Payment verification
│   ├── tools.ts                 # Tool definitions
│   └── ...
│
├── client/                      # Client libraries
│   ├── typescript/              # For TypeScript apps
│   └── python/                  # For Python apps
│
├── docs/                        # Documentation
├── examples/                    # Code examples
└── .env                         # Your configuration
```

## 🔧 Advanced Configuration

### Custom Port for Payment UI

Default is `3402`. To change:

Edit `src/payment-ui-server.ts`:
```typescript
private port = 3402; // Change to your preferred port
```

### Add Custom Tools

Edit `src/tools.ts`:

```typescript
import type { ToolConfig } from './types.js';

const myCustomTool: ToolConfig = {
  name: 'nexus:my_tool',
  description: 'My awesome tool (0.05 USDC/call)',
  price: '0.05',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Your input'
      },
      payment: {
        type: 'object',
        description: 'X402 payment proof for 0.05 USDC'
      }
    },
    required: ['query', 'payment']
  },
  handler: async (args: any) => {
    // Your API logic here
    const result = await yourAPI(args.query);
    return { result };
  }
};

// Add to exports
export const tools: ToolConfig[] = [
  serviceInfoTool,
  searchWebTool,
  getWeatherTool,
  analyzeDataTool,
  generateImageTool,
  myCustomTool, // ← Your tool
];
```

Then rebuild:
```bash
npm run build
```

### Customize Payment UI

Edit `ui/payment.html` to customize:
- Colors and styling (Tailwind CSS)
- Wallet connection options
- Payment flow messages
- Branding

## 🌐 Network Configuration

### Testnet (Default - Base Sepolia)

Good for testing:

```bash
CHAIN_ID=84532
PAYMENT_TOKEN_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

**Get testnet USDC:**
1. Get Sepolia ETH: https://sepoliafaucet.com/
2. Bridge to Base Sepolia: https://bridge.base.org/
3. Swap for testnet USDC

### Production (Base Mainnet)

When ready for real payments:

```bash
CHAIN_ID=8453
PAYMENT_TOKEN_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

**Get real USDC:**
1. Buy USDC on any exchange
2. Withdraw to Base network
3. You're ready!

### Alternative: Arbitrum One

For lower fees:

```bash
CHAIN_ID=42161
PAYMENT_TOKEN_ADDRESS=0xaf88d065e77c8cC2239327C5EDb3A432268e5831
```

## 🔒 Security Best Practices

### ✅ DO:
- Keep `.env` file secure and private
- Use testnet for testing
- Verify payment amounts before approving
- Check transaction hashes on block explorer
- Keep your wallet seed phrase safe

### ❌ DON'T:
- Share your `.env` file
- Commit `.env` to git (it's in `.gitignore`)
- Approve payments you don't recognize
- Use mainnet without testing first
- Store private keys in the code

## 🐛 Troubleshooting

### Server Issues

**Problem**: `npm start` fails

**Solutions**:
```bash
# Clean install
rm -rf node_modules
npm install

# Rebuild
npm run build

# Check Node version (need 18+)
node --version
```

---

**Problem**: "Cannot find module '@modelcontextprotocol/sdk'"

**Solution**:
```bash
npm install --legacy-peer-deps
npm run build
```

---

**Problem**: "Payment UI won't start"

**Solution**:
```bash
# Check if port 3402 is in use
# Windows:
netstat -ano | findstr :3402

# Mac/Linux:
lsof -i :3402

# Kill the process if needed
```

### Claude Desktop Issues

**Problem**: Tools not showing in Claude

**Solutions**:
1. Check config file path is correct
2. Use **absolute paths** (full path from C:\ or /)
3. Restart Claude **completely** (quit app, not just close)
4. Check Claude logs: Help → View Logs
5. Wait 10-15 seconds after restart

---

**Problem**: "MCP server not responding"

**Solutions**:
1. Make sure Nexus server is running (`npm start`)
2. Check no errors in server terminal
3. Verify config JSON is valid (use JSONLint)
4. Try removing and re-adding the config

### Payment UI Issues

**Problem**: Browser doesn't open automatically

**Solution**: Manually navigate to `http://localhost:3402`

---

**Problem**: "Can't connect wallet"

**Solutions**:
1. Install a Web3 wallet (MetaMask, Coinbase Wallet, etc.)
2. Make sure wallet is unlocked
3. Try a different browser
4. Check wallet is on correct network

---

**Problem**: "Payment approval fails"

**Solutions**:
1. Check you have USDC in wallet
2. Verify you're on the correct network (Base Sepolia for testing)
3. Try refreshing the page
4. Check wallet for pending transactions

## 📊 Monitoring and Logs

### Server Logs

The server logs everything:

```bash
# Payment requests
💳 Payment required for nexus:get_weather
   Requesting 0.10 USDC from user...

# Payment approvals
✅ Payment approved by user

# Settlement
⛓️  Settling payment on-chain...
✅ Payment settled: 0xabc123...

# Tool execution
Executing tool: nexus:get_weather
```

### Verify Transactions

All payments are verifiable on-chain:

**Base Sepolia (testnet)**: https://sepolia.basescan.org/tx/0xYourTxHash
**Base Mainnet**: https://basescan.org/tx/0xYourTxHash
**Arbitrum One**: https://arbiscan.io/tx/0xYourTxHash

## 🎓 Usage Tips

### For Daily Use

1. **Keep server running**: Leave it in a terminal tab while using Claude
2. **Payment UI tab**: Keep `http://localhost:3402` open for quick approvals
3. **Check amounts**: Always verify payment amounts before approving
4. **Transaction history**: Check your wallet for payment history

### For Development

1. **Test on testnet first**: Use Base Sepolia before mainnet
2. **Start with small amounts**: Test with 0.01 USDC first
3. **Monitor logs**: Watch server logs for errors
4. **Test all tools**: Try each tool to ensure they work

### For Production

1. **Use mainnet config**: Switch to Chain ID 8453 (Base) or 42161 (Arbitrum)
2. **Real USDC**: Get actual USDC on the correct network
3. **Monitor closely**: Watch for errors and failed payments
4. **Keep backups**: Save your .env file securely

## 📈 What's Next?

### Immediate Next Steps

1. ✅ Test all 5 tools with Claude
2. ✅ Try different payment amounts
3. ✅ Verify transactions on block explorer
4. ✅ Build your first custom tool

### Advanced Features

- Add more tools with different prices
- Integrate your own APIs
- Customize the payment UI
- Deploy to a server for 24/7 access
- Build a web dashboard for analytics

### Go to Production

1. Switch to mainnet configuration
2. Get real USDC on Base or Arbitrum
3. Set competitive tool prices
4. Market your AI tools
5. Accept payments from real users!

## 🎉 Success Checklist

You're all set when you can:

- ✅ Start the server without errors
- ✅ See tools listed in Claude
- ✅ Ask Claude to use a paid tool
- ✅ Payment UI opens automatically
- ✅ Connect wallet successfully
- ✅ Approve payment
- ✅ Tool executes and returns results
- ✅ Transaction appears on block explorer

## 💰 Monetization Ideas

### What You Can Charge For:

- **Premium data**: Real-time market data, weather, news
- **AI services**: Image generation, text analysis, summarization
- **API access**: Third-party API calls (you're the middleman)
- **Computation**: Heavy processing, simulations, analytics
- **Custom tools**: Industry-specific tools and services

### Pricing Strategies:

- **Micro-pricing**: $0.01-$0.10 per call (high volume)
- **Standard**: $0.25-$1.00 per call (quality APIs)
- **Premium**: $1.00+ per call (exclusive data/services)
- **Tiered**: Different prices for different service levels

## 📞 Getting Help

### Resources

- **Documentation**: `/docs` folder
- **Examples**: `/examples` folder
- **This guide**: `COMPLETE-SETUP-GUIDE.md`
- **Payment UI guide**: `PAYMENT-UI-SETUP.md`

### Community

- GitHub Issues: Report bugs and ask questions
- GitHub Discussions: Share ideas and get help
- Discord: (coming soon)

### Debugging Steps

1. Check server logs for errors
2. Check browser console (F12) for errors
3. Verify all environment variables are set
4. Test with free tool first (`get_service_info`)
5. Try payment UI manually at `http://localhost:3402`

## 🌟 You're Ready!

Congratulations! You now have a complete, production-ready payment-gated AI agent system.

**What you built:**
- ✅ MCP server with 5 tools
- ✅ Automatic payment UI
- ✅ Wallet integration
- ✅ On-chain payment settlement
- ✅ Claude Desktop integration

**What you can do:**
- 💰 Accept payments for AI tools
- 🚀 Build custom paid APIs
- 🌐 Monetize your services
- 🤖 Let AI agents pay autonomously

**Start building the future of AI payments! 🎉**

---

*Built with X402 Protocol, Thirdweb, and Model Context Protocol*
*Made by Boris Halachev - 2026*
