/**
 * Example: Using Nexus MCP with X402 Payments (TypeScript)
 * 
 * This example shows how to:
 * 1. Generate X402 payment proofs
 * 2. Call payment-gated MCP tools via Claude API
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { X402Client } from '../client/typescript/x402-client.js';

// Configuration
const NEXUS_CONFIG = {
  chainId: 84532, // Base Sepolia testnet
  tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
  recipientAddress: '0xYourNexusRecipientWallet', // Your Nexus wallet
};

async function main() {
  // Step 1: Initialize X402 Client
  const privateKey = process.env.WALLET_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    throw new Error('WALLET_PRIVATE_KEY environment variable required');
  }

  const x402Client = new X402Client(privateKey, NEXUS_CONFIG);

  // Step 2: Generate payment proof for the weather tool (0.10 USDC)
  console.log('Generating payment proof for 0.10 USDC...');
  const paymentProof = await x402Client.generatePaymentProof('0.10');
  console.log('Payment proof generated ✓');

  // Step 3: Call Claude API with the payment-gated tool
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  console.log('\nCalling weather tool via Claude...');
  
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: 'What is the weather in London?',
      },
    ],
    tools: [
      {
        name: 'nexus:get_weather',
        description: 'Get current weather for any city. (0.10 USDC/request)',
        input_schema: {
          type: 'object',
          properties: {
            city: {
              type: 'string',
              description: 'City name',
            },
            payment: {
              type: 'object',
              description: 'X402 payment proof',
            },
          },
          required: ['city', 'payment'],
        },
      },
    ],
  });

  // Step 4: If Claude wants to use the tool, provide the payment
  if (response.stop_reason === 'tool_use') {
    const toolUse = response.content.find(
      (block) => block.type === 'tool_use'
    );

    if (toolUse && toolUse.type === 'tool_use') {
      console.log(`\nClaude wants to use tool: ${toolUse.name}`);
      
      // Add payment to the tool call
      const toolInput = {
        ...toolUse.input,
        payment: paymentProof,
      };

      // Make the actual tool call to Nexus MCP
      // (This would be handled by your MCP client/server setup)
      console.log('\nTool input with payment:');
      console.log(JSON.stringify(toolInput, null, 2));
      
      console.log('\n✓ Payment proof attached to tool call');
      console.log('The Nexus MCP server will verify and settle the payment.');
    }
  }

  console.log('\n✅ Done! The tool will execute after payment verification.');
}

main().catch(console.error);
