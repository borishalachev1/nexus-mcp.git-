#!/usr/bin/env node

/**
 * Nexus MCP Server
 * Main entry point for the payment-gated MCP server
 * 
 * Powered by:
 * - X402 Protocol (payment verification)
 * - Thirdweb (Web3 infrastructure)
 * - MCP SDK (AI agent integration)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { config } from './config.js';
import { paymentHandler } from './payment.js';
import { tools } from './tools.js';
import type { X402PaymentPayload, NexusToolResult } from './types.js';
import { paymentUIServer } from './payment-ui-server.js';

/**
 * Nexus MCP Server Class
 */
class NexusMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'nexus-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      };
    });

    // Handle tool calls with payment verification
    this.server.setRequestHandler(CallToolRequestSchema, async (request): Promise<any> => {
      const toolName = request.params.name;
      const args = request.params.arguments || {};

      // Find the requested tool
      const tool = tools.find((t) => t.name === toolName);
      if (!tool) {
        throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${toolName}`);
      }

      // Check if payment is required
      const requiresPayment = parseFloat(tool.price) > 0;

      if (requiresPayment) {
        // Payment is required - verify it
        let payment = args.payment as X402PaymentPayload | undefined;

        if (!payment) {
          // No payment provided - prompt user via UI
          console.error(`\n💳 Payment required for ${toolName}`);
          console.error(`   Requesting ${tool.price} USDC from user...\n`);
          
          try {
            // Request payment via browser UI with thirdweb ConnectButton
            payment = await paymentUIServer.requestPayment(
              toolName,
              tool.price,
              tool.description
            );
            
            console.error('✅ Payment approved by user\n');
          } catch (error) {
            const paymentMetadata = paymentHandler.createPaymentMetadata(tool.price);
            
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Payment required: ${tool.price} USDC. Payment approval failed or cancelled.`,
              paymentMetadata
            );
          }
        }

        // Verify the payment signature (payment is guaranteed to be defined here)
        if (payment) {
          const isValid = await paymentHandler.verifyPayment(payment);
          if (!isValid) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              'Invalid payment signature. Please check your payment details and try again.'
            );
          }

          // Settle the payment on-chain
          const txHash = await paymentHandler.settlePayment(payment);
          if (!txHash) {
            throw new McpError(
              ErrorCode.InternalError,
              'Payment settlement failed. Please try again or contact support.'
            );
          }

          // Execute the tool with payment verified
          try {
            const result = await tool.handler(args);
            
            const toolResult: NexusToolResult = {
              success: true,
              data: result,
              paymentVerified: true,
              transactionHash: txHash,
            };

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(toolResult, null, 2),
                },
              ],
            };
          } catch (error) {
            throw new McpError(
              ErrorCode.InternalError,
              `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }
      } else {
        // Free tool - no payment required
        try {
          const result = await tool.handler(args);
          
          const toolResult: NexusToolResult = {
            success: true,
            data: result,
            paymentVerified: false, // No payment needed
          };

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(toolResult, null, 2),
              },
            ],
          };
        } catch (error) {
          throw new McpError(
            ErrorCode.InternalError,
            `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
    });
  }

  async start() {
    // Start payment UI server first
    await paymentUIServer.start();
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.error('🚀 Nexus MCP Server running');
    console.error('📡 Powered by X402 Protocol + Thirdweb');
    console.error(`💳 Payment recipient: ${config.payment.recipient}`);
    console.error(`⛓️  Chain: ${config.blockchain.chainId}`);
    console.error(`🔧 Available tools: ${tools.length}`);
    console.error(`🌐 Payment UI: ${paymentUIServer.getUIUrl()}`);
    console.error('');
    console.error('Waiting for MCP client connection...');
  }
}

// Start the server
const server = new NexusMCPServer();
server.start().catch((error) => {
  console.error('Failed to start Nexus MCP server:', error);
  process.exit(1);
});
