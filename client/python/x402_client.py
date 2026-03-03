"""
X402 Client Library for Nexus MCP (Python)
Generate payment proofs for calling payment-gated MCP tools
"""

import time
import random
from typing import Dict, Any, Optional
from eth_account import Account
from eth_account.messages import encode_typed_data
from web3 import Web3

PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3"


class X402PaymentProof:
    """X402 Payment Proof structure"""
    
    def __init__(self, data: Dict[str, Any]):
        self.permitted = data['permitted']
        self.spender = data['spender']
        self.nonce = data['nonce']
        self.deadline = data['deadline']
        self.witness = data['witness']
        self.signature = data['signature']
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'permitted': self.permitted,
            'spender': self.spender,
            'nonce': self.nonce,
            'deadline': self.deadline,
            'witness': self.witness,
            'signature': self.signature,
        }


class X402Client:
    """Client for generating X402 payment proofs"""
    
    def __init__(
        self,
        private_key: str,
        chain_id: int,
        token_address: str,
        recipient_address: str,
        permit2_address: str = PERMIT2_ADDRESS,
    ):
        """
        Initialize X402 Client
        
        Args:
            private_key: Ethereum private key (with or without 0x prefix)
            chain_id: Chain ID (84532 for Base Sepolia, 8453 for Base, etc.)
            token_address: USDC token contract address
            recipient_address: Payment recipient wallet address
            permit2_address: Permit2 contract address (default is canonical)
        """
        self.chain_id = chain_id
        self.token_address = Web3.to_checksum_address(token_address)
        self.recipient_address = Web3.to_checksum_address(recipient_address)
        self.permit2_address = Web3.to_checksum_address(permit2_address)
        
        # Load account from private key
        if not private_key.startswith('0x'):
            private_key = '0x' + private_key
        self.account = Account.from_key(private_key)
    
    def generate_payment_proof(
        self,
        amount_in_usdc: str,
        expiry_minutes: int = 5
    ) -> X402PaymentProof:
        """
        Generate a payment proof for X402 protocol
        
        Args:
            amount_in_usdc: Amount in USDC (e.g., "0.10" for $0.10)
            expiry_minutes: Minutes until the payment proof expires
        
        Returns:
            X402PaymentProof object
        """
        nonce = self._generate_nonce()
        deadline = int(time.time()) + (expiry_minutes * 60)
        amount_wei = self._usdc_to_wei(amount_in_usdc)
        
        # Create EIP-712 typed data
        typed_data = {
            "types": {
                "EIP712Domain": [
                    {"name": "name", "type": "string"},
                    {"name": "chainId", "type": "uint256"},
                    {"name": "verifyingContract", "type": "address"},
                ],
                "PermitWitnessTransferFrom": [
                    {"name": "permitted", "type": "TokenPermissions"},
                    {"name": "spender", "type": "address"},
                    {"name": "nonce", "type": "uint256"},
                    {"name": "deadline", "type": "uint256"},
                    {"name": "witness", "type": "PaymentWitness"},
                ],
                "TokenPermissions": [
                    {"name": "token", "type": "address"},
                    {"name": "amount", "type": "uint256"},
                ],
                "PaymentWitness": [
                    {"name": "recipient", "type": "address"},
                    {"name": "amount", "type": "uint256"},
                ],
            },
            "domain": {
                "name": "Permit2",
                "chainId": self.chain_id,
                "verifyingContract": self.permit2_address,
            },
            "primaryType": "PermitWitnessTransferFrom",
            "message": {
                "permitted": {
                    "token": self.token_address,
                    "amount": str(amount_wei),
                },
                "spender": self.recipient_address,
                "nonce": str(nonce),
                "deadline": str(deadline),
                "witness": {
                    "recipient": self.recipient_address,
                    "amount": str(amount_wei),
                },
            },
        }
        
        # Sign the typed data
        encoded_data = encode_typed_data(full_message=typed_data)
        signed_message = self.account.sign_message(encoded_data)
        
        proof_data = {
            'permitted': {
                'token': self.token_address,
                'amount': str(amount_wei),
            },
            'spender': self.recipient_address,
            'nonce': str(nonce),
            'deadline': deadline,
            'witness': {
                'recipient': self.recipient_address,
                'amount': str(amount_wei),
            },
            'signature': signed_message.signature.hex(),
        }
        
        return X402PaymentProof(proof_data)
    
    def _usdc_to_wei(self, amount: str) -> int:
        """Convert USDC amount to wei (6 decimals)"""
        parts = amount.split('.')
        whole = parts[0]
        fraction = (parts[1] if len(parts) > 1 else '').ljust(6, '0')[:6]
        return int(whole + fraction)
    
    def _generate_nonce(self) -> int:
        """Generate a unique nonce"""
        return int(time.time() * 1000) + random.randint(0, 999999)


def create_payment_proof(
    private_key: str,
    chain_id: int,
    token_address: str,
    recipient_address: str,
    amount_in_usdc: str,
) -> Dict[str, Any]:
    """
    Quick helper function for simple use cases
    
    Args:
        private_key: Ethereum private key
        chain_id: Chain ID
        token_address: USDC token contract address
        recipient_address: Payment recipient wallet address
        amount_in_usdc: Amount in USDC (e.g., "0.10")
    
    Returns:
        Payment proof as a dictionary
    """
    client = X402Client(
        private_key=private_key,
        chain_id=chain_id,
        token_address=token_address,
        recipient_address=recipient_address,
    )
    proof = client.generate_payment_proof(amount_in_usdc)
    return proof.to_dict()
