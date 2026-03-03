# Nexus MCP Client Setup Guide

This guide shows you how to use Nexus MCP's payment-gated tools from your application.

## Overview

Nexus MCP uses the **X402 payment protocol** to gate API access with crypto micropayments. When you call a paid tool, you need to provide a cryptographic payment proof that gets verified and settled on-chain.

## What You Need

1. **A crypto wallet** with USDC on Base or Arbitrum
2. **The X402 client library** (TypeScript or Python)
3. **Your wallet private key** (keep this secure!)

## Quick Start

### TypeScript/JavaScript

**1. Install dependencies:**

```bash
cd client/typescript
npm install
npm run build
```

**2. Set up environment variables:**

```bash
export WALLET_PRIVATE_KEY="0xYourPrivateKeyHere"
```

**3. Generate a payment proof:**

```typescript
import { X402Client } from './client/typescript/x402-client.js';

const client = new X402Client(
  process.env.WALLET_PRIVATE_KEY as `0x${string}`,
  {
    chainId: 84532, // Base Sepolia testnet
    tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC
    recipientAddress: '0xNexusRecipientWallet', // Nexus wallet address
  }
);

// Generate proof for 0.10 USDC
const proof = await client.generatePaymentProof('0.10');
```

**4. Use it with MCP tools:**

```typescript
// When calling a Nexus tool, include the payment proof
const toolInput = {
  city: 'London',
  payment: proof, // <- X402 payment proof
};
```

### Python

**1. Install dependencies:**

```bash
cd client/python
pip install -r requirements.txt
```

**2. Set up environment variables:**

```bash
export WALLET_PRIVATE_KEY="0xYourPrivateKeyHere"
```

**3. Generate a payment proof:**

```python
from x402_client import X402Client

client = X402Client(
    private_key=os.getenv('WALLET_PRIVATE_KEY'),
    chain_id=84532,  # Base Sepolia testnet
    token_address='0x036CbD53842c5426634e7929541eC2318f3dCF7e',  # USDC
    recipient_address='0xNexusRecipientWallet',  # Nexus wallet address
)

# Generate proof for 0.10 USDC
proof = client.generate_payment_proof('0.10')
```

**4. Use it with MCP tools:**

```python
# When calling a Nexus tool, include the payment proof
tool_input = {
    'city': 'London',
    'payment': proof.to_dict(),  # <- X402 payment proof
}
```

## Supported Networks

| Network | Chain ID | USDC Address |
|---------|----------|--------------|
| Base Sepolia (testnet) | 84532 | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| Base Mainnet | 8453 | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Arbitrum One | 42161 | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` |

## Getting Testnet USDC

For testing on Base Sepolia:

1. Get Sepolia ETH from a faucet
2. Bridge to Base Sepolia: https://bridge.base.org/deposit
3. Get testnet USDC from Circle's faucet or swap ETH for USDC on a testnet DEX

## How It Works

1. **Generate Payment Proof**: Your client signs a Permit2 message authorizing the payment
2. **Call Tool**: Send the tool request with the payment proof to Nexus MCP
3. **Verification**: Nexus verifies the signature matches the expected amount and recipient
4. **Settlement**: The payment is settled on-chain via the X402 facilitator
5. **Execution**: The tool executes and returns the result

## Payment Proof Structure

```typescript
{
  permitted: {
    token: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    amount: "100000" // USDC has 6 decimals, so this is 0.10 USDC
  },
  spender: "0xRecipientAddress",
  nonce: "1234567890123",
  deadline: 1735689600, // Unix timestamp
  witness: {
    recipient: "0xRecipientAddress",
    amount: "100000"
  },
  signature: "0xabcdef..." // EIP-712 signature
}
```

## Security Best Practices

1. **Never hardcode private keys** - Use environment variables or secure key management
2. **Set reasonable deadlines** - Payment proofs expire (default: 5 minutes)
3. **Verify amounts** - Double-check you're paying what you expect
4. **Use testnet first** - Test on Base Sepolia before going to mainnet
5. **Monitor your wallet** - Keep track of payment settlements

## Examples

See the `/examples` folder for complete working examples:

- `simple-payment-generation.ts` - Minimal payment proof generation
- `typescript-example.ts` - Full integration with Claude API
- `python-example.py` - Python integration example

## Troubleshooting

### "Payment required" error
- You need to include a payment proof in your tool call
- Check that you're passing the `payment` parameter

### "Invalid payment signature" error
- Verify your wallet private key is correct
- Check that the recipient address matches Nexus's wallet
- Ensure you're using the correct chain ID and token address

### "Payment deadline expired" error
- The payment proof is too old (default: 5 minutes)
- Generate a fresh payment proof and try again

### "Insufficient allowance" error
- You need to approve Permit2 to spend your USDC
- Run: `await usdcContract.approve(PERMIT2_ADDRESS, ethers.MaxUint256)`

## Support

- GitHub Issues: https://github.com/borishalachev1/nexus-mcp/issues
- Documentation: https://github.com/borishalachev1/nexus-mcp
- X402 Protocol: https://x402.org

## Next Steps

- Run the examples in `/examples`
- Integrate into your AI agent workflow
- Build custom payment-gated tools
- Deploy your own Nexus MCP server
