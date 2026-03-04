# 🚀 Quick Setup Instructions

## You're Almost Ready!

The `.env` file has been created. Now you need to add your credentials:

## Step 1: Get Thirdweb Client ID (Required)

1. **Visit**: https://thirdweb.com/dashboard
2. **Sign up or login** (it's free!)
3. **Go to**: Settings → API Keys
4. **Click**: "Create API Key"
5. **Copy** the Client ID
6. **Paste** it in your `.env` file:
   ```env
   THIRDWEB_CLIENT_ID=your_actual_client_id_here
   ```

## Step 2: Add Your Wallet Address (Required)

Replace the placeholder with your actual wallet address:

```env
PAYMENT_RECIPIENT=0xYourActualWalletAddressHere
```

This is where you'll receive payments. You can use:
- Your MetaMask address
- Your Coinbase Wallet address
- Any Ethereum wallet address you control

## Step 3: Test the Setup

Once you've updated both values, test it:

```bash
# Build the project
npm run build

# Run the example
npx tsx examples/thirdweb-pay-example.ts
```

## Current Configuration

Your `.env` file currently has these **default testnet values** (no changes needed):

```env
CHAIN_ID=84532  # Base Sepolia testnet
PAYMENT_TOKEN_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e  # USDC on Base Sepolia
X402_FACILITATOR_URL=https://facilitator.x402.org
PERMIT2_ADDRESS=0x000000000022D473030F116dDEE9F6B43aC78BA3
RPC_URL=https://sepolia.base.org
```

## What You MUST Change

❌ **THIRDWEB_CLIENT_ID** - Get from https://thirdweb.com/dashboard  
❌ **PAYMENT_RECIPIENT** - Your wallet address

## Optional

- **THIRDWEB_SECRET_KEY** - Only needed for server-side operations (can leave empty for now)

## Need Help?

- **Thirdweb Dashboard**: https://thirdweb.com/dashboard
- **Thirdweb Docs**: https://portal.thirdweb.com
- **Get testnet USDC**: https://faucet.circle.com (for Base Sepolia)

## Once Configured

You'll be able to:
- ✅ Connect wallets (MetaMask, Coinbase, WalletConnect, etc.)
- ✅ Process crypto payments via Universal Bridge
- ✅ Process fiat payments (credit cards, etc.)
- ✅ Use thirdweb's React components (ConnectButton, PayEmbed)

---

**Next**: After updating `.env`, run `npm run build` to verify everything works!
