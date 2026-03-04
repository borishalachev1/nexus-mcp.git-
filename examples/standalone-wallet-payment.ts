/**
 * Standalone Wallet Connector Example
 * Shows how to use thirdweb Pay outside of MCP server context
 * 
 * This example demonstrates:
 * - Connecting different wallet types
 * - Processing crypto payments via Universal Bridge
 * - Processing fiat payments
 * - Handling payment quotes
 */

import { walletConnector } from '../src/wallet-connector.js';
import { paymentHandler } from '../src/payment.js';

// ANSI color codes for pretty console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(emoji: string, message: string, color: string = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function section(title: string) {
  console.log(`\n${colors.bright}${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'═'.repeat(60)}${colors.reset}\n`);
}

/**
 * Example 1: Connect MetaMask and Get Crypto Payment Quote
 */
async function example1_CryptoPayment() {
  section('Example 1: MetaMask + Crypto Payment');

  try {
    // Step 1: Connect MetaMask
    log('🔌', 'Connecting to MetaMask...', colors.blue);
    await walletConnector.initializeWallet('io.metamask');
    
    const address = walletConnector.getAddress();
    log('✅', `Connected! Wallet: ${address}`, colors.green);

    // Step 2: Get payment quote for crypto
    log('💰', 'Getting crypto payment quote for 1.00 USDC...', colors.blue);
    const result = await walletConnector.processPayment(
      '1.00',           // Amount in USDC
      'example_tool',   // Tool name
      'crypto'          // Payment method
    );

    if (result.quote) {
      log('✅', 'Payment quote generated!', colors.green);
      console.log(JSON.stringify({
        fromToken: result.quote.swapDetails.fromToken.symbol,
        fromAmount: result.quote.swapDetails.fromAmount,
        toToken: result.quote.swapDetails.toToken.symbol,
        toAmount: result.quote.swapDetails.toAmount,
        estimatedGas: result.quote.swapDetails.estimated?.gas || 'N/A',
      }, null, 2));
      
      log('💡', 'Next: Use this quote with thirdweb Pay UI to complete transaction', colors.yellow);
    }

    // Step 3: Disconnect
    await walletConnector.disconnect();
    log('🔌', 'Wallet disconnected', colors.blue);

  } catch (error) {
    log('❌', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, colors.red);
  }
}

/**
 * Example 2: Connect Coinbase Wallet and Get Fiat Payment Quote
 */
async function example2_FiatPayment() {
  section('Example 2: Coinbase Wallet + Fiat Payment');

  try {
    // Step 1: Connect Coinbase Wallet
    log('🔌', 'Connecting to Coinbase Wallet...', colors.blue);
    await walletConnector.initializeWallet('com.coinbase.wallet');
    
    const address = walletConnector.getAddress();
    log('✅', `Connected! Wallet: ${address}`, colors.green);

    // Step 2: Get payment quote for fiat
    log('💳', 'Getting fiat payment quote for 5.00 USDC...', colors.blue);
    const result = await walletConnector.processPayment(
      '5.00',           // Amount in USDC
      'premium_tool',   // Tool name
      'fiat'            // Payment method (credit card, bank, etc.)
    );

    if (result.quote) {
      log('✅', 'Fiat payment quote generated!', colors.green);
      console.log(JSON.stringify({
        fromCurrency: result.quote.fromCurrency.currencySymbol,
        toToken: result.quote.toToken.symbol,
        estimatedAmount: result.quote.estimatedToAmountMinWei,
        paymentMethods: ['Credit Card', 'Bank Transfer', 'Apple Pay', 'Google Pay'],
      }, null, 2));
      
      log('💡', 'Next: Complete payment via thirdweb Pay fiat on-ramp', colors.yellow);
    }

    // Step 3: Disconnect
    await walletConnector.disconnect();
    log('🔌', 'Wallet disconnected', colors.blue);

  } catch (error) {
    log('❌', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, colors.red);
  }
}

