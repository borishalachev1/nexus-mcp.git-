/**
 * X402 Client Library for Nexus MCP
 * Generate payment proofs for calling payment-gated MCP tools
 */
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
export declare class X402Client {
    private config;
    private account;
    private chain;
    constructor(privateKey: `0x${string}`, config: X402Config);
    /**
     * Generate a payment proof for X402 protocol
     */
    generatePaymentProof(amountInUSDC: string, expiryMinutes?: number): Promise<X402PaymentProof>;
    /**
     * Convert USDC amount to wei (6 decimals)
     */
    private usdcToWei;
    /**
     * Generate a unique nonce
     */
    private generateNonce;
}
/**
 * Quick helper function for simple use cases
 */
export declare function createPaymentProof(privateKey: `0x${string}`, config: X402Config, amountInUSDC: string): Promise<X402PaymentProof>;
//# sourceMappingURL=x402-client.d.ts.map