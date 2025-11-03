#!/usr/bin/env node

// Test SSE client that properly handles Server-Sent Events

// Use global fetch (Node.js 18+)

const BASE_URL = 'http://localhost:3001';
const API_KEY = 'societies-api-secret-key-2024';

async function testSSE() {
  console.log('🧪 Testing SSE Endpoint');
  console.log('========================\n');

  try {
    const response = await fetch(`${BASE_URL}/api/societies/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        contentType: 'Ad headline',
        subjectLines: ['Enterprise solutions that scale'],
        targetAudience: 'UK Enterprise Marketing Leaders'
      })
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      return;
    }

    console.log('✅ Connection established');
    console.log('📡 Waiting for events...\n');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let eventCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('\n✅ Stream ended');
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';
      
      for (const message of lines) {
        if (message.trim()) {
          eventCount++;
          console.log(`\n[Event ${eventCount}]`);
          
          const msgLines = message.split('\n');
          for (const line of msgLines) {
            if (line.startsWith('event: ')) {
              console.log(`  Type: ${line.substring(7)}`);
            } else if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));
                console.log(`  Data:`, JSON.stringify(data, null, 2));
              } catch (e) {
                console.log(`  Data: ${line.substring(6)}`);
              }
            }
          }
        }
      }
    }

    console.log(`\n📊 Total events: ${eventCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSSE();

