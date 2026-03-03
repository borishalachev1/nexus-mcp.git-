# 🚀 Nexus MCP

[![CI](https://github.com/borishalachev1/nexus-mcp.git-/actions/workflows/ci.yml/badge.svg)](https://github.com/borishalachev1/nexus-mcp.git-/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![X402](https://img.shields.io/badge/X402-Protocol-orange)](https://x402.org)

**Payment-gate your APIs in seconds — powered by X402 and Thirdweb**

Turn any API into a pay-per-use service that AI agents can discover and pay for automatically using crypto micropayments.

---

## ✨ What is This?

Nexus MCP lets you:
- 💳 **Monetize APIs** with automatic micropayments (USDC on Base/Arbitrum)
- 🤖 **AI-native** - Works with Claude, ChatGPT, and any MCP-compatible AI agent
- ⚡ **No setup friction** - No API keys, no accounts, just sign and pay
- 🔐 **Secure** - X402 protocol with cryptographic payment verification
- 🌐 **Decentralized** - No intermediaries can redirect your payments

---

## 📚 Documentation

- **[Client Setup Guide](./docs/CLIENT-SETUP-GUIDE.md)** - How to use Nexus tools from your app
- **[API Reference](./docs/API-REFERENCE.md)** - Complete API documentation
- **[Architecture](./docs/ARCHITECTURE.md)** - Technical deep-dive
- **[Examples](./examples/)** - Working code examples

---

## 🎯 Quick Start (Server Setup)

### 1. Install

```bash
cd nexus-mcp
npm install
npm run build
```

### 2. Configure

Copy `.env.example` to `.env` and configure:

```bash
# Required
THIRDWEB_CLIENT_ID=your_client_id_here        # Get from thirdweb.com
PAYMENT_RECIPIENT=0xYourWalletAddress          # Your wallet for receiving payments

# Optional (defaults are for Base Sepolia testnet)
CHAIN_ID=84532
PAYMENT_TOKEN_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
X402_FACILITATOR_URL=https://facilitator.x402.org
PERMIT2_ADDRESS=0x000000000022D473030F116dDEE9F6B43aC78BA3
```

### 3. Test Locally

```bash
npm run inspector
```

Opens MCP Inspector at `http://localhost:5173` to test tools interactively.

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

## 💰 Using Payment-Gated Tools (Client Side)

To call Nexus tools that require payment, you need to generate X402 payment proofs. We provide client libraries for this:

### TypeScript Example

```typescript
import { X402Client } from './client/typescript/x402-client.js';

// Initialize client with your wallet
const client = new X402Client(
  process.env.WALLET_PRIVATE_KEY as `0x${string}`,
  {
    chainId: 84532, // Base Sepolia
    tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC
    recipientAddress: '0xNexusWalletAddress',
  }
);

// Generate payment proof for 0.10 USDC
const paymentProof = await client.generatePaymentProof('0.10');

// Use with MCP tool
const result = await mcpClient.callTool('nexus:get_weather', {
  city: 'London',
  payment: paymentProof, // ← Payment proof
});
```

### Python Example

```python
from x402_client import X402Client

# Initialize client with your wallet
client = X402Client(
    private_key=os.getenv('WALLET_PRIVATE_KEY'),
    chain_id=84532,
    token_address='0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    recipient_address='0xNexusWalletAddress'
)

# Generate payment proof for 0.10 USDC
payment_proof = client.generate_payment_proof('0.10')

# Use with MCP tool
result = mcp_client.call_tool('nexus:get_weather', {
    'city': 'London',
    'payment': payment_proof.to_dict()
})
```

**📖 Full setup guide**: See [docs/CLIENT-SETUP-GUIDE.md](./docs/CLIENT-SETUP-GUIDE.md)

---

## 🛠️ Available Tools

| Tool | Description | Price |
|------|-------------|-------|
| `nexus:get_service_info` | Get service info and available tools | **FREE** |
| `nexus:get_weather` | Current weather for any city | 0.10 USDC |
| `nexus:search_web` | Real-time web search | 0.15 USDC |
| `nexus:analyze_data` | CSV/JSON data analysis | 0.25 USDC |
| `nexus:generate_image` | AI image generation | 0.50 USDC |

---

## 💡 How Payment Flow Works

```
1. Client generates X402 payment proof
   ↓
2. Client calls MCP tool with payment attached
   ↓
3. Nexus MCP Server verifies payment signature
   ↓
4. X402 Facilitator settles payment on-chain
   ↓
5. Tool executes and returns result + transaction hash
```

**Security Features:**
- ✅ Payments locked to specific recipient (no middleman can redirect)
- ✅ Amount and token verified before execution
- ✅ Deadline prevents replay attacks
- ✅ On-chain settlement provides proof of payment
- ✅ No gas fees for users (Permit2 signature-based)

---

## 🎨 Add Your Own APIs

### Step 1: Define Tool

Edit `src/tools.ts`:

```typescript
import type { ToolConfig } from './types.js';

const myTool: ToolConfig = {
  name: 'nexus:my_api',
  description: 'What your API does (X.XX USDC/call)',
  price: '0.10', // USDC per call
  inputSchema: {
    type: 'object',
    properties: {
      query: { 
        type: 'string', 
        description: 'User input' 
      },
      payment: { 
        type: 'object', 
        description: 'X402 payment proof for 0.10 USDC' 
      }
    },
    required: ['query', 'payment'] // payment required for paid tools
  },
  handler: async (args: any) => {
    // Your API logic here
    const result = await callYourAPI(args.query);
    return { result };
  }
};
```

### Step 2: Export Tool

```typescript
export const tools: ToolConfig[] = [
  serviceInfoTool,
  searchWebTool,
  getWeatherTool,
  analyzeDataTool,
  generateImageTool,
  myTool, // ← Add your tool
];
```

### Step 3: Rebuild

```bash
npm run build
npm start
```

---

## 🔧 Troubleshooting

### Server Issues

**Server won't start?**
- ✅ Check `.env` has all required variables
- ✅ Verify Node.js 18+ installed: `node --version`
- ✅ Try `npm run clean && npm run build`

**Tools not showing in Claude?**
- ✅ Use absolute paths in config (not relative)
- ✅ Restart Claude Desktop completely
- ✅ Check logs: Help → View Logs

### Payment Issues

**"Payment required" error?**
- ✅ You need to generate and include X402 payment proof
- ✅ See [CLIENT-SETUP-GUIDE.md](./docs/CLIENT-SETUP-GUIDE.md)

**"Invalid payment signature" error?**
- ✅ Verify recipient address matches Nexus server config
- ✅ Check chain ID and token address are correct
- ✅ Ensure private key is valid

**"Payment deadline expired" error?**
- ✅ Payment proofs expire after 5 minutes (default)
- ✅ Generate a fresh payment proof and retry

**Need testnet USDC?**
- ✅ Get Sepolia ETH from [faucet](https://sepoliafaucet.com/)
- ✅ Bridge to Base Sepolia: https://bridge.base.org/
- ✅ Swap for USDC on testnet DEX

---

## 🌐 Supported Networks

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

## 🤝 Contributing

Contributions are welcome! Please read:
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Community standards

---

## 🔒 Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

---

## 📝 License

MIT License - See [LICENSE](LICENSE) file

---

## 👨‍💻 Author

**Boris Halachev**
- GitHub: [@borishalachev1](https://github.com/borishalachev1)
- Email: borishalachev636@gmail.com
- Portfolio: Coming soon

---

## 🙏 Acknowledgments

- **[X402 Protocol](https://x402.org)** - Decentralized payment verification by Coinbase
- **[Thirdweb](https://thirdweb.com)** - Web3 development platform
- **[Anthropic](https://anthropic.com)** - Model Context Protocol (MCP) SDK

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/borishalachev1/nexus-mcp.git-?style=social)
![GitHub forks](https://img.shields.io/github/forks/borishalachev1/nexus-mcp.git-?style=social)
![GitHub issues](https://img.shields.io/github/issues/borishalachev1/nexus-mcp.git-)

---

**Built with ❤️ for the decentralized future**

⚠️ **Testnet software** - Always audit before production use
