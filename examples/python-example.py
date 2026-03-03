"""
Example: Using Nexus MCP with X402 Payments (Python)

This example shows how to:
1. Generate X402 payment proofs
2. Call payment-gated MCP tools via Claude API
"""

import os
import json
from anthropic import Anthropic
import sys
sys.path.append('../client/python')
from x402_client import X402Client

# Configuration
NEXUS_CONFIG = {
    'chain_id': 84532,  # Base Sepolia testnet
    'token_address': '0x036CbD53842c5426634e7929541eC2318f3dCF7e',  # USDC on Base Sepolia
    'recipient_address': '0xYourNexusRecipientWallet',  # Your Nexus wallet
}

def main():
    # Step 1: Initialize X402 Client
    private_key = os.getenv('WALLET_PRIVATE_KEY')
    if not private_key:
        raise ValueError('WALLET_PRIVATE_KEY environment variable required')

    x402_client = X402Client(
        private_key=private_key,
        chain_id=NEXUS_CONFIG['chain_id'],
        token_address=NEXUS_CONFIG['token_address'],
        recipient_address=NEXUS_CONFIG['recipient_address'],
    )

    # Step 2: Generate payment proof for the weather tool (0.10 USDC)
    print('Generating payment proof for 0.10 USDC...')
    payment_proof = x402_client.generate_payment_proof('0.10')
    print('Payment proof generated ✓')

    # Step 3: Call Claude API with the payment-gated tool
    anthropic = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

    print('\nCalling weather tool via Claude...')
    
    response = anthropic.messages.create(
        model='claude-3-5-sonnet-20241022',
        max_tokens=1024,
        messages=[
            {
                'role': 'user',
                'content': 'What is the weather in London?',
            }
        ],
        tools=[
            {
                'name': 'nexus:get_weather',
                'description': 'Get current weather for any city. (0.10 USDC/request)',
                'input_schema': {
                    'type': 'object',
                    'properties': {
                        'city': {
                            'type': 'string',
                            'description': 'City name',
                        },
                        'payment': {
                            'type': 'object',
                            'description': 'X402 payment proof',
                        },
                    },
                    'required': ['city', 'payment'],
                },
            }
        ],
    )

    # Step 4: If Claude wants to use the tool, provide the payment
    if response.stop_reason == 'tool_use':
        tool_use = next(
            (block for block in response.content if block.type == 'tool_use'),
            None
        )

        if tool_use:
            print(f'\nClaude wants to use tool: {tool_use.name}')
            
            # Add payment to the tool call
            tool_input = {
                **tool_use.input,
                'payment': payment_proof.to_dict(),
            }

            # Make the actual tool call to Nexus MCP
            # (This would be handled by your MCP client/server setup)
            print('\nTool input with payment:')
            print(json.dumps(tool_input, indent=2))
            
            print('\n✓ Payment proof attached to tool call')
            print('The Nexus MCP server will verify and settle the payment.')

    print('\n✅ Done! The tool will execute after payment verification.')

if __name__ == '__main__':
    main()
