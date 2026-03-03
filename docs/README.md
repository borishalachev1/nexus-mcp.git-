# Nexus MCP Documentation

Complete documentation for Nexus MCP - Payment-gated APIs powered by X402 and Thirdweb.

## 📖 Documentation Index

### Getting Started

- **[Quickstart Guide](./QUICKSTART.md)** - Get up and running in 5 minutes
  - For clients: Generate payment proofs and call tools
  - For providers: Run your own payment-gated API server

### Client Integration

- **[Client Setup Guide](./CLIENT-SETUP-GUIDE.md)** - Complete guide for using Nexus tools
  - TypeScript/JavaScript integration
  - Python integration
  - Payment proof generation
  - Error handling
  - Network configuration

### API Documentation

- **[API Reference](./API-REFERENCE.md)** - Complete API documentation
  - X402 Client API (TypeScript & Python)
  - Available MCP tools
  - Payment proof structure
  - Error codes and handling

### Technical Deep Dive

- **[Architecture](./ARCHITECTURE.md)** - System architecture and design
  - Component overview
  - Payment flow
  - EIP-712 signatures
  - Security model
  - Performance considerations

## 🎯 Quick Links by Use Case

### I want to call payment-gated tools

1. Read [Quickstart Guide](./QUICKSTART.md) - Option 1
2. Follow [Client Setup Guide](./CLIENT-SETUP-GUIDE.md)
3. Check [Examples](../examples/)

### I want to monetize my APIs

1. Read [Quickstart Guide](./QUICKSTART.md) - Option 2
2. Study [Architecture](./ARCHITECTURE.md)
3. Reference [API Documentation](./API-REFERENCE.md)

### I want to understand how it works

1. Read [Architecture](./ARCHITECTURE.md)
2. Review code in `/src`
3. Test with [Examples](../examples/)

## 📚 Documentation Structure

```
nexus-mcp/
├── README.md                    # Main project README
├── docs/
│   ├── README.md               # This file
│   ├── QUICKSTART.md           # 5-minute getting started guide
│   ├── CLIENT-SETUP-GUIDE.md   # Detailed client integration
│   ├── API-REFERENCE.md        # Complete API docs
│   └── ARCHITECTURE.md         # Technical deep-dive
├── examples/
│   ├── README.md               # Examples overview
│   ├── simple-payment-generation.ts
│   ├── simple-payment-generation.py
│   ├── typescript-example.ts
│   └── python-example.py
├── client/
│   ├── typescript/             # TypeScript client library
│   │   ├── x402-client.ts
│   │   └── package.json
│   └── python/                 # Python client library
│       ├── x402_client.py
│       └── requirements.txt
└── src/                        # Server implementation
    ├── index.ts
    ├── payment.ts
    ├── tools.ts
    └── ...
```

## 🔑 Key Concepts

### X402 Protocol

X402 is a payment protocol for AI agents that enables:
- Cryptographic payment proofs (no API keys needed)
- Gasless transactions via Permit2
- On-chain settlement with USDC
- Verifiable payment receipts