/**
 * Example 3: Email Wallet (No Browser Extension Needed!)
 */
async function example3_EmailWallet() {
  section('Example 3: Email Wallet (In-App Wallet)');

  try {
    // Step 1: Connect with email
    log('📧', 'Connecting with email wallet...', colors.blue);
    log('💡', 'Note: User will receive email to verify', colors.yellow);
    
    await walletConnector.initializeWallet('email', 'user@example.com');
    
    const address = walletConnector.getAddress();
    log('✅', `Email wallet created! Address: ${address}`, colors.green);
    log('💡', 'This wallet works without browser extensions!', colors.yellow);

    // Step 2: Get payment quote
    log('💰', 'Getting payment quote...', colors.blue);
    const result = await walletConnector.processPayment(
      '0.50',
      'ai_tool',
      'crypto'
    );

    if (result.quote) {
      log('✅', 'Quote ready!', colors.green);
    }

    // Step 3: Disconnect
    await walletConnector.disconnect();
    log('🔌', 'Wallet disconnected', colors.blue);

  } catch (error) {
    log('❌', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, colors.red);
  }
}

/**
 * Example 4: Using Payment Handler Directly
 */
async function example4_PaymentHandlerDirect() {
  section('Example 4: Direct Payment Handler Usage');

  try {
    // First connect a wallet
    log('🔌', 'Connecting wallet...', colors.blue);
    await walletConnector.initializeWallet('io.metamask');
    const address = walletConnector.getAddress();
    log('✅', `Connected: ${address}`, colors.green);

    // Use payment handler directly
    log('💰', 'Using PaymentHandler.processPaymentWithPay()...', colors.blue);
    
    const result = await paymentHandler.processPaymentWithPay(
      address!,
      '2.50',
      'crypto'
    );

    if (result.quote) {
      log('✅', 'Direct payment quote generated!', colors.green);
      console.log(JSON.stringify({
        method: 'PaymentHandler.processPaymentWithPay',
        fromToken: result.quote.swapDetails.fromToken.symbol,
        toToken: result.quote.swapDetails.toToken.symbol,
        amount: result.quote.swapDetails.toAmount,
      }, null, 2));
    }

    await walletConnector.disconnect();

  } catch (error) {
    log('❌', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, colors.red);
  }
}

/**
 * Example 5: Cross-Chain Payment via Universal Bridge
 */
async function example5_CrossChainPayment() {
  section('Example 5: Cross-Chain Payment (Universal Bridge)');

  try {
    log('🔌', 'Connecting wallet...', colors.blue);
    await walletConnector.initializeWallet('io.metamask');
    
    log('🌉', 'Universal Bridge Example:', colors.blue);
    log('💡', 'Universal Bridge automatically routes payments across chains!', colors.yellow);
    log('💡', 'You can pay with ANY token on ANY supported chain', colors.yellow);
    
    // Get quote - Universal Bridge will find best route
    const result = await walletConnector.processPayment(
      '10.00',
      'premium_feature',
      'crypto'
    );

    if (result.quote) {
      log('✅', 'Cross-chain route found!', colors.green);
      
      if (result.quote.swapDetails.bridge) {
        console.log(JSON.stringify({
          bridge: result.quote.swapDetails.bridge,
          route: 'Multi-chain routing enabled',
          fromChain: result.quote.swapDetails.fromToken.chainId,
          toChain: result.quote.swapDetails.toToken.chainId,
          fromToken: result.quote.swapDetails.fromToken.symbol,
          toToken: result.quote.swapDetails.toToken.symbol,
        }, null, 2));
      } else {
        log('💡', 'Direct swap (no bridge needed - same chain)', colors.yellow);
      }
    }

    await walletConnector.disconnect();

  } catch (error) {
    log('❌', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, colors.red);
  }
}

/**
 * Example 6: Complete Payment Flow with Error Handling
 */
