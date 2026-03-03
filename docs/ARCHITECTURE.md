# Nexus MCP Architecture

Technical architecture documentation for Nexus MCP.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Agent (Claude)                        │
│                 Requests tool execution                         │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Client Application                         │
│  - Generates X402 payment proof                                 │
│  - Calls MCP tool with payment                                  │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Nexus MCP Server                           │
│  - Validates tool request                                       │
│  - Verifies payment signature                                   │
│  - Executes tool logic                                          │
└────────┬───────────────────────────────┬────────────────────────┘
         │                               │
         ▼                               ▼
┌─────────────────────┐    ┌──────────────────────────────────────┐
│  X402 Facilitator   │    │      Blockchain (Base/Arbitrum)      │
│  - Verify signature │    │  - Settle payment on-chain           │
│  - Settle payment   │    │  - USDC transfer via Permit2         │
└─────────────────────┘    └──────────────────────────────────────┘
```

## Components

### 1. Client Application

**Responsibilities:**
- Generate X402 payment proofs using wallet private key
- Make MCP tool calls with payment attached
- Handle responses and errors

**Technologies:**
- TypeScript/JavaScript: viem, @anthropic-ai/sdk
- Python: web3.py, eth-account

**Key Files:**
- `client/typescript/x402-client.ts`
- `client/python/x402_client.py`

### 2. Nexus MCP Server

**Responsibilities:**
- Expose MCP-compatible API
- Validate incoming tool requests
- Verify X402 payment signatures
- Settle payments on-chain
- Execute tool logic after payment verification

**Technologies:**
- MCP SDK (@modelcontextprotocol/sdk)
- Thirdweb (Web3 infrastructure)
- Node.js/TypeScript

**Key Files:**
- `src/index.ts` - Main server entry point
- `src/payment.ts` - Payment verification and settlement
- `src/tools.ts` - Tool definitions and handlers
- `src/config.ts` - Configuration management

### 3. X402 Facilitator

**Responsibilities:**
- Verify EIP-712 payment signatures off-chain
- Submit on-chain transactions to settle payments
- Provide settlement receipts

**API Endpoints:**
- `POST /verify` - Verify payment signature
- `POST /settle` - Settle payment on-chain

### 4. Blockchain Layer

**Smart Contracts:**
- **Permit2** (`0x000000000022D473030F116dDEE9F6B43aC78BA3`)
  - Canonical Uniswap Permit2 contract
  - Enables gasless USDC approvals via signatures
- **USDC Token Contract**
  - ERC-20 stablecoin for payments

**Supported Networks:**
- Base Sepolia (testnet) - Chain ID 84532
- Base Mainnet - Chain ID 8453
- Arbitrum One - Chain ID 42161

## Payment Flow

### Step-by-Step Process

1. **Client generates payment proof:**
   ```typescript
   const proof = await client.generatePaymentProof('0.10');
   ```
   - Creates EIP-712 typed data for Permit2
   - Signs with wallet private key
   - Returns signature + payment metadata

2. **Client calls MCP tool:**
   ```typescript
   const result = await mcpClient.callTool('nexus:get_weather', {
     city: 'London',
     payment: proof,
   });
   ```

3. **Server receives request:**
   - Validates tool exists
   - Checks if payment required
   - Extracts payment proof from arguments

4. **Server verifies payment:**
   ```typescript
   const isValid = await paymentHandler.verifyPayment(payment);
   ```
   - Validates token address matches
   - Validates recipient matches
   - Checks deadline hasn't expired
   - Sends to X402 facilitator for signature verification

5. **Server settles payment:**
   ```typescript
   const txHash = await paymentHandler.settlePayment(payment);
   ```
   - X402 facilitator submits transaction
   - Permit2 transfers USDC from payer to recipient
   - Returns transaction hash

6. **Server executes tool:**
   ```typescript
   const result = await tool.handler(args);
   ```
   - Payment verified ✓
   - Tool logic executes
   - Returns result with transaction hash

## EIP-712 Signature Structure

### Typed Data

```typescript
{
  types: {
    PermitWitnessTransferFrom: [
      { name: 'permitted', type: 'TokenPermissions' },
      { name: 'spender', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'witness', type: 'PaymentWitness' }
    ],
    TokenPermissions: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    PaymentWitness: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ]
  },
  domain: {
    name: 'Permit2',
    chainId: 84532,
    verifyingContract: '0x000000000022D473030F116dDEE9F6B43aC78BA3'
  },
  message: {
    permitted: { token: '0x...', amount: '100000' },
    spender: '0x...',
    nonce: '1704067200123',
    deadline: 1704067500,
    witness: { recipient: '0x...', amount: '100000' }
  }
}
```

### Why EIP-712?

- **Human-readable**: Users can see exactly what they're signing
- **Secure**: Domain separation prevents signature reuse
- **Standard**: Wide wallet support (MetaMask, WalletConnect, etc.)

## Security Model

### Payment Verification

```typescript
async verifyPayment(payment: X402PaymentPayload): Promise<boolean> {
  // 1. Verify token address
  if (payment.permitted.token !== config.payment.tokenAddress) {
    return false;
  }

  // 2. Verify recipient
  if (payment.witness.recipient !== config.payment.recipient) {
    return false;
  }

  // 3. Check deadline
  if (Date.now() / 1000 > payment.deadline) {
    return false;
  }

  // 4. Verify signature via X402
  const response = await fetch(`${config.x402.facilitatorUrl}/verify`, {
    method: 'POST',
    body: JSON.stringify({ payment, chainId: config.blockchain.chainId })
  });

  return response.ok;
}
```

### Threat Model

| Attack | Mitigation |
|--------|------------|
| Signature replay | Unique nonces per payment |
| Expired signatures | Deadline enforcement (5 min default) |
| Wrong amount | Server validates amount before execution |
| Wrong recipient | Recipient address verified in witness |
| Front-running | Permit2 design prevents this |
| Double-spending | On-chain settlement is atomic |

## Configuration

### Environment Variables

```bash
# Thirdweb (Web3 infrastructure)
THIRDWEB_CLIENT_ID=your_client_id
THIRDWEB_SECRET_KEY=your_secret_key

