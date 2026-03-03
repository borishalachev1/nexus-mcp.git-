from setuptools import setup, find_packages

setup(
    name="nexus-x402-client",
    version="1.0.0",
    description="X402 client library for Nexus MCP payment proofs",
    author="Boris Halachev",
    license="MIT",
    py_modules=["x402_client"],
    install_requires=[
        "web3>=6.0.0",
        "eth-account>=0.10.0",
    ],
    python_requires=">=3.8",
    keywords=["x402", "payment", "web3", "usdc", "permit2", "nexus", "mcp"],
)
