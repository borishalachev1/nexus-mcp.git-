/**
 * Nexus MCP Configuration
 * Loads and validates configuration from environment variables
 */

import { config as loadEnv } from 'dotenv';
import type { NexusConfig } from './types.js';

loadEnv();

export function loadConfig(): NexusConfig {
  const requiredVars = [
    'THIRDWEB_CLIENT_ID',
    'CHAIN_ID',
    'PAYMENT_TOKEN_ADDRESS',
    'PAYMENT_RECIPIENT',
    'X402_FACILITATOR_URL',
    'PERMIT2_ADDRESS',
  ];

  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    thirdweb: {
      clientId: process.env.THIRDWEB_CLIENT_ID!,
      secretKey: process.env.THIRDWEB_SECRET_KEY || '',
    },
    blockchain: {
      chainId: parseInt(process.env.CHAIN_ID!),
      rpcUrl: process.env.RPC_URL || 'https://sepolia.base.org',
    },
    payment: {
      tokenAddress: process.env.PAYMENT_TOKEN_ADDRESS!,
      recipient: process.env.PAYMENT_RECIPIENT!,
    },
    x402: {
      facilitatorUrl: process.env.X402_FACILITATOR_URL!,
      permit2Address: process.env.PERMIT2_ADDRESS!,
    },
  };
}

export const config = loadConfig();
