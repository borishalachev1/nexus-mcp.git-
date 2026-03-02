/**
 * Nexus MCP Types
 * Core type definitions for payment-gated MCP tools
 */

export interface NexusConfig {
  thirdweb: {
    clientId: string;
    secretKey: string;
  };
  blockchain: {
    chainId: number;
    rpcUrl: string;
  };
  payment: {
    tokenAddress: string;
    recipient: string;
  };
  x402: {
    facilitatorUrl: string;
    permit2Address: string;
  };
}

export interface PaymentRequirement {
  amount: string; // in token units (e.g., "0.1" for 0.1 USDC)
  token: string; // token address
  recipient: string; // payment recipient address
  chainId: number;
}

export interface PaymentProof {
  signature: string;
  deadline: number;
  nonce: string;
}

export interface ToolConfig {
  name: string;
  description: string;
  price: string; // in USDC
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (args: any) => Promise<any>;
}

export interface PaymentMetadata {
  amount: string;
  token: string;
  recipient: string;
  chainId: number;
  timestamp: number;
}

export interface X402PaymentPayload {
  permitted: {
    token: string;
    amount: string;
  };
  spender: string;
  nonce: string;
  deadline: number;
  witness: {
    recipient: string;
    amount: string;
  };
  signature: string;
}

export interface NexusToolResult {
  success: boolean;
  data?: any;
  error?: string;
  paymentVerified: boolean;
  transactionHash?: string;
}
