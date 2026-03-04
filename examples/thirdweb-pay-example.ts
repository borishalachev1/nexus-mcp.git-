/**
 * Example: Using thirdweb Pay with Universal Bridge
 * This demonstrates how to process payments with crypto or fiat
 */

import { walletConnector } from '../src/wallet-connector.js';
import { paymentHandler } from '../src/payment.js';

async function main() {
  console.log('🚀 Thirdweb Pay + Universal Bridge Example\n');

  try {
    // Step 1: Connect wallet
    console.log('Step 1: Connecting wallet...');
    await walletConnector.initializeWallet('io.metamask'); // or 'com.coinbase.wallet', 'walletConnect', 'email', 'google'
    console.log('✅ Wallet connected:', walletConnector.getAddress());

    // Step 2: Process payment with crypto (Universal Bridge handles cross-chain)
    console.log('\nStep 2: Processing crypto payment...');
    const cryptoResult = await walletConnector.processPayment(
      '1.00', // Amount in USDC
      'premium_tool', // Tool name
      'crypto' // Payment method
    );

    if (cryptoResult.quote) {
      console.log('\n✅ Crypto Payment Quote:');
      console.log('   From Token:', cryptoResult.quote.swapDetails.fromToken.symbol);
      console.log('   To Token:', cryptoResult.quote.swapDetails.toToken.symbol);
      console.log('   From Amount:', cryptoResult.quote.swapDetails.fromAmount);
      console.log('   To Amount:', cryptoResult.quote.swapDetails.toAmount);
      if (cryptoResult.quote.swapDetails.bridge) {
        console.log('   Bridge:', cryptoResult.quote.swapDetails.bridge);
      }
    }

    // Step 3: Process payment with fiat (optional)
    console.log('\n\nStep 3: Getting fiat payment quote...');
    const fiatResult = await walletConnector.processPayment(
      '1.00', // Amount in USDC
      'premium_tool', // Tool name
      'fiat' // Payment method
    );

    if (fiatResult.quote) {
      console.log('\n✅ Fiat Payment Quote:');
      console.log('   From Currency:', fiatResult.quote.fromCurrencySymbol);
      console.log('   To Token:', fiatResult.quote.toToken.symbol);
      console.log('   To Amount:', fiatResult.quote.toAmount);
    }

    // Step 4: Disconnect wallet
    console.log('\n\nStep 4: Disconnecting wallet...');
    await walletConnector.disconnect();
    console.log('✅ Wallet disconnected');

    console.log('\n✨ Example completed successfully!');
    console.log('\n📚 Learn more about thirdweb Pay:');
    console.log('   https://portal.thirdweb.com/connect/pay/overview');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run the example
main().catch(console.error);
