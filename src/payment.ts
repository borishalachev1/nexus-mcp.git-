/**
 * Nexus Payment Handler
 * Handles X402 payment verification and settlement via Thirdweb
 */

import { createThirdwebClient } from 'thirdweb';
import { baseSepolia } from 'thirdweb/chains';
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
   * Verify X402 payment signature
   */
  async verifyPayment(payment: X402PaymentPayload): Promise<boolean> {
    try {
      // Verify payment parameters match expected values
      if (payment.permitted.token.toLowerCase() !== config.payment.tokenAddress.toLowerCase()) {
        console.error('Invalid token address');
        return false;
      }

      if (payment.witness.recipient.toLowerCase() !== config.payment.recipient.toLowerCase()) {
        console.error('Invalid recipient address');
        return false;
      }

      // Check deadline hasn't passed
      if (Date.now() / 1000 > payment.deadline) {
        console.error('Payment deadline expired');
        return false;
      }

      // Verify via X402 facilitator
      const response = await fetch(`${config.x402.facilitatorUrl}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment,
          chainId: config.blockchain.chainId,
        }),
      });

      if (!response.ok) {
        console.error('Facilitator verification failed:', await response.text());
        return false;
      }

      const result = await response.json();
      return result.valid === true;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  /**
   * Settle payment on-chain via X402 facilitator
   */
  async settlePayment(payment: X402PaymentPayload): Promise<string | null> {
    try {
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

      const result = await response.json();
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
