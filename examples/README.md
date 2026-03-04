# 💡 Examples

This directory contains working examples of how to use thirdweb Pay and Universal Bridge.

## Quick Start

```bash
# Make sure you've configured .env first!
# See: ../SETUP_INSTRUCTIONS.md

# Build the project
npm run build

# Run the simple example
npx tsx examples/simple-payment-flow.ts

# Run the comprehensive examples
npx tsx examples/standalone-wallet-payment.ts
```

## Examples Overview

### 1. `simple-payment-flow.ts` ⭐ START HERE
The absolute simplest way to process a payment. Perfect for beginners!

**What it shows:**
- Connect a wallet (MetaMask, Coinbase, Email, etc.)
- Process a crypto payment
- Get a payment quote
- Disconnect wallet

**Run it:**
```bash
npx tsx examples/simple-payment-flow.ts
```

### 2. `standalone-wallet-payment.ts` 🚀 COMPREHENSIVE
Six detailed examples showing different payment scenarios.

**Examples included:**
1. **MetaMask + Crypto Payment** - Standard crypto payment flow
2. **Coinbase Wallet + Fiat Payment** - Credit card/bank payments
3. **Email Wallet** - No browser extension needed!
4. **Direct Payment Handler** - Using PaymentHandler class directly
5. **Cross-Chain Payment** - Universal Bridge routing
6. **Complete Flow** - Full payment flow with error handling

**Run it:**
```bash
npx tsx examples/standalone-wallet-payment.ts
```

### 3. `thirdweb-pay-example.ts` 📚 ORIGINAL
The original example showing basic thirdweb Pay usage.

**Run it:**
```bash
npx tsx examples/thirdweb-pay-example.ts
```

### 4. `typescript-example.ts` 🔧 MCP CLIENT
Example of using the MCP server from a client application.

**Run it:**
```bash
npx tsx examples/typescript-example.ts
```

## Payment Methods

### Crypto Payments (Universal Bridge)

```typescript
const result = await walletConnector.processPayment(
  '1.00',    // Amount in USDC
  'my_tool', // Tool name
  'crypto'   // Payment method
);

// Universal Bridge features:
// ✓ Pay with ANY token
// ✓ Cross-chain routing
// ✓ Best price discovery
// ✓ Automatic bridging
```

### Fiat Payments

```typescript
const result = await walletConnector.processPayment(
  '1.00',    // Amount in USDC
  'my_tool', // Tool name
  'fiat'     // Payment method
);

// Fiat payment options:
// ✓ Credit/debit cards
// ✓ Bank transfers
// ✓ Apple Pay
// ✓ Google Pay
```

## Wallet Options

### Browser Extension Wallets

```typescript
// MetaMask
await walletConnector.initializeWallet('io.metamask');

// Coinbase Wallet
await walletConnector.initializeWallet('com.coinbase.wallet');

// WalletConnect (connects to 300+ wallets)
await walletConnector.initializeWallet('walletConnect');
```

### In-App Wallets (No Extension Needed!)

```typescript
// Email-based wallet
await walletConnector.initializeWallet('email', 'user@example.com');

// Google social login
await walletConnector.initializeWallet('google');
```

## Common Patterns

### Check Connection Status

```typescript
if (walletConnector.isConnected()) {
  console.log('Wallet is connected!');
  console.log('Address:', walletConnector.getAddress());
} else {
  console.log('No wallet connected');
}
```

### Error Handling

```typescript
try {
  await walletConnector.initializeWallet('io.metamask');
  const result = await walletConnector.processPayment('1.00', 'tool', 'crypto');
  
  if (result.error) {
    console.error('Payment failed:', result.error);
  } else if (result.quote) {
    console.log('Payment quote:', result.quote);
  }
} catch (error) {
  console.error('Error:', error);
} finally {
  // Always disconnect when done
  await walletConnector.disconnect();
}
```

### Reusing Connections

```typescript
// Connect once
await walletConnector.initializeWallet('io.metamask');

// Make multiple payments
await walletConnector.processPayment('0.10', 'tool1', 'crypto');
await walletConnector.processPayment('0.25', 'tool2', 'crypto');
await walletConnector.processPayment('1.00', 'tool3', 'crypto');

// Disconnect when done
await walletConnector.disconnect();
```

## Next Steps

After running these examples:

1. **Build a React App** - Use thirdweb's React components
   - See: `../README-THIRDWEB-INTEGRATION.md`
   - Components: `ConnectButton`, `PayEmbed`, `TransactionButton`

2. **Integrate with Your App** - Use the standalone connector
   - Import: `import { walletConnector } from '../src/wallet-connector.js'`
   - Use in your own code

3. **Deploy to Production**
   - Update `.env` with mainnet values
   - Change `CHAIN_ID` to production chain (e.g., 8453 for Base mainnet)
   - Update `PAYMENT_TOKEN_ADDRESS` to mainnet USDC

## Resources

- 📖 [Thirdweb Pay Docs](https://portal.thirdweb.com/connect/pay/overview)
- 🌉 [Universal Bridge](https://portal.thirdweb.com/connect/pay/buy-with-crypto)
- 🔌 [ConnectButton](https://portal.thirdweb.com/typescript/v5/react/components/ConnectButton)
- 💳 [PayEmbed](https://portal.thirdweb.com/typescript/v5/react/components/PayEmbed)

## Troubleshooting

### "Missing environment variables" error
- Make sure you've created `.env` file
- Add your `THIRDWEB_CLIENT_ID` from https://thirdweb.com/dashboard
- See: `../SETUP_INSTRUCTIONS.md`

### Wallet connection fails
- Make sure MetaMask/Coinbase Wallet is installed
- Check that you're on the correct network
- Try refreshing the browser extension

### Payment quote fails
- Ensure you have sufficient balance
- Check that the token/chain is supported
- Try a different payment method (crypto vs fiat)

## Need Help?

- Check `../README-THIRDWEB-INTEGRATION.md` for full integration guide
- Check `../HOW-TO-USE-IN-INSPECTOR.md` for MCP inspector usage
- Visit [thirdweb Discord](https://discord.gg/thirdweb) for support
