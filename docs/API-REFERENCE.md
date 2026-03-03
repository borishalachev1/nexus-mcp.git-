# Nexus MCP API Reference

Complete API documentation for X402 client libraries and Nexus MCP tools.

## X402 Client API

### TypeScript/JavaScript

#### `X402Client` Class

```typescript
class X402Client {
  constructor(privateKey: `0x${string}`, config: X402Config)
  async generatePaymentProof(amountInUSDC: string, expiryMinutes?: number): Promise<X402PaymentProof>
}
```

**Parameters:**
- `privateKey` - Your Ethereum wallet private key (must start with `0x`)
- `config` - Configuration object:
  - `chainId` - Network chain ID (84532, 8453, 42161)
  - `tokenAddress` - USDC contract address
  - `recipientAddress` - Payment recipient wallet
  - `permit2Address` - (Optional) Permit2 contract address
  - `rpcUrl` - (Optional) Custom RPC endpoint

**Methods:**

##### `generatePaymentProof(amountInUSDC, expiryMinutes?)`

Generates an X402 payment proof for the specified amount.

- `amountInUSDC` - Amount in USDC (e.g., `"0.10"`, `"1.50"`)
- `expiryMinutes` - Minutes until expiry (default: `5`)

Returns: `Promise<X402PaymentProof>`

**Example:**

```typescript
const client = new X402Client(privateKey, {
  chainId: 84532,
  tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  recipientAddress: '0xYourWallet',
});

const proof = await client.generatePaymentProof('0.10', 10); // 10 min expiry
```

#### Helper Functions

##### `createPaymentProof()`

Quick one-liner for generating payment proofs.

```typescript
async function createPaymentProof(
  privateKey: `0x${string}`,
  config: X402Config,
  amountInUSDC: string
): Promise<X402PaymentProof>
```

**Example:**

```typescript
import { createPaymentProof } from '@nexus/x402-client';

const proof = await createPaymentProof(privateKey, config, '0.10');
```

### Python

#### `X402Client` Class

```python
class X402Client:
    def __init__(
        self,
        private_key: str,
        chain_id: int,
        token_address: str,
        recipient_address: str,
        permit2_address: str = PERMIT2_ADDRESS
    )
    
    def generate_payment_proof(
        self,
        amount_in_usdc: str,
        expiry_minutes: int = 5
    ) -> X402PaymentProof
```

**Parameters:**
- `private_key` - Ethereum wallet private key (with or without `0x`)
- `chain_id` - Network chain ID
- `token_address` - USDC contract address
- `recipient_address` - Payment recipient wallet
- `permit2_address` - (Optional) Permit2 contract address

**Methods:**

##### `generate_payment_proof(amount_in_usdc, expiry_minutes)`

Generates an X402 payment proof.

- `amount_in_usdc` - Amount in USDC (e.g., `"0.10"`)
- `expiry_minutes` - Minutes until expiry (default: `5`)

Returns: `X402PaymentProof`

**Example:**

```python
from x402_client import X402Client

client = X402Client(
    private_key='0x...',
    chain_id=84532,
    token_address='0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    recipient_address='0xYourWallet'
)

proof = client.generate_payment_proof('0.10', expiry_minutes=10)
```

#### Helper Functions

##### `create_payment_proof()`

Quick function for generating payment proofs.

```python
def create_payment_proof(
    private_key: str,
    chain_id: int,
    token_address: str,
    recipient_address: str,
    amount_in_usdc: str
) -> Dict[str, Any]
```

**Example:**

```python
from x402_client import create_payment_proof

proof = create_payment_proof(
    private_key='0x...',
    chain_id=84532,
    token_address='0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    recipient_address='0xYourWallet',
    amount_in_usdc='0.10'
)
```

## Payment Proof Structure

### `X402PaymentProof` Type

```typescript
interface X402PaymentProof {
  permitted: {
    token: string;      // USDC contract address
    amount: string;     // Amount in wei (6 decimals for USDC)
  };
  spender: string;      // Recipient address (spender)
  nonce: string;        // Unique identifier
  deadline: number;     // Unix timestamp
  witness: {
    recipient: string;  // Payment recipient
    amount: string;     // Amount in wei
  };
  signature: string;    // EIP-712 signature
}
```

**Example:**

