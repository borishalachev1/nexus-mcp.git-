# Nexus MCP Examples

This folder contains working examples showing how to use Nexus MCP payment-gated tools.

## Available Examples

### 1. Simple Payment Generation

**Files:**
- `simple-payment-generation.ts` (TypeScript)
- `simple-payment-generation.py` (Python)

**What it does:**
- Generates an X402 payment proof
- Shows the minimal code needed

**Run:**
```bash
# TypeScript
export WALLET_PRIVATE_KEY="0x..."
cd examples
npm install
npx tsx simple-payment-generation.ts

# Python
export WALLET_PRIVATE_KEY="0x..."
cd examples
python simple-payment-generation.py
```

### 2. Full Claude Integration

**Files:**
- `typescript-example.ts` (TypeScript)
- `python-example.py` (Python)

**What it does:**
- Generates X402 payment proof
- Calls Claude API with MCP tools
- Demonstrates full end-to-end flow

**Run:**
```bash
# TypeScript
export WALLET_PRIVATE_KEY="0x..."
export ANTHROPIC_API_KEY="sk-ant-..."
cd examples
npm install
npx tsx typescript-example.ts

# Python
export WALLET_PRIVATE_KEY="0x..."
export ANTHROPIC_API_KEY="sk-ant-..."
cd examples
python python-example.py
```

## Prerequisites

### 1. Get a Wallet

You need an Ethereum wallet with USDC on Base Sepolia testnet.

**Option A: Create new wallet**
```typescript
import { generatePrivateKey } from 'viem/accounts';
const privateKey = generatePrivateKey();
console.log('Private key:', privateKey);
```

**Option B: Use existing wallet**
- Export private key from MetaMask, etc.
- ⚠️ Never share or commit private keys!

### 2. Get Testnet USDC

1. Get Sepolia ETH: https://sepoliafaucet.com/
2. Bridge to Base Sepolia: https://bridge.base.org/
3. Swap for USDC on testnet DEX

### 3. Get API Keys

**Thirdweb** (for Nexus server):
- Sign up: https://thirdweb.com/
- Create project
- Get Client ID from dashboard

**Anthropic** (for Claude examples):
- Sign up: https://console.anthropic.com/
- Create API key
- Free tier includes credits

## Configuration

All examples use these environment variables:

```bash
# Required for payment generation
WALLET_PRIVATE_KEY="0x..."

# Required for Claude examples
ANTHROPIC_API_KEY="sk-ant-..."

# Nexus configuration (examples use these defaults)
NEXUS_CHAIN_ID=84532  # Base Sepolia
NEXUS_TOKEN_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
NEXUS_RECIPIENT=0xYourNexusWallet
```

## Example Output

### Simple Payment Generation

```json
{
  "permitted": {
    "token": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "amount": "100000"
  },
  "spender": "0x1234...",
  "nonce": "1704067200123",
  "deadline": 1704067500,
  "witness": {
    "recipient": "0x1234...",
    "amount": "100000"
  },
  "signature": "0xabcdef..."
}
```

### Full Integration

```
Generating payment proof for 0.10 USDC...
Payment proof generated ✓

Calling weather tool via Claude...

Claude wants to use tool: nexus:get_weather

Tool input with payment:
{
  "city": "London",
  "payment": { ... }
}

✓ Payment proof attached to tool call
The Nexus MCP server will verify and settle the payment.

✅ Done! The tool will execute after payment verification.
```

## Modifying Examples

### Change Payment Amount

```typescript
// From
const proof = await client.generatePaymentProof('0.10');

// To
const proof = await client.generatePaymentProof('0.25'); // For analyze_data tool
```

### Change Tool

```typescript
// Call different tool
const response = await anthropic.messages.create({
  // ...
  messages: [
    {
      role: 'user',
      content: 'Generate an image of a sunset', // Different query
    }
  ],
  tools: [
    {
      name: 'nexus:generate_image', // Different tool
      description: 'Generate AI images. (0.50 USDC/image)',
      input_schema: {
        // ...
        properties: {
          prompt: { type: 'string' },
          style: { type: 'string', enum: ['realistic', 'anime', 'oil-painting', 'digital-art'] },
          payment: { type: 'object' }
        }
      }
    }
  ]
});

// Generate payment for 0.50 USDC
const proof = await client.generatePaymentProof('0.50');
```

### Use Different Network

```typescript
// Base Mainnet
const config = {
  chainId: 8453,
  tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  recipientAddress: '0x...',
};

// Arbitrum One
const config = {
  chainId: 42161,
  tokenAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  recipientAddress: '0x...',
};
```

## Troubleshooting

### "Insufficient funds" error

You need USDC in your wallet. See "Get Testnet USDC" above.

### "Invalid signature" error

- Check `recipientAddress` matches Nexus server config
- Verify `chainId` and `tokenAddress` are correct

### "Module not found" error

```bash
# TypeScript
npm install

# Python
pip install -r ../client/python/requirements.txt
```

### "Payment deadline expired" error

Payment proofs expire after 5 minutes. Regenerate and try again.

## Building Your Own

Use these examples as templates:

1. Copy an example file
2. Modify the tool name and input
3. Adjust payment amount
4. Run and test

Example custom tool:

```typescript
const proof = await client.generatePaymentProof('0.20');

const result = await mcpClient.callTool('nexus:my_custom_tool', {
  input: 'my data',
  payment: proof,
});
```

## Next Steps

- Read [CLIENT-SETUP-GUIDE.md](../docs/CLIENT-SETUP-GUIDE.md) for detailed setup
- Check [API-REFERENCE.md](../docs/API-REFERENCE.md) for all available tools
- See [ARCHITECTURE.md](../docs/ARCHITECTURE.md) to understand how it works

## Support

- GitHub Issues: https://github.com/borishalachev1/nexus-mcp/issues
- Documentation: https://github.com/borishalachev1/nexus-mcp
