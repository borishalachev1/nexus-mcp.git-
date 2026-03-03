"""
Simple example: Generate a payment proof
This is the minimal code needed to create an X402 payment proof
"""

import os
import json
import sys
sys.path.append('../client/python')
from x402_client import create_payment_proof

def generate_payment():
    # Your wallet private key (keep this secure!)
    private_key = os.getenv('WALLET_PRIVATE_KEY')
    
    # Nexus configuration
    chain_id = 84532  # Base Sepolia
    token_address = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'  # USDC
    recipient_address = '0xYourNexusWallet'  # Where payment goes
    
    # Generate payment proof for 0.10 USDC
    proof = create_payment_proof(
        private_key=private_key,
        chain_id=chain_id,
        token_address=token_address,
        recipient_address=recipient_address,
        amount_in_usdc='0.10'
    )
    
    print('Payment Proof:')
    print(json.dumps(proof, indent=2))
    
    return proof

if __name__ == '__main__':
    generate_payment()
