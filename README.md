# 🚀 Nexus MCP

**Payment-gate your APIs in seconds — powered by X402 and Thirdweb**

Turn any API into a pay-per-use service that AI agents can discover and pay for automatically.

---

## ✨ What is This?

Nexus MCP lets you:
- 💳 **Monetize APIs** with automatic micropayments (USDC)
- 🤖 **AI-native** - Works with Claude, ChatGPT, and any MCP client
- ⚡ **No setup friction** - No API keys, no accounts, just pay and use
- 🔐 **Secure** - X402 protocol ensures cryptographic payment verification

---

## 🎯 Quick Start

### 1. Install

```bash
cd nexus-mcp
npm install
npm run build
```

### 2. Configure

Copy `.env.example` to `.env` and add:

```bash
THIRDWEB_CLIENT_ID=your_client_id_here    # Get from thirdweb.com
PAYMENT_RECIPIENT=0xYourWalletAddress
```

Keep the defaults for testnet (Base Sepolia).

### 3. Test

```bash
npm run inspector
```

Opens a web UI at `http://localhost:5173` to test tools.

### 4. Connect to Claude Desktop

Edit your Claude config:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "nexus": {
      "command": "node",
      "args": ["/absolute/path/to/nexus-mcp/dist/index.js"],
      "env": {
        "THIRDWEB_CLIENT_ID": "your_client_id",
        "PAYMENT_RECIPIENT": "0xYourAddress",
        "CHAIN_ID": "84532",
        "PAYMENT_TOKEN_ADDRESS": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        "X402_FACILITATOR_URL": "https://facilitator.x402.org",
        "PERMIT2_ADDRESS": "0x000000000022D473030F116dDEE9F6B43aC78BA3"
      }
    }
  }
}
```

Restart Claude Desktop. Done! 🎉

---

## 🛠️ Available Tools

| Tool | Description | Price |
|------|-------------|-------|
| `get_weather` | Current weather for any city | 0.10 USDC |
| `generate_image` | AI image generation | 0.50 USDC |
| `search_web` | Real-time web search | 0.15 USDC |
| `analyze_data` | CSV/JSON analysis | 0.25 USDC |
| `get_service_info` | Service info | FREE |

---

## 💡 How It Works

1. AI agent calls a tool → Nexus returns payment requirements
2. User signs payment with wallet (no gas fees!)
3. X402 facilitator verifies and submits to blockchain
4. Nexus executes API and returns results

**Security**: Payments are locked to specific recipients via X402 witness pattern. No middleman can redirect funds.

---

## 🎨 Add Your Own APIs

Edit `src/tools.ts`:

```typescript
const myTool: ToolConfig = {
  name: 'my_api',
  description: 'What your API does',
  price: '0.10', // USDC per call
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'User input' },
      payment: { type: 'object', description: 'X402 payment proof' }
    },
    required: ['query']
  },
  handler: async (args: any) => {
    // Your API logic here
    const result = await callYourAPI(args.query);
    return { result };
  }
};

// Add to exports
export const tools: ToolConfig[] = [
  // ... existing tools
  myTool
];
```

Rebuild: `npm run build`

---

## 🔧 Troubleshooting

**Server won't start?**
- Check `.env` has `THIRDWEB_CLIENT_ID`
- Verify Node.js 18+ installed

**Tools not in Claude?**
- Use absolute paths in config
- Restart Claude completely
- Check logs: Help → Debug Info

**Payment fails?**
- Get testnet USDC from [Base Sepolia faucet](https://www.coinbase.com/faucets)
- Ensure wallet is on Base Sepolia network (Chain ID: 84532)

---

## 🌐 Networks

| Network | Chain ID | Status |
|---------|----------|--------|
| Base Sepolia (testnet) | 84532 | ✅ Active |
| Base Mainnet | 8453 | 🔜 Coming |

---

## 📚 Learn More

- **X402 Protocol**: [x402.org](https://x402.org)
- **Thirdweb**: [thirdweb.com](https://thirdweb.com)
- **MCP SDK**: [modelcontextprotocol.io](https://modelcontextprotocol.io)

---

## 📝 License

MIT License

---

## 👨‍💻 Author

**Boris Halachev**
- GitHub: [@borishalachev1](https://github.com/borishalachev1)
- Email: borishalachev636@gmail.com

Built with ❤️ using X402, Thirdweb, and MCP

---

⚠️ **Testnet software** - Use at your own risk
