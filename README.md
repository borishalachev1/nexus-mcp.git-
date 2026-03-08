# Nexus MCP - AI Agent Payment Gateway

https://github.com/user-attachments/assets/452e3f87-0231-4557-b89d-30d8045a363e

MCP server with X402 payment integration. Pay with crypto for AI tools.

## Quick Start

```bash
npm install
npm run build
```

Create `.env`:
```bash
THIRDWEB_CLIENT_ID=your_client_id
PAYMENT_RECIPIENT=0xYourWalletAddress
MOCK_SETTLEMENT=true  # for testing without tokens
```

## Use with Claude Desktop

Edit `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nexus": {
      "command": "node",
      "args": ["/path/to/nexus-mcp/dist/index.js"],
      "env": {
        "THIRDWEB_CLIENT_ID": "your_client_id",
        "PAYMENT_RECIPIENT": "0xYourWallet"
      }
    }
  }
}
```

Restart Claude Desktop.

## Tools

- `get_service_info` - FREE
- `get_weather` - 0.10 USDC
- `search_web` - 0.15 USDC
- `generate_image` - 0.50 USDC
- `analyze_data` - 0.25 USDC

## How It Works

1. Claude calls a paid tool
2. Browser opens for payment
3. Connect MetaMask
4. Sign EIP-712 message (no gas!)
5. Payment settles on Base Sepolia
6. Tool executes

## Mock Mode

Set `MOCK_SETTLEMENT=true` to test without real tokens.

## Production

1. Remove `MOCK_SETTLEMENT`
2. Switch to Base mainnet (Chain ID: 8453)
3. Use real USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

Done.




