#!/usr/bin/env node
/**
 * Direct MCP Server Test
 * Tests the Nexus MCP server without needing Claude CLI credits
 */

const { spawn } = require('child_process');
const readline = require('readline');

console.log('🧪 Testing Nexus MCP Server Directly\n');

// Start the MCP server
const server = spawn('node', ['dist/index.js'], {
  cwd: '/home/boris/Desktop/nexus-mcp.git-/nexus-mcp.git-',
  env: {
    ...process.env,
    THIRDWEB_CLIENT_ID: '7b747b322e1128ac0fc2a5c2c79b7504',
    PAYMENT_RECIPIENT: '0xCE918BbF214E64951B2fFD3c0a895C1411fe3D85',
    CHAIN_ID: '84532',
    PAYMENT_TOKEN_ADDRESS: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  }
});

// Send initialize request
setTimeout(() => {
  console.log('📤 Sending initialize request...\n');
  
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };
  
  server.stdin.write(JSON.stringify(initRequest) + '\n');
  
  // List tools
  setTimeout(() => {
    console.log('📤 Requesting tools list...\n');
    
    const toolsRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    };
    
    server.stdin.write(JSON.stringify(toolsRequest) + '\n');
    
    // Exit after response
    setTimeout(() => {
      console.log('\n✅ Test complete!');
      server.kill();
      process.exit(0);
    }, 2000);
  }, 1000);
}, 1000);

// Handle server output
server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('📥 Server response:', output);
  
  try {
    const response = JSON.parse(output);
    if (response.result && response.result.tools) {
      console.log('\n✅ TOOLS FOUND:');
      response.result.tools.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });
    }
  } catch (e) {
    // Not JSON, just log output
  }
});

server.stderr.on('data', (data) => {
  console.log('📋 Server log:', data.toString());
});

server.on('close', (code) => {
  console.log(`\n🔚 Server exited with code ${code}`);
});