```json
{
  "permitted": {
    "token": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "amount": "100000"
  },
  "spender": "0x1234567890abcdef1234567890abcdef12345678",
  "nonce": "1704067200123456",
  "deadline": 1704067500,
  "witness": {
    "recipient": "0x1234567890abcdef1234567890abcdef12345678",
    "amount": "100000"
  },
  "signature": "0xabcdef..."
}
```

## Nexus MCP Tools

### Available Tools

#### 1. `nexus:get_service_info`

Get information about available Nexus services.

**Price:** Free

**Input Schema:**

```json
{
  "type": "object",
  "properties": {},
  "required": []
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "name": "Nexus MCP Server",
    "description": "Payment-gated AI tools powered by X402",
    "tools": [...],
    "payment_info": {...}
  },
  "paymentVerified": false
}
```

#### 2. `nexus:search_web`

Search the web for real-time results.

**Price:** 0.15 USDC/search

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Search query"
    },
    "payment": {
      "type": "object",
      "description": "X402 payment proof for 0.15 USDC"
    }
  },
  "required": ["query", "payment"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "results": [...],
    "query": "your search query"
  },
  "paymentVerified": true,
  "transactionHash": "0xabc..."
}
```

#### 3. `nexus:get_weather`

Get current weather for any city.

**Price:** 0.10 USDC/request

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "city": {
      "type": "string",
      "description": "City name"
    },
    "payment": {
      "type": "object",
      "description": "X402 payment proof for 0.10 USDC"
    }
  },
  "required": ["city", "payment"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "city": "London",
    "temperature": "15°C",
    "conditions": "Partly cloudy",
    "humidity": "65%"
  },
  "paymentVerified": true,
  "transactionHash": "0xdef..."
}
```

#### 4. `nexus:analyze_data`

Analyze CSV/JSON data for insights.

**Price:** 0.25 USDC/analysis

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "data": {
      "type": "string",
      "description": "CSV or JSON data to analyze"
    },
    "analysis_type": {
      "type": "string",
      "enum": ["summary", "trends", "anomalies", "correlations"]
    },
    "payment": {
      "type": "object",
      "description": "X402 payment proof for 0.25 USDC"
    }
  },
  "required": ["data", "analysis_type", "payment"]
}
```

#### 5. `nexus:generate_image`

Generate AI images in various styles.

**Price:** 0.50 USDC/image

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "prompt": {
      "type": "string",
      "description": "Image generation prompt"
    },
    "style": {
      "type": "string",
      "enum": ["realistic", "anime", "oil-painting", "digital-art"]
    },
    "payment": {
      "type": "object",
      "description": "X402 payment proof for 0.50 USDC"
    }
  },
  "required": ["prompt", "style", "payment"]
}
```

## Error Handling

### Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `payment_required` | Payment proof missing | Include X402 payment proof in request |
| `invalid_signature` | Payment signature invalid | Regenerate payment proof with correct parameters |
| `expired_deadline` | Payment proof expired | Generate new payment proof (default 5 min expiry) |
| `insufficient_amount` | Payment amount too low | Use correct amount for the tool |
| `invalid_token` | Wrong token address | Use correct USDC address for the chain |
| `settlement_failed` | On-chain settlement failed | Check wallet balance and try again |

### Error Response Format

```json
{
  "error": {
    "code": "payment_required",
    "message": "Payment required: 0.10 USDC. Please include payment signature.",
    "metadata": {
      "payment_required": true,
      "amount": "0.10",
      "token": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      "recipient": "0x...",
      "chainId": 84532
    }
  }
}
```

## Network Constants

### Chain IDs

```typescript
const CHAINS = {
  BASE_SEPOLIA: 84532,
  BASE_MAINNET: 8453,
  ARBITRUM_ONE: 42161,
};
```

### USDC Addresses

```typescript
const USDC_ADDRESSES = {
  84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',  // Base Mainnet
  42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum
};
```

### Permit2 Address (All Chains)

```typescript
const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3';
```

## Rate Limits

No rate limits currently enforced. Payment acts as natural rate limiting.

## Support

- GitHub: https://github.com/borishalachev1/nexus-mcp
- Issues: https://github.com/borishalachev1/nexus-mcp/issues
- X402 Protocol: https://x402.org
