# 🚀 Nexus MCP Quickstart

Get started with Nexus MCP in 5 minutes!

## What You'll Learn

1. How to run the Nexus MCP server
2. How to generate X402 payment proofs
3. How to call payment-gated tools

---

## Option 1: Use Nexus Tools (Client)

**You want to call payment-gated APIs from your AI agent.**

### Prerequisites

- Node.js 18+ or Python 3.8+
- A crypto wallet with USDC on Base Sepolia (testnet)
- Wallet private key

### Step 1: Install Client Library

**TypeScript:**
```bash
cd nexus-mcp/client/typescript
npm install
npm run build
```

**Python:**
```bash
cd nexus-mcp/client/python
pip install -r requirements.txt
```

### Step 2: Set Environment Variables

```bash
export WALLET_PRIVATE_KEY="0xYourPrivateKeyHere"
```

⚠️ **Never commit private keys to git!**

### Step 3: Generate Payment Proof

**TypeScript:**
```typescript
import { X402Client } from './x402-client.js';

const client = new X402Client(
  process.env.WALLET_PRIVATE_KEY as `0x${string}`,
  {
    chainId: 84532,
    tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    recipientAddress: '0xNexusWalletAddress', // Get from Nexus operator
  }
);

const proof = await client.generatePaymentProof('0.10');
console.log(proof);
```

**Python:**
```python
from x402_client import X402Client
import os

client = X402Client(
    private_key=os.getenv('WALLET_PRIVATE_KEY'),
    chain_id=84532,
    token_address='0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    recipient_address='0xNexusWalletAddress'
)

proof = client.generate_payment_proof('0.10')
print(proof.to_dict())
```

### Step 4: Call Tool with Payment

```typescript
// Example: Call weather tool
const toolResult = await mcpClient.callTool('nexus:get_weather', {
  city: 'London',
  payment: proof,
});

console.log(toolResult);
```

**Output:**
```json
{
  "success": true,
  "data": {
    "city": "London",
    "temperature": "15°C",
    "conditions": "Partly cloudy"
  },
  "paymentVerified": true,
  "transactionHash": "0xabc123..."
}
```

✅ **You're done!** See [CLIENT-SETUP-GUIDE.md](./CLIENT-SETUP-GUIDE.md) for more details.

---

## Option 2: Run Nexus Server (Provider)

**You want to monetize your own APIs with payment gates.**

### Prerequisites

- Node.js 18+
- Thirdweb account (free at thirdweb.com)
- A wallet to receive payments

### Step 1: Install

```bash
cd nexus-mcp
npm install
```

### Step 2: Configure

Create `.env` file:

```bash
# Get from https://thirdweb.com/dashboard
THIRDWEB_CLIENT_ID=your_client_id_here

# Your wallet to receive payments
PAYMENT_RECIPIENT=0xYourWalletAddress

# Testnet defaults (Base Sepolia)
CHAIN_ID=84532
PAYMENT_TOKEN_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
X402_FACILITATOR_URL=https://facilitator.x402.org
PERMIT2_ADDRESS=0x000000000022D473030F116dDEE9F6B43aC78BA3
```

### Step 3: Build

```bash
npm run build
```

### Step 4: Test

```bash
npm run inspector
```

Open http://localhost:5173 in your browser. Try the free `get_service_info` tool!

### Step 5: Add to Claude Desktop

Edit Claude config:
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

**Important**: Use absolute paths!

### Step 6: Restart Claude

Quit Claude Desktop completely and restart.

### Step 7: Test in Claude

Ask Claude: "What Nexus tools are available?"

You should see 5 tools listed!

✅ **Server is running!** Now add your own APIs - see below.

---

## Add Your First Payment-Gated API

### Step 1: Create Tool Definition

Edit `src/tools.ts`:

```typescript
import type { ToolConfig } from './types.js';

const helloWorldTool: ToolConfig = {
  name: 'nexus:hello_world',
  description: 'Says hello with a personalized message. (0.01 USDC/call)',
  price: '0.01', // 1 cent per call
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name to greet',
      },
      payment: {
        type: 'object',
        description: 'X402 payment proof for 0.01 USDC',
      },
    },
    required: ['name', 'payment'],
  },
  handler: async (args: any) => {
    // Your custom logic here
    return {
      message: `Hello, ${args.name}! Thanks for paying 0.01 USDC!`,
      timestamp: new Date().toISOString(),
    };
  },
};

// Add to exports
export const tools: ToolConfig[] = [
  serviceInfoTool,
  searchWebTool,
  getWeatherTool,
  analyzeDataTool,
  generateImageTool,
  helloWorldTool, // ← Add here
];
```

### Step 2: Rebuild

```bash
npm run build
```

### Step 3: Test with Inspector

```bash
npm run inspector
```

Open http://localhost:5173, find your new tool, and test it!

### Step 4: Update Claude

Restart Claude Desktop. Your new tool is now available!

---

## Next Steps

### Learn More

- **[CLIENT-SETUP-GUIDE.md](./CLIENT-SETUP-GUIDE.md)** - Detailed client integration guide
- **[API-REFERENCE.md](./API-REFERENCE.md)** - Complete API documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - How it all works under the hood

### Get Testnet USDC

1. Get Sepolia ETH: https://sepoliafaucet.com/
2. Bridge to Base Sepolia: https://bridge.base.org/
3. Swap for USDC on a testnet DEX

### Connect Real APIs

Replace the demo tools with real API calls:

```typescript
handler: async (args: any) => {
  // Call your actual API
  const response = await fetch('https://api.example.com/data', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: args.query }),
  });
  
  return await response.json();
}
```

### Deploy to Production

**When you're ready for mainnet:**

1. Update `.env` to use Base Mainnet (Chain ID: 8453)
2. Update USDC address: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
3. Get real USDC on Base
4. Deploy server to cloud (Railway, Render, AWS, etc.)
5. Update Claude config with production server path

---

## Troubleshooting

### "Cannot find module" error

```bash
npm run clean
npm install
npm run build
```

### "Payment required" error

You need to generate an X402 payment proof. See Option 1 above.

### "Invalid signature" error

- Check recipient address matches server config
- Verify chain ID is correct (84532 for testnet)
- Regenerate payment proof

### Claude doesn't see tools

- Use **absolute paths** in config
- Restart Claude **completely** (Quit app, not just close window)
- Check logs: Help → View Logs

---

## Get Help

- **GitHub Issues**: https://github.com/borishalachev1/nexus-mcp/issues
- **Discord**: [Join community] (coming soon)
- **Email**: support@nexus.mcp (coming soon)

---

## What's Next?

- ⭐ Star the repo on GitHub
- 🔧 Build your first payment-gated API
- 💬 Share what you built in Issues
- 🤝 Contribute improvements via PRs

Happy building! 🚀
