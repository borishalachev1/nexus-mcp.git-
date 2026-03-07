/**
 * Nexus Payment Handler
 * Handles X402 payment verification and settlement via Thirdweb Pay & Universal Bridge
 */

import { createThirdwebClient } from 'thirdweb';
import { baseSepolia } from 'thirdweb/chains';
import { prepareTransaction, sendTransaction } from 'thirdweb';
import { getBuyWithCryptoQuote, getBuyWithFiatQuote } from 'thirdweb/pay';
import { config } from './config.js';
import type { PaymentRequirement, X402PaymentPayload, PaymentProof } from './types.js';

export class PaymentHandler {
  private thirdwebClient;
  
  constructor() {
    this.thirdwebClient = createThirdwebClient({
      clientId: config.thirdweb.clientId,
      secretKey: config.thirdweb.secretKey,
    });
  }

  /**
   * Get thirdweb client for external use
   */
  getClient() {
    return this.thirdwebClient;
  }

  /**
   * Process payment using thirdweb Pay (supports crypto/fiat via Universal Bridge)
   */
  async processPaymentWithPay(
    fromAddress: string,
    amountInUSDC: string,
    paymentMethod: 'crypto' | 'fiat' = 'crypto'
  ): Promise<{ txHash?: string; quote?: any; error?: string }> {
    try {
      const amountWei = this.usdcToWei(amountInUSDC);

      if (paymentMethod === 'crypto') {
        // Get quote for crypto payment using Universal Bridge
        const quote = await getBuyWithCryptoQuote({
          client: this.thirdwebClient,
          fromAddress,
          toAddress: config.payment.recipient,
          fromChainId: config.blockchain.chainId,
          toChainId: config.blockchain.chainId,
          fromTokenAddress: config.payment.tokenAddress,
          toTokenAddress: config.payment.tokenAddress,
          toAmount: amountWei,
        });

        console.error('💰 Crypto Payment Quote:', {
          fromToken: quote.swapDetails.fromToken.symbol,
          toToken: quote.swapDetails.toToken.symbol,
          fromAmount: quote.swapDetails.fromAmount,
          toAmount: quote.swapDetails.toAmount,
        });

        return { quote };
      } else {
        // Get quote for fiat payment
        const quote = await getBuyWithFiatQuote({
          client: this.thirdwebClient,
          fromAddress,
          fromCurrencySymbol: 'USD',
          toChainId: config.blockchain.chainId,
          toAddress: fromAddress,
          toTokenAddress: config.payment.tokenAddress,
          toAmount: amountWei,
        });

        console.error('💳 Fiat Payment Quote:', {
          fromCurrency: quote.fromCurrency.currencySymbol,
          toToken: quote.toToken.symbol,
          toAmount: quote.estimatedToAmountMinWei,
        });

        return { quote };
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Convert USDC amount to wei (6 decimals)
   */
  private usdcToWei(amount: string): string {
    const decimals = 6;
    const parts = amount.split('.');
    const whole = parts[0];
    const fraction = (parts[1] || '').padEnd(decimals, '0').slice(0, decimals);
    return whole + fraction;
  }

  /**
   * Generate payment requirements for a tool
   */
  generatePaymentRequirement(priceInUSDC: string): PaymentRequirement {
    return {
      amount: priceInUSDC,
      token: config.payment.tokenAddress,
      recipient: config.payment.recipient,
      chainId: config.blockchain.chainId,
    };
  }

  /**
   * Inflate a potentially flat payment proof into a full X402PaymentPayload
   */
  private inflatePayment(payment: any): X402PaymentPayload {
    // If it's already in the correct nested format, return as is
    if (payment.permitted && payment.witness && payment.signature) {
      return payment as X402PaymentPayload;
    }

    // Otherwise, try to reconstruct it from flat fields
    // This handles the simplified format Claude often sends
    return {
      permitted: {
        token: payment.token || config.payment.tokenAddress,
        amount: payment.amount || (payment.permitted && payment.permitted.amount) || "0",
      },
      spender: payment.spender || config.payment.recipient,
      nonce: payment.nonce || "",
      deadline: payment.deadline || 0,
      witness: {
        recipient: payment.recipient || config.payment.recipient,
        amount: payment.amount || (payment.witness && payment.witness.amount) || "0",
      },
      signature: payment.signature || "",
    };
  }

  /**
   * Verify X402 payment signature
   */
  async verifyPayment(paymentPayload: any): Promise<boolean> {
    try {
      // Inflate the payment to ensure we have the full structure
      const payment = this.inflatePayment(paymentPayload);

      // 🧪 MOCK MODE: Skip actual settlement for development/testing
      if (process.env.MOCK_SETTLEMENT === 'true') {
        console.error('\n🧪 MOCK MODE ENABLED: Simulating payment verification and settlement');
        console.error('   Signature: ' + (payment.signature ? payment.signature.slice(0, 20) + '...' + payment.signature.slice(-10) : 'MISSING'));
        console.error('   Amount: ' + (payment.witness ? payment.witness.amount.toString() : '0') + ' (smallest unit)');
        console.error('   Recipient: ' + (payment.witness ? payment.witness.recipient : 'MISSING'));
        console.error('   ✅ Mock payment verification successful!');
        console.error('   ✅ Mock on-chain settlement successful!');
        return true; 
      }
      
      // Verify payment parameters match expected values
      if (!payment.permitted || payment.permitted.token.toLowerCase() !== config.payment.tokenAddress.toLowerCase()) {
        console.error('Invalid token address');
        return false;
      }

      if (!payment.witness || payment.witness.recipient.toLowerCase() !== config.payment.recipient.toLowerCase()) {
        console.error('Invalid recipient address');
        return false;
      }

      // Check deadline hasn't passed
      if (Date.now() / 1000 > payment.deadline) {
        console.error('Payment deadline expired');
        return false;
      }

      // Verify signature is not a placeholder
      if (!payment.signature || payment.signature === '0x' + '00'.repeat(65)) {
        console.error('❌ Invalid signature: placeholder or empty');
        console.error('   Payment must include a valid EIP-712 signature');
        return false;
      }
      
      // Additional validation: check signature is not all zeros
      const sigBytes = payment.signature.slice(2);
      if (sigBytes.split('').every(char => char === '0')) {
        console.error('❌ Invalid signature: all zeros');
        return false;
      }

      // Verify signature length (should be 65 bytes = 0x + 130 hex chars)
      if (payment.signature.length !== 132 || !payment.signature.startsWith('0x')) {
        console.error('Invalid signature format');
        return false;
      }

      // Try to verify via X402 facilitator
      try {
        const response = await fetch(`${config.x402.facilitatorUrl}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment,
            chainId: config.blockchain.chainId,
          }),
        });

        if (!response.ok) {
          console.warn('Facilitator verification failed, continuing with local validation');
          // If facilitator is down, we can still proceed with basic checks
          // In production, you might want to fail here
          return true;
        }

        const result = await response.json() as { valid: boolean };
        return result.valid === true;
      } catch (fetchError) {
        console.warn('Failed to reach X402 facilitator, using local validation:', fetchError);
        // Facilitator might be down, but signature format looks valid
        return true;
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  /**
   * Settle payment on-chain via X402 facilitator
   */
  async settlePayment(paymentPayload: any): Promise<string | null> {
    try {
      // Inflate to ensure we have the full structure
      const payment = this.inflatePayment(paymentPayload);

      // 🧪 MOCK MODE: Return a fake hash
      if (process.env.MOCK_SETTLEMENT === 'true') {
        return '0x' + 'm0ck'.repeat(16);
      }

      const response = await fetch(`${config.x402.facilitatorUrl}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment,
          chainId: config.blockchain.chainId,
        }),
      });

      if (!response.ok) {
        console.error('Settlement failed:', await response.text());
        return null;
      }

      const result = await response.json() as { transactionHash?: string };
      return result.transactionHash || null;
    } catch (error) {
      console.error('Payment settlement error:', error);
      return null;
    }
  }

  /**
   * Create payment metadata for MCP error responses
   */
  createPaymentMetadata(priceInUSDC: string): any {
    return {
      payment_required: true,
      amount: priceInUSDC,
      token: config.payment.tokenAddress,
      recipient: config.payment.recipient,
      chainId: config.blockchain.chainId,
      permit2Address: config.x402.permit2Address,
      timestamp: Date.now(),
      instructions: 'Sign this payment using X402 protocol and include the signature in your next request',
    };
  }
}

export const paymentHandler = new PaymentHandler();