# Blockchain
CHAIN_ID=84532
RPC_URL=https://sepolia.base.org

# Payment
PAYMENT_TOKEN_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
PAYMENT_RECIPIENT=0xYourWallet

# X402
X402_FACILITATOR_URL=https://facilitator.x402.org
PERMIT2_ADDRESS=0x000000000022D473030F116dDEE9F6B43aC78BA3
```

### Tool Configuration

```typescript
const tool: ToolConfig = {
  name: 'nexus:get_weather',
  description: 'Get current weather for any city. (0.10 USDC/request)',
  price: '0.10', // USDC
  inputSchema: {
    type: 'object',
    properties: {
      city: { type: 'string', description: 'City name' },
      payment: { type: 'object', description: 'X402 payment proof' }
    },
    required: ['city', 'payment']
  },
  handler: async (args) => {
    // Tool implementation
  }
};
```

## Performance Considerations

### Latency Breakdown

| Step | Typical Duration |
|------|-----------------|
| Generate payment proof | 50-200ms |
| MCP request | 10-50ms |
| Verify signature | 100-500ms |
| Settle on-chain | 1-5 seconds |
| Execute tool | Varies by tool |
| **Total** | **~2-6 seconds** |

### Optimization Strategies

1. **Parallel verification**: Verify signature while preparing tool execution
2. **Async settlement**: Don't block on transaction confirmation
3. **Caching**: Cache tool results when appropriate
4. **Batching**: Future: batch multiple payments in one transaction

## Error Handling

### Client-Side Errors

```typescript
try {
  const proof = await client.generatePaymentProof('0.10');
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    // Handle insufficient USDC
  } else if (error.code === 'NETWORK_ERROR') {
    // Handle network issues
  }
}
```

### Server-Side Errors

```typescript
if (!payment) {
  throw new McpError(
    ErrorCode.InvalidRequest,
    'Payment required: 0.10 USDC',
    paymentMetadata
  );
}

if (!isValid) {
  throw new McpError(
    ErrorCode.InvalidRequest,
    'Invalid payment signature'
  );
}
```

## Deployment

### Server Deployment

```bash
# Build
npm run build

# Run
npm start

# Or with MCP inspector for debugging
npm run inspector
```

### Client Integration

**TypeScript:**
```bash
cd client/typescript
npm install
npm run build
```

**Python:**
```bash
cd client/python
pip install -r requirements.txt
```

## Future Enhancements

- [ ] Payment channel support for frequent microtransactions
- [ ] Multi-token support (ETH, DAI, etc.)
- [ ] Subscription-based pricing models
- [ ] Payment batching for gas efficiency
- [ ] Refund mechanism for failed tools
- [ ] Real-time payment streaming

## References

- [MCP Specification](https://modelcontextprotocol.io)
- [X402 Protocol](https://x402.org)
- [EIP-712 Typed Data](https://eips.ethereum.org/EIPS/eip-712)
- [Permit2 Documentation](https://docs.uniswap.org/contracts/permit2/overview)
- [Thirdweb SDK](https://portal.thirdweb.com)