async function example6_CompleteFlow() {
  section('Example 6: Complete Payment Flow');

  try {
    // Check wallet connection status
    if (!walletConnector.isConnected()) {
      log('🔌', 'No wallet connected, connecting...', colors.blue);
      await walletConnector.initializeWallet('io.metamask');
    } else {
      log('✅', 'Wallet already connected!', colors.green);
    }

    const address = walletConnector.getAddress();
    log('📍', `Using address: ${address}`, colors.blue);

    // Get payment quote
    log('💰', 'Requesting payment quote...', colors.blue);
    const result = await walletConnector.processPayment(
      '0.25',
      'data_analysis',
      'crypto'
    );

    if (result.error) {
      log('❌', `Payment failed: ${result.error}`, colors.red);
      return;
    }

    if (result.quote) {
      log('✅', 'Payment quote received!', colors.green);
      
      // Display quote details
      console.log('\nQuote Details:');
      console.log('─'.repeat(60));
      console.log(`From:     ${result.quote.swapDetails.fromToken.symbol}`);
      console.log(`To:       ${result.quote.swapDetails.toToken.symbol}`);
      console.log(`Amount:   ${result.quote.swapDetails.toAmount}`);
      console.log('─'.repeat(60));
      
      log('💡', 'To complete payment:', colors.yellow);
      log('  ', '1. Use thirdweb PayEmbed component in React', colors.yellow);
      log('  ', '2. Or use thirdweb SDK to execute the transaction', colors.yellow);
      log('  ', '3. Transaction will be processed via Universal Bridge', colors.yellow);
    }

    // Check balance (conceptual - would need actual implementation)
    log('💼', 'Payment quote ready for execution', colors.green);

    // Cleanup
    await walletConnector.disconnect();
    log('✅', 'Complete! Wallet disconnected', colors.green);

  } catch (error) {
    log('❌', `Error in payment flow: ${error instanceof Error ? error.message : 'Unknown error'}`, colors.red);
    
    // Cleanup on error
    if (walletConnector.isConnected()) {
      await walletConnector.disconnect();
    }
  }
}

/**
 * Main function - run all examples
 */
async function main() {
  console.log(colors.bright + colors.blue);
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   Thirdweb Pay + Universal Bridge Standalone Examples    ║');
  console.log('║   Using wallet-connector.ts outside of MCP server         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  // Check environment
  if (!process.env.THIRDWEB_CLIENT_ID) {
    log('⚠️', 'Warning: THIRDWEB_CLIENT_ID not set in .env', colors.yellow);
    log('💡', 'Get your client ID from: https://thirdweb.com/dashboard', colors.yellow);
    log('❌', 'Cannot run examples without proper configuration', colors.red);
    return;
  }

  log('✅', 'Environment configured!', colors.green);
  log('💡', 'Choose which example to run:', colors.blue);
  console.log('\nAvailable examples:');
  console.log('1. MetaMask + Crypto Payment');
  console.log('2. Coinbase Wallet + Fiat Payment');
  console.log('3. Email Wallet (No Extension)');
  console.log('4. Direct Payment Handler');
  console.log('5. Cross-Chain via Universal Bridge');
  console.log('6. Complete Payment Flow');
  console.log('\nNote: Running example 1 as default...\n');

  // Run examples
  // Uncomment the ones you want to test

  await example1_CryptoPayment();
  // await example2_FiatPayment();
  // await example3_EmailWallet();
  // await example4_PaymentHandlerDirect();
  // await example5_CrossChainPayment();
  // await example6_CompleteFlow();

  console.log('\n');
  section('Examples Complete!');
  log('📚', 'For more info:', colors.blue);
  log('  ', 'README-THIRDWEB-INTEGRATION.md', colors.cyan);
  log('  ', 'https://portal.thirdweb.com/connect/pay/overview', colors.cyan);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

// Export for use in other files
export {
  example1_CryptoPayment,
  example2_FiatPayment,
  example3_EmailWallet,
  example4_PaymentHandlerDirect,
  example5_CrossChainPayment,
  example6_CompleteFlow,
};
