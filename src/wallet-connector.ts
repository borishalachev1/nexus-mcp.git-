/**
 * Thirdweb Wallet Connector with Pay Integration
 * Handles wallet connection and payments via thirdweb SDK (no custom UI)
 */

import { createThirdwebClient } from 'thirdweb';
import { createWallet, inAppWallet } from 'thirdweb/wallets';
import { baseSepolia, base, arbitrum } from 'thirdweb/chains';
import { getBuyWithCryptoQuote, getBuyWithFiatQuote, isSwapRequiredPostOnramp } from 'thirdweb/pay';
import { config } from './config.js';
import type { Account } from 'thirdweb/wallets';

const CHAINS = {
  84532: baseSepolia,
  8453: base,
  42161: arbitrum,
};

export class WalletConnector {
  private client: any;
  private wallet: any;
  private account: Account | null = null;

  constructor() {
    this.client = createThirdwebClient({
      clientId: config.thirdweb.clientId,
    });
  }

  /**
   * Get thirdweb client
   */
  getClient() {
    return this.client;
  }

  /**
   * Initialize wallet using thirdweb SDK
   * Supports: MetaMask, Coinbase, WalletConnect, Email, Google, etc.
   */
  async initializeWallet(strategy: 'io.metamask' | 'com.coinbase.wallet' | 'walletConnect' | 'email' | 'google' = 'io.metamask', email?: string): Promise<void> {
    try {
      if (strategy === 'email' || strategy === 'google') {
        // In-app wallet for email/social login
        this.wallet = inAppWallet();
        this.account = await this.wallet.connect({
          client: this.client,
          chain: CHAINS[config.blockchain.chainId as keyof typeof CHAINS],
          strategy: strategy === 'email' ? 'email' : 'google',
          ...(email && strategy === 'email' ? { email } : {}),
        });
      } else {
        // External wallet (MetaMask, Coinbase, WalletConnect)
        this.wallet = createWallet(strategy);
        this.account = await this.wallet.connect({
          client: this.client,
          chain: CHAINS[config.blockchain.chainId as keyof typeof CHAINS],
        });
      }

      console.error('✅ Wallet connected:', this.account?.address || 'unknown');
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      throw error;
    }
  }

  /**
   * Process payment using thirdweb Pay (Universal Bridge support)
   * Supports both crypto and fiat payments
   */
  async processPayment(
    amount: string, 
    toolName: string,
    paymentMethod: 'crypto' | 'fiat' = 'crypto'
  ): Promise<{ quote?: any; txHash?: string; error?: string }> {
    if (!this.account) {
      throw new Error('Wallet not initialized. Call initializeWallet() first.');
    }

    console.error('\n💳 PAYMENT REQUIRED');
    console.error(`Tool: ${toolName}`);
    console.error(`Amount: ${amount} USDC`);
    console.error(`Chain: ${config.blockchain.chainId}`);
    console.error(`Method: ${paymentMethod}`);

    try {
      const amountWei = this.usdcToWei(amount);

      if (paymentMethod === 'crypto') {
        // Get crypto payment quote (supports Universal Bridge for cross-chain)
        const quote = await getBuyWithCryptoQuote({
          client: this.client,
          fromAddress: this.account.address,
          toAddress: config.payment.recipient,
          fromChainId: config.blockchain.chainId,
          toChainId: config.blockchain.chainId,
          fromTokenAddress: config.payment.tokenAddress, // Can be any token
          toTokenAddress: config.payment.tokenAddress,
          toAmount: amountWei,
        });

        console.error('\n✅ Payment Quote Generated:');
        console.error(`   From: ${quote.swapDetails.fromToken.symbol} (${quote.swapDetails.fromAmount})`);
        console.error(`   To: ${quote.swapDetails.toToken.symbol} (${quote.swapDetails.toAmount})`);

        return { quote };
      } else {
        // Get fiat payment quote
        const quote = await getBuyWithFiatQuote({
          client: this.client,
          fromAddress: this.account.address,
          fromCurrencySymbol: 'USD',
          toChainId: config.blockchain.chainId,
          toAddress: this.account.address,
          toTokenAddress: config.payment.tokenAddress,
          toAmount: amountWei,
        });

        console.error('\n✅ Fiat Payment Quote Generated:');
        console.error(`   From: ${quote.fromCurrency.currencySymbol}`);
        console.error(`   To: ${quote.toToken.symbol} (${quote.estimatedToAmountMinWei})`);

        return { quote };
      }
    } catch (error) {
      console.error('❌ Payment failed:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get wallet address
   */
  getAddress(): string | undefined {
    return this.account?.address;
  }

  /**
   * Get connected account
   */
  getAccount(): Account | null {
    return this.account;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return !!this.account;
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    if (this.wallet) {
      await this.wallet.disconnect();
      this.account = null;
      console.error('🔌 Wallet disconnected');
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
}

export const walletConnector = new WalletConnector();
