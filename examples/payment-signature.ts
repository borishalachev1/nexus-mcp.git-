/**
 * Example: How to create X402 payment signatures
 * 
 * This script shows how users would sign payments for Nexus MCP tools
 */

import { createWalletClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

// Example configuration
const PRIVATE_KEY = '0xYourPrivateKeyHere'; // NEVER commit real keys!
const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3';
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const RECIPIENT_ADDRESS = '0xRecipientAddressHere';

async function createPaymentSignature(amount: string, toolName: string) {
  const account = privateKeyToAccount(PRIVATE_KEY);
  
  const client = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  });

  // Create permit message for X402
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  const nonce = Math.floor(Math.random() * 1000000).toString();
  const amountInWei = parseUnits(amount, 6); // USDC has 6 decimals

  const permitMessage = {
    permitted: {
      token: USDC_ADDRESS,
      amount: amountInWei.toString(),
    },
    spender: PERMIT2_ADDRESS,
    nonce,
    deadline,
    witness: {
      recipient: RECIPIENT_ADDRESS,
      amount: amountInWei.toString(),
    },
  };

  console.log('Payment details:');
  console.log(`  Tool: ${toolName}`);
  console.log(`  Amount: ${amount} USDC`);
  console.log(`  Recipient: ${RECIPIENT_ADDRESS}`);
  console.log(`  Deadline: ${new Date(deadline * 1000).toISOString()}`);
  console.log(`  Nonce: ${nonce}`);
  console.log('');

  // In a real implementation, you would:
  // 1. Sign the permit message using EIP-712
  // 2. Return the signature along with the permit data
  
  console.log('Permit message (to be signed with EIP-712):');
  console.log(JSON.stringify(permitMessage, null, 2));
  
  // Return the payment payload structure
  return {
    permitted: permitMessage.permitted,
    spender: PERMIT2_ADDRESS,
    nonce,
    deadline,
    witness: permitMessage.witness,
    signature: '0xYourSignatureHere', // This would be the actual EIP-712 signature
  };
}

// Example usage
async function main() {
  console.log('🔐 X402 Payment Signature Example\n');
  
  const payment = await createPaymentSignature('0.10', 'get_weather');
  
  console.log('\n✅ Payment payload ready to send to Nexus MCP:');
  console.log(JSON.stringify(payment, null, 2));
  
  console.log('\n📝 Usage in MCP tool call:');
  console.log(`
{
  "tool": "get_weather",
  "arguments": {
    "city": "London",
    "payment": ${JSON.stringify(payment, null, 6)}
  }
}
  `);
}

main().catch(console.error);
