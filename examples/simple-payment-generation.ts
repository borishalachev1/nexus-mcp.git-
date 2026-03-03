/**
 * Simple example: Generate a payment proof
 * This is the minimal code needed to create an X402 payment proof
 */

import { X402Client } from '../client/typescript/x402-client.js';

async function generatePayment() {
  // Your wallet private key (keep this secure!)
  const privateKey = process.env.WALLET_PRIVATE_KEY as `0x${string}`;
  
  // Nexus configuration
  const config = {
    chainId: 84532, // Base Sepolia
    tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC
    recipientAddress: '0xYourNexusWallet', // Where payment goes
  };

  // Create client
  const client = new X402Client(privateKey, config);

  // Generate payment proof for 0.10 USDC
  const proof = await client.generatePaymentProof('0.10');

  console.log('Payment Proof:');
  console.log(JSON.stringify(proof, null, 2));
  
  return proof;
}

generatePayment().catch(console.error);
