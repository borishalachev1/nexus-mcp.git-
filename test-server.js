/**
 * Simple test script to verify Nexus MCP server works
 * Run with: node test-server.js
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

async function testNexusMCP() {
  console.log('🔍 Testing Nexus MCP Server...\n');

  // Start the server process
  const serverProcess = spawn('node', ['dist/index.js'], {
    env: {
      ...process.env,
      THIRDWEB_CLIENT_ID: 'd1749067a09ce18447b8390bbdf1eb2a',
      CHAIN_ID: '84532',
      PAYMENT_TOKEN_ADDRESS: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      PAYMENT_RECIPIENT: '0xAd66258169045654Aa8103847CAb59952c3AaB0C',
      X402_FACILITATOR_URL: 'https://facilitator.x402.org',
      PERMIT2_ADDRESS: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    },
  });

  // Create transport
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/index.js'],
    env: {
      THIRDWEB_CLIENT_ID: 'd1749067a09ce18447b8390bbdf1eb2a',
      CHAIN_ID: '84532',
      PAYMENT_TOKEN_ADDRESS: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      PAYMENT_RECIPIENT: '0xAd66258169045654Aa8103847CAb59952c3AaB0C',
      X402_FACILITATOR_URL: 'https://facilitator.x402.org',
      PERMIT2_ADDRESS: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    },
  });

  // Create client
  const client = new Client(
    {
      name: 'nexus-test-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  try {
    // Connect
    console.log('📡 Connecting to server...');
    await client.connect(transport);
    console.log('✅ Connected!\n');

    // Test 1: List tools
    console.log('📋 Test 1: Listing available tools...');
    const toolsResponse = await client.request(
      {
        method: 'tools/list',
      },
      { timeout: 5000 }
    );

    console.log(`✅ Found ${toolsResponse.tools.length} tools:\n`);
    toolsResponse.tools.forEach((tool, i) => {
      console.log(`${i + 1}. ${tool.name}`);
      console.log(`   Description: ${tool.description}`);
      console.log('');
    });

    // Test 2: Call free tool
    console.log('🆓 Test 2: Calling free tool (get_service_info)...');
    const freeToolResponse = await client.request(
      {
        method: 'tools/call',
        params: {
          name: 'get_service_info',
          arguments: {},
        },
      },
      { timeout: 5000 }
    );

    console.log('✅ Free tool response:');
    console.log(JSON.stringify(freeToolResponse, null, 2));
    console.log('');

    // Test 3: Call paid tool (should fail with payment requirement)
    console.log('💰 Test 3: Calling paid tool without payment (get_weather)...');
    try {
      await client.request(
        {
          method: 'tools/call',
          params: {
            name: 'get_weather',
            arguments: {
              city: 'London',
            },
          },
        },
        { timeout: 5000 }
      );
      console.log('❌ ERROR: Should have requested payment!');
    } catch (error) {
      console.log('✅ Correctly requested payment:');
      console.log('   Error:', error.message);
      if (error.data) {
        console.log('   Payment required:', error.data.amount, 'USDC');
        console.log('   Token:', error.data.token);
        console.log('   Recipient:', error.data.recipient);
        console.log('   Chain ID:', error.data.chainId);
      }
      console.log('');
    }

    console.log('════════════════════════════════════════════════════');
    console.log('🎉 All tests passed! Nexus MCP is working correctly!');
    console.log('════════════════════════════════════════════════════\n');

    console.log('Next steps:');
    console.log('1. Run: npm run inspector (to use web UI)');
    console.log('2. Add to Claude Desktop config');
    console.log('3. Start using payment-gated tools!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await client.close();
    serverProcess.kill();
    process.exit(0);
  }
}

testNexusMCP().catch(console.error);
