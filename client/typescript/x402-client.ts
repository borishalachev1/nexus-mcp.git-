/**
 * X402 Client Library for Nexus MCP
 * Generate payment proofs for calling payment-gated MCP tools
 */

import { createWalletClient, custom, http, type Address, type Hash } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia, base, arbitrum } from 'viem/chains';

export interface X402PaymentProof {
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

export interface X402Config {
  chainId: number;
  tokenAddress: string;
  recipientAddress: string;
  permit2Address?: string;
  rpcUrl?: string;
}

const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3';

const CHAINS = {
  84532: baseSepolia,
  8453: base,
  42161: arbitrum,
};

export class X402Client {
  private config: X402Config;
  private account: ReturnType<typeof privateKeyToAccount>;
  private chain: any;

  constructor(privateKey: `0x${string}`, config: X402Config) {
    this.config = {
      ...config,
      permit2Address: config.permit2Address || PERMIT2_ADDRESS,
    };
    this.account = privateKeyToAccount(privateKey);
    this.chain = CHAINS[config.chainId as keyof typeof CHAINS] || baseSepolia;
  }

  /**
   * Generate a payment proof for X402 protocol
   */
  async generatePaymentProof(
    amountInUSDC: string,
    expiryMinutes: number = 5
  ): Promise<X402PaymentProof> {
    const nonce = this.generateNonce();
    const deadline = Math.floor(Date.now() / 1000) + expiryMinutes * 60;

    // Convert USDC amount to wei (6 decimals)
    const amountWei = this.usdcToWei(amountInUSDC);

    // Create the permit message
    const domain = {
      name: 'Permit2',
      chainId: this.config.chainId,
      verifyingContract: this.config.permit2Address as Address,
    };

    const types = {
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

    const message = {
      permitted: {
        token: this.config.tokenAddress as Address,
        amount: BigInt(amountWei),
      },
      spender: this.config.recipientAddress as Address,
      nonce: BigInt(nonce),
      deadline: BigInt(deadline),
      witness: {
        recipient: this.config.recipientAddress as Address,
        amount: BigInt(amountWei),
      },
    };

    // Sign the permit
    const walletClient = createWalletClient({
      account: this.account,
      chain: this.chain,
      transport: this.config.rpcUrl ? http(this.config.rpcUrl) : http(),
    });

    const signature = await walletClient.signTypedData({
      domain,
      types,
      primaryType: 'PermitWitnessTransferFrom',
      message,
    });

    return {
      permitted: {
        token: this.config.tokenAddress,
        amount: amountWei,
      },
      spender: this.config.recipientAddress,
      nonce: nonce,
      deadline: deadline,
      witness: {
        recipient: this.config.recipientAddress,
        amount: amountWei,
      },
      signature,
    };
  }

  /**
   * Convert USDC amount to wei (6 decimals)
   */
  private usdcToWei(amount: string): string {
    const decimals = 6; // USDC has 6 decimals
    const parts = amount.split('.');
    const whole = parts[0];
    const fraction = (parts[1] || '').padEnd(decimals, '0').slice(0, decimals);
    return whole + fraction;
  }

  /**
   * Generate a unique nonce
   */
  private generateNonce(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2);
  }
}

/**
 * Quick helper function for simple use cases
 */
export async function createPaymentProof(
  privateKey: `0x${string}`,
  config: X402Config,
  amountInUSDC: string
): Promise<X402PaymentProof> {
  const client = new X402Client(privateKey, config);
  return await client.generatePaymentProof(amountInUSDC);
}
