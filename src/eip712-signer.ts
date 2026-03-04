/**
 * EIP-712 Signature Generator for X402 Payments
 * Generates proper typed data signatures for payment proofs
 */

import { config } from './config.js';

/**
 * EIP-712 Domain for X402 Permit2
 */
const PERMIT2_DOMAIN = {
  name: 'Permit2',
  chainId: config.blockchain.chainId,
  verifyingContract: config.x402.permit2Address as `0x${string}`,
};

/**
 * EIP-712 Types for Witness Transfer
 */
const WITNESS_TRANSFER_TYPES = {
  PermitWitnessTransferFrom: [
    { name: 'permitted', type: 'TokenPermissions' },
    { name: 'spender', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
    { name: 'witness', type: 'PaymentWitness' },
  ],
  TokenPermissions: [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
  PaymentWitness: [
    { name: 'recipient', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
};

/**
 * Generate EIP-712 typed data for payment signing
 */
export function generateTypedData(
  amount: string,
  nonce: string,
  deadline: number
) {
  const amountWei = usdcToWei(amount);
  
  return {
    domain: PERMIT2_DOMAIN,
    types: WITNESS_TRANSFER_TYPES,
    primaryType: 'PermitWitnessTransferFrom' as const,
    message: {
      permitted: {
        token: config.payment.tokenAddress as `0x${string}`,
        amount: amountWei,
      },
      spender: config.payment.recipient as `0x${string}`,
      nonce: BigInt(nonce),
      deadline: BigInt(deadline),
      witness: {
        recipient: config.payment.recipient as `0x${string}`,
        amount: amountWei,
      },
    },
  };
}

/**
 * Convert USDC amount to wei (6 decimals)
 */
function usdcToWei(amount: string): bigint {
  const decimals = 6;
  const parts = amount.split('.');
  const whole = parts[0];
  const fraction = (parts[1] || '').padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + fraction);
}

/**
 * Get typed data hash for verification (optional)
 */
export function getTypedDataHash(typedData: any): string {
  // This would use keccak256 to hash the typed data
  // For now, we rely on wallet signing
  return '0x0';
}
