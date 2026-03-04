# 🔍 How to Use in MCP Inspector

## Important: Payment Flow Changed

The MCP server now uses **thirdweb's Universal Bridge** but **does NOT open a browser window** when you click "Run Tool" in the inspector. This is intentional!

## What Happens Now

When you try to run a paid tool (like `get_weather`, `generate_image`, etc.) in the inspector:

1. ❌ **You'll see an error** - This is EXPECTED!
2. 📋 **The error contains payment instructions** with:
   - Amount required (e.g., "0.10 USDC")
   - Payment methods available
   - How to pay using thirdweb
   - Links to documentation

## Why This Design?

MCP servers run in the **background** (server-side), not in a browser. They can't open wallet connections directly. Instead:

- **MCP clients** (like Claude Desktop, custom apps) handle the payment UI
- **Your React app** uses thirdweb components to process payments
- **The inspector** just shows you the error with payment metadata

## How to Actually Use Payments

### Option 1: Build a React App (Recommended)

Create a frontend that uses thirdweb's React components:

```tsx
import { ThirdwebProvider, ConnectButton, PayEmbed } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";

const client = createThirdwebClient({ 
  clientId: "your_client_id" 
});

function App() {
  return (
    <ThirdwebProvider>
      {/* Wallet Connection */}
      <ConnectButton client={client} />
      
      {/* Payment UI */}
      <PayEmbed
        client={client}
        payOptions={{
          mode: "direct_payment",
          prefillBuy: {
            token: {
              address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
              chain: baseSepolia,
            },
            amount: "0.10", // Tool price
          },
        }}
      />
    </ThirdwebProvider>
  );
}
```

### Option 2: Use the Standalone Wallet Connector

For Node.js/TypeScript applications (outside MCP):

```typescript
import { walletConnector } from './src/wallet-connector.js';

// Connect wallet
await walletConnector.initializeWallet('io.metamask');

// Process payment
const result = await walletConnector.processPayment(
  '0.10',     // Amount
  'get_weather', // Tool name
  'crypto'    // or 'fiat'
);

// Use the quote to complete payment via thirdweb
console.log('Payment quote:', result.quote);
```

### Option 3: Manual Payment (Advanced)

1. Get payment metadata from the error message
2. Use MetaMask/Coinbase Wallet to send USDC to the recipient address
3. Generate X402 signature manually
4. Call the tool again with the payment proof

## Testing in Inspector

The inspector is useful for:

✅ Testing **FREE tools** (like `get_service_info`)  
✅ Viewing payment requirements  
✅ Understanding payment metadata  
✅ Checking tool schemas  

But NOT for:

❌ Actually making payments (use React app or standalone connector)  
❌ End-to-end payment testing  

## Example: Testing Free Tool

1. Open MCP Inspector
2. Find tool: `get_service_info`
3. Click "Run Tool"
4. ✅ Should work! (no payment needed)

## Example: Viewing Payment Requirements

1. Open MCP Inspector
2. Find tool: `get_weather`
3. Click "Run Tool"
4. Read the error message - it shows:
   - Price: 0.10 USDC
   - How to pay
   - Payment methods supported

## Next Steps

1. **Set up your `.env` file** (see SETUP_INSTRUCTIONS.md)
2. **Build a React app** with thirdweb components (recommended)
3. **OR use the standalone connector** for programmatic payments
4. **OR integrate into Claude Desktop** as an MCP server with payment handling

## Resources

- 📖 Full Integration Guide: `README-THIRDWEB-INTEGRATION.md`
- 🔧 Setup Guide: `SETUP_INSTRUCTIONS.md`
- 💡 Code Examples: `examples/thirdweb-pay-example.ts`
- 🌐 thirdweb Docs: https://portal.thirdweb.com/connect/pay/overview

---

**TL;DR**: The inspector shows payment requirements but doesn't process payments. Build a React app with thirdweb components to actually handle payments!
