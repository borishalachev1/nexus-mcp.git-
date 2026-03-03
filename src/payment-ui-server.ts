/**
 * Payment UI Server
 * Launches a local web UI for payment approvals
 */

import express, { Request, Response } from 'express';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import type { X402PaymentPayload } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PaymentUIServer {
  private app;
  private httpServer;
  private io;
  private port = 3402; // X402 port ;)
  private pendingPayments = new Map();

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.setupRoutes();
    this.setupSocketHandlers();
  }

  private setupRoutes() {
    // Serve static files
    this.app.use(express.static(path.join(__dirname, '../ui')));
    this.app.use(express.json());

    // Main payment UI page
    this.app.get('/', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, '../ui/payment.html'));
    });

    // API endpoint to get config
    this.app.get('/api/config', (req: Request, res: Response) => {
      res.json({
        thirdwebClientId: config.thirdweb.clientId,
        chainId: config.blockchain.chainId
      });
    });

    // API endpoint to get pending payment
    this.app.get('/api/pending-payment/:id', (req: Request, res: Response) => {
      const payment = this.pendingPayments.get(req.params.id);
      if (payment) {
        res.json(payment);
      } else {
        res.status(404).json({ error: 'Payment not found' });
      }
    });

    // API endpoint to approve payment
    this.app.post('/api/approve-payment/:id', async (req: Request, res: Response) => {
      const paymentId = req.params.id;
      const payment = this.pendingPayments.get(paymentId);
      
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      try {
        const { walletAddress, signature, nonce, deadline, amount } = req.body;
        
        if (!walletAddress || !signature || !nonce || !deadline || !amount) {
          return res.status(400).json({ 
            error: 'Missing required fields: walletAddress, signature, nonce, deadline, amount' 
          });
        }

        // Generate X402 payment proof with real signature from wallet
        const proof: X402PaymentPayload = {
          permitted: {
            token: config.payment.tokenAddress,
            amount: amount,
          },
          spender: config.payment.recipient,
          nonce: nonce,
          deadline: deadline,
          witness: {
            recipient: config.payment.recipient,
            amount: amount,
          },
          signature: signature, // Real signature from user's wallet
        };
        
        // Resolve the pending payment
        if (payment.resolve) {
          payment.resolve(proof);
        }

        this.pendingPayments.delete(paymentId);
        
        res.json({ success: true, proof });
      } catch (error) {
        res.status(500).json({ 
          error: 'Payment generation failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.error('🔌 Payment UI client connected');

      socket.on('disconnect', () => {
        console.error('🔌 Payment UI client disconnected');
      });
    });
  }

  /**
   * Start the payment UI server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer.listen(this.port, () => {
        console.error(`\n💳 Payment UI running at http://localhost:${this.port}`);
        console.error('   Open this URL in your browser to approve payments\n');
        resolve();
      });
    });
  }

  /**
   * Request payment approval from user
   * Opens browser and waits for approval
   */
  async requestPayment(toolName: string, amount: string, description: string): Promise<any> {
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise((resolve, reject) => {
      // Store pending payment
      this.pendingPayments.set(paymentId, {
        id: paymentId,
        toolName,
        amount,
        description,
        timestamp: Date.now(),
        resolve,
        reject,
      });

      // Emit to connected clients
      this.io.emit('payment-request', {
        id: paymentId,
        toolName,
        amount,
        description,
        recipient: config.payment.recipient,
        chainId: config.blockchain.chainId,
        token: config.payment.tokenAddress,
      });

      // Open browser automatically
      const url = `http://localhost:${this.port}?payment=${paymentId}`;
      console.error(`\n💳 PAYMENT REQUIRED`);
      console.error(`   Tool: ${toolName}`);
      console.error(`   Amount: ${amount} USDC`);
      console.error(`   \n   👉 Opening payment page: ${url}\n`);
      
      // Auto-open browser (works on Windows, Mac, Linux)
      import('open').then(({ default: open }) => {
        open(url);
      }).catch(() => {
        console.error('   Please open this URL manually in your browser');
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        if (this.pendingPayments.has(paymentId)) {
          this.pendingPayments.delete(paymentId);
          reject(new Error('Payment request timeout (5 minutes)'));
        }
      }, 5 * 60 * 1000);
    });
  }

  /**
   * Get the payment UI URL
   */
  getUIUrl(): string {
    return `http://localhost:${this.port}`;
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

export const paymentUIServer = new PaymentUIServer();
