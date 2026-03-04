/**
 * Simple Payment Flow Example
 * The easiest way to get started with thirdweb Pay
 */

import { walletConnector } from '../src/wallet-connector.js';

async function simplePayment() {
  console.log('🚀 Simple Payment Flow\n');

  try {
    // Step 1: Connect wallet (choose one method)
    console.log('Step 1: Connecting wallet...');
    
    // Option A: MetaMask
    await walletConnector.initializeWallet('io.metamask');
    
    // Option B: Coinbase Wallet
    // await walletConnector.initializeWallet('com.coinbase.wallet');
    
    // Option C: WalletConnect
    // await walletConnector.initializeWallet('walletConnect');
    
    // Option D: Email (no browser extension needed!)
    // await walletConnector.initializeWallet('email', 'user@example.com');
    
    // Option E: Google (social login)
    // await walletConnector.initializeWallet('google');
    
    console.log('✅ Wallet connected:', walletConnector.getAddress());
    console.log('');

    // Step 2: Process payment
    console.log('Step 2: Processing payment...');
    
    const result = await walletConnector.processPayment(
      '1.00',      // Amount in USDC
      'my_tool',   // Tool/service name
      'crypto'     // Payment method: 'crypto' or 'fiat'
    );

    // Step 3: Handle result
    if (result.quote) {
      console.log('✅ Payment quote generated!\n');
      console.log('Quote details:');
      console.log(`  From: ${result.quote.swapDetails.fromToken.symbol}`);
      console.log(`  To: ${result.quote.swapDetails.toToken.symbol}`);
      console.log(`  Amount: ${result.quote.swapDetails.toAmount}`);
      console.log('');
      console.log('💡 Next: Use thirdweb Pay UI to complete the transaction');
      console.log('   Visit: https://portal.thirdweb.com/connect/pay/overview');
    } else if (result.error) {
      console.error('❌ Error:', result.error);
    }

    // Step 4: Disconnect (optional)
    await walletConnector.disconnect();
    console.log('\n✅ Done! Wallet disconnected');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run it
simplePayment();
