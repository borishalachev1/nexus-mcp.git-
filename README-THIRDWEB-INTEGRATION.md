# 🚀 Thirdweb Universal Bridge Integration

## Overview

This project now uses **thirdweb's Universal Bridge** and **Pay SDK** to process payments with tokens or fiat currency. All custom HTML UI has been removed in favor of thirdweb's built-in components.

## What Changed

### ✅ Removed
- Custom HTML payment UI (`ui/payment.html`, `ui/payment-react-complex.html.bak`)
- Express/Socket.IO server for UI hosting
- Manual payment form handling

### ✨ Added
- **thirdweb Pay Integration** - Process crypto and fiat payments
- **Universal Bridge Support** - Cross-chain payment routing
- **ConnectButton Component** - Use from thirdweb React SDK
- Direct SDK imports from `thirdweb` package

## Features

### 1. Multiple Payment Methods
```typescript
// Crypto payment (supports cross-chain via Universal Bridge)
await walletConnector.processPayment('1.00', 'tool_name', 'crypto');

// Fiat payment (credit card, bank transfer, etc.)
await walletConnector.processPayment('1.00', 'tool_name', 'fiat');
```

### 2. Multiple Wallet Options
```typescript
// MetaMask
await walletConnector.initializeWallet('io.metamask');

// Coinbase Wallet
await walletConnector.initializeWallet('com.coinbase.wallet');

// WalletConnect
await walletConnector.initializeWallet('walletConnect');

// Email-based wallet (no browser extension needed)
await walletConnector.initializeWallet('email', 'user@example.com');

// Google social login
await walletConnector.initializeWallet('google');
```

### 3. Universal Bridge
Automatically routes payments across different chains and tokens:
- Cross-chain swaps
- Multi-hop routing
- Best price discovery
- Minimal slippage

## Usage

### Basic Example
```typescript
import { walletConnector } from './src/wallet-connector.js';

// 1. Connect wallet
await walletConnector.initializeWallet('io.metamask');

// 2. Process payment
const result = await walletConnector.processPayment(
  '1.00',        // Amount in USDC
  'premium_tool', // Tool name
  'crypto'       // Payment method: 'crypto' or 'fiat'
);

// 3. Use the quote
if (result.quote) {
  console.log('Payment quote ready:', result.quote);
  // User can now complete the transaction via thirdweb Pay UI
}
```

### Using thirdweb ConnectButton (React)

For React applications, use thirdweb's `ConnectButton` component:

```tsx
import { ConnectButton } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";

const client = createThirdwebClient({ 
  clientId: "your_client_id" 
});

function App() {
  return (
    <ConnectButton 
      client={client}
      theme="dark"
      connectButton={{ label: "Connect Wallet" }}
    />
  );
}
```

### Using thirdweb Pay Component (React)

```tsx
import { PayEmbed } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";

const client = createThirdwebClient({ 
  clientId: "your_client_id" 
});

function PaymentPage() {
  return (
    <PayEmbed
      client={client}
      payOptions={{
        mode: "fund_wallet", // or "direct_payment"
        prefillBuy: {
          token: {
            address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
            chain: baseSepolia,
          },
          amount: "1.0",
        },
      }}
    />
  );
}
```

## API Reference

### WalletConnector

#### `initializeWallet(strategy, email?)`
Connect a wallet using various methods.

**Parameters:**
- `strategy`: `'io.metamask' | 'com.coinbase.wallet' | 'walletConnect' | 'email' | 'google'`
- `email` (optional): Email address for email-based wallets

**Returns:** `Promise<void>`

#### `processPayment(amount, toolName, paymentMethod)`
Process a payment using thirdweb Pay.

**Parameters:**
- `amount`: Amount in USDC (e.g., "1.00")
- `toolName`: Name of the tool being paid for
- `paymentMethod`: `'crypto' | 'fiat'`

**Returns:** `Promise<{ quote?, txHash?, error? }>`

#### `getAddress()`
Get the connected wallet address.

**Returns:** `string | undefined`

#### `isConnected()`
Check if wallet is connected.

**Returns:** `boolean`

#### `disconnect()`
Disconnect the wallet.

**Returns:** `Promise<void>`

### PaymentHandler

#### `processPaymentWithPay(fromAddress, amountInUSDC, paymentMethod)`
Process payment directly via PaymentHandler.

**Parameters:**
- `fromAddress`: Wallet address
- `amountInUSDC`: Amount in USDC (e.g., "1.00")
- `paymentMethod`: `'crypto' | 'fiat'`

**Returns:** `Promise<{ quote?, txHash?, error? }>`

## Configuration

Update your `.env` file:

```env
# Thirdweb Configuration
THIRDWEB_CLIENT_ID=your_client_id_here
THIRDWEB_SECRET_KEY=your_secret_key_here

# Payment Configuration
PAYMENT_TOKEN_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
PAYMENT_RECIPIENT=0xYourRecipientAddress
BLOCKCHAIN_CHAIN_ID=84532
BLOCKCHAIN_RPC_URL=https://sepolia.base.org
```

## Examples

See the `examples/` directory:
- `thirdweb-pay-example.ts` - Complete payment flow example
- `typescript-example.ts` - MCP client usage
- `payment-signature.ts` - X402 signature generation

## Benefits

### 🎯 Simplified Integration
- No custom UI code to maintain
- Use thirdweb's battle-tested components
- Automatic updates with SDK upgrades

### 💰 Better Payment Experience
- Support crypto AND fiat payments
- Cross-chain routing via Universal Bridge
- Best execution prices
- Minimal slippage

### 🔐 Enhanced Security
- Built-in wallet security
- No need to handle private keys
- Industry-standard practices

### 🚀 Faster Development
- Pre-built UI components
- Less code to write
- Focus on business logic

## Resources

- [thirdweb Pay Documentation](https://portal.thirdweb.com/connect/pay/overview)
- [thirdweb Universal Bridge](https://portal.thirdweb.com/connect/pay/buy-with-crypto)
- [ConnectButton Component](https://portal.thirdweb.com/typescript/v5/react/components/ConnectButton)
- [PayEmbed Component](https://portal.thirdweb.com/typescript/v5/react/components/PayEmbed)

## Migration Notes

If you were using the old custom UI:

1. **Remove UI server references** - The `PaymentUIServer.start()` is now a no-op
2. **Use SDK directly** - Call `walletConnector` methods instead of opening browser
3. **Update client code** - Use thirdweb React components for UI

## Support

For questions or issues:
- Check [thirdweb Discord](https://discord.gg/thirdweb)
- Review [thirdweb documentation](https://portal.thirdweb.com)
- Open an issue on GitHub
