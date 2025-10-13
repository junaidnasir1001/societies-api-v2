#!/usr/bin/env node

// Test MCP server startup
import { spawn } from 'child_process';
import path from 'path';

const mcpServerPath = '/Users/junaidnasir/Herd/Automation/Upwork-Projects/dan-project/src/mcp-server.js';

console.log('Testing MCP server startup...');
console.log('Server path:', mcpServerPath);

const child = spawn('node', [mcpServerPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    GOOGLE_EMAIL: 'research@boldspace.com',
    GOOGLE_PASSWORD: 'advance.2002',
    SESSION_HOME: '/Users/junaidnasir/.mcp-societies',
    BROWSERBASE_WS_ENDPOINT: ''
  }
});

child.stdout.on('data', (data) => {
  console.log('STDOUT:', data.toString());
});

child.stderr.on('data', (data) => {
  console.log('STDERR:', data.toString());
});

child.on('error', (error) => {
  console.error('Process error:', error);
});

child.on('exit', (code) => {
  console.log('Process exited with code:', code);
});

// Send a test request
setTimeout(() => {
  const testRequest = '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}\n';
  child.stdin.write(testRequest);
  
  // Close after getting response
  setTimeout(() => {
    child.kill();
    process.exit(0);
  }, 2000);
}, 1000);
