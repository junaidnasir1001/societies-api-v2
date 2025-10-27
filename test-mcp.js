#!/usr/bin/env node

/**
 * Quick test script for the MCP server
 * This simulates how an MCP client would interact with the server
 */

import { spawn } from 'child_process';

const testRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'societies_test_content',
    arguments: {
      societyName: 'Startup Investors',
      testType: 'Article',
      testString: 'testing mcp integration'
    }
  }
};

console.log('🧪 Testing MCP Server...\n');
console.log('📤 Sending request:');
console.log(JSON.stringify(testRequest, null, 2));
console.log('\n⏳ Waiting for response (this may take 4-5 minutes)...\n');

const server = spawn('node', ['src/mcp-server.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

let responseData = '';

server.stdout.on('data', (data) => {
  responseData += data.toString();
});

server.stdout.on('end', () => {
  try {
    const response = JSON.parse(responseData);
    console.log('\n✅ Response received:');
    console.log(JSON.stringify(response, null, 2));
    
    const content = JSON.parse(response.result.content[0].text);
    if (content.ok) {
      console.log('\n🎉 TEST PASSED!');
      console.log(`   Impact Score: ${content.results.impactScore.value}/100`);
      console.log(`   Attention: Full ${content.results.attention.full}%, Ignore ${content.results.attention.ignore}%`);
      console.log(`   Winner: ${content.results.winner}`);
      console.log(`   Average Score: ${content.results.averageScore}`);
      console.log(`   Uplift: ${content.results.uplift}%`);
    } else {
      console.log('\n❌ TEST FAILED:', content.error);
    }
  } catch (err) {
    console.error('\n❌ Failed to parse response:', err.message);
    console.log('Raw response:', responseData);
  }
  process.exit(0);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

// Send the request
server.stdin.write(JSON.stringify(testRequest) + '\n');
server.stdin.end();

// Timeout after 10 minutes
setTimeout(() => {
  console.error('\n⏱️  Test timeout after 10 minutes');
  server.kill();
  process.exit(1);
}, 10 * 60 * 1000);