**Learn more**: [Architecture - Payment Flow](./ARCHITECTURE.md#payment-flow)

### Model Context Protocol (MCP)

MCP is a standard for exposing tools to AI agents. Nexus extends MCP with payment gates.

**Learn more**: [MCP Specification](https://modelcontextprotocol.io)

### Payment Proofs

Payment proofs are EIP-712 signatures that authorize USDC transfers:
- Signed off-chain (no gas fees)
- Verified by X402 facilitator
- Settled on-chain via Permit2

**Learn more**: [API Reference - Payment Proof Structure](./API-REFERENCE.md#payment-proof-structure)

## 🛠️ Tools Overview

| Tool | Price | Description |
|------|-------|-------------|
| `get_service_info` | FREE | Get available tools and pricing |
| `get_weather` | 0.10 USDC | Current weather for any city |
| `search_web` | 0.15 USDC | Real-time web search |
| `analyze_data` | 0.25 USDC | CSV/JSON data analysis |
| `generate_image` | 0.50 USDC | AI image generation |

**Full details**: [API Reference - Tools](./API-REFERENCE.md#nexus-mcp-tools)

## 🌐 Supported Networks

| Network | Chain ID | USDC Address | Status |
|---------|----------|--------------|--------|
| Base Sepolia | 84532 | `0x036CbD...` | ✅ Testnet |
| Base Mainnet | 8453 | `0x833589...` | ✅ Production |
| Arbitrum One | 42161 | `0xaf88d0...` | ✅ Production |

**Learn more**: [Client Setup Guide - Networks](./CLIENT-SETUP-GUIDE.md#supported-networks)

## 🔐 Security

### Payment Verification

- ✅ EIP-712 typed signatures
- ✅ Recipient address verification
- ✅ Amount and token validation
- ✅ Deadline enforcement (prevents replay)
- ✅ On-chain settlement proof

**Learn more**: [Architecture - Security Model](./ARCHITECTURE.md#security-model)

### Best Practices

1. Never hardcode private keys
2. Use environment variables
3. Test on testnet first
4. Set reasonable payment deadlines
5. Monitor settlement transactions

**Learn more**: [Client Setup Guide - Security](./CLIENT-SETUP-GUIDE.md#security-best-practices)

## 🚀 Common Workflows

### Workflow 1: Generate Payment and Call Tool

```typescript
// 1. Create client
const client = new X402Client(privateKey, config);

// 2. Generate payment proof
const proof = await client.generatePaymentProof('0.10');

// 3. Call MCP tool
const result = await mcp.callTool('nexus:get_weather', {
  city: 'London',
  payment: proof,
});
```

**Full example**: [Examples - TypeScript](../examples/typescript-example.ts)

### Workflow 2: Add Custom Tool

```typescript
// 1. Define tool in src/tools.ts
const myTool: ToolConfig = {
  name: 'nexus:my_tool',
  price: '0.10',
  handler: async (args) => { /* logic */ }
};

// 2. Export tool
export const tools = [...existingTools, myTool];

// 3. Rebuild
// npm run build
```

**Full guide**: [Quickstart - Add Your First API](./QUICKSTART.md#add-your-first-payment-gated-api)

## 📊 Payment Flow Diagram

```
┌─────────────┐
│   Client    │
│   Wallet    │
└──────┬──────┘
       │ 1. Sign payment
       ▼
┌─────────────┐
│  X402 Proof │
│  Generator  │
└──────┬──────┘
       │ 2. Attach to request
       ▼
┌─────────────┐
│ Nexus MCP   │
│   Server    │
└──────┬──────┘
       │ 3. Verify signature
       ▼
┌─────────────┐
│    X402     │
│ Facilitator │
└──────┬──────┘
       │ 4. Settle on-chain
       ▼
┌─────────────┐
│ Blockchain  │
│ (Base/Arb)  │
└──────┬──────┘
       │ 5. Payment confirmed
       ▼
┌─────────────┐
│ Tool Result │
│  + TX Hash  │
└─────────────┘
```

**Detailed explanation**: [Architecture - Payment Flow](./ARCHITECTURE.md#payment-flow)

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution | Doc Link |
|-------|----------|----------|
| "Payment required" | Generate X402 proof | [Client Setup](./CLIENT-SETUP-GUIDE.md) |
| "Invalid signature" | Check recipient/chain | [Quickstart](./QUICKSTART.md#troubleshooting) |
| "Deadline expired" | Regenerate proof | [API Reference](./API-REFERENCE.md#error-handling) |
| Server won't start | Check env vars | [Quickstart](./QUICKSTART.md#option-2-run-nexus-server-provider) |
| Tools not in Claude | Use absolute paths | [README](../README.md#connect-to-claude-desktop) |

**Full troubleshooting**: Each guide has a dedicated troubleshooting section

## 💡 Examples

### Simple Payment Generation

Minimal code to generate an X402 payment proof.

**Files**:
- [typescript](../examples/simple-payment-generation.ts)
- [python](../examples/simple-payment-generation.py)

### Full Integration

Complete example with Claude API integration.

**Files**:
- [typescript](../examples/typescript-example.ts)
- [python](../examples/python-example.py)

**More**: [Examples README](../examples/README.md)

## 🤝 Contributing

Want to improve the docs?

1. Fork the repo
2. Edit docs in `/docs`
3. Submit PR

**Guidelines**:
- Keep it simple and clear
- Add code examples
- Test all examples
- Update table of contents

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/borishalachev1/nexus-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/borishalachev1/nexus-mcp/discussions)
- **Email**: Coming soon

## 🔗 External Resources

- [X402 Protocol](https://x402.org)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Thirdweb Docs](https://portal.thirdweb.com)
- [EIP-712 Spec](https://eips.ethereum.org/EIPS/eip-712)
- [Permit2 Docs](https://docs.uniswap.org/contracts/permit2/overview)
- [Base Network](https://base.org)

## 📜 License

MIT License - See [LICENSE](../LICENSE)

---

**Last Updated**: 2026-03-02

**Version**: 1.0.0
