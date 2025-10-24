#!/usr/bin/env node

// Local testing script for Societies.io API
// Usage: node test-local.js

const BASE_URL = 'http://localhost:3001';
const API_KEY = process.env.API_KEY || 'your_api_key_here';

async function testAPI() {
  console.log('🧪 Testing Societies.io API Locally');
  console.log('=====================================');

  try {
    // Test 1: Health Check
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test 2: API Info
    console.log('\n2. Testing API info...');
    const infoResponse = await fetch(`${BASE_URL}/api/info`, {
      headers: { 'X-API-Key': API_KEY }
    });
    const infoData = await infoResponse.json();
    console.log('✅ API info:', infoData.name);

    // Test 3: Email Subject - Single String (Backward Compatible)
    console.log('\n3. Testing email subject (single string)...');
    const emailResponse = await fetch(`${BASE_URL}/api/societies/test-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        testType: 'email_subject',
        testString: 'Get 50% off today!\nLimited time offer\nSave big this weekend',
        societyName: 'UK Marketing Leaders',
        mode: 'async'
      })
    });
    const emailData = await emailResponse.json();
    console.log('✅ Email subject test started:', emailData);

    if (emailData.jobId) {
      console.log(`📋 Job ID: ${emailData.jobId}`);
      
      // Test 4: Check job status
      console.log('\n4. Checking job status...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`${BASE_URL}/api/jobs/${emailData.jobId}`, {
        headers: { 'X-API-Key': API_KEY }
      });
      const statusData = await statusResponse.json();
      console.log('📊 Job status:', statusData.status);
      
      if (statusData.status === 'completed') {
        console.log('🎉 Test completed!');
        console.log('Winner:', statusData.results?.winner);
        console.log('Impact Score:', statusData.results?.impactScore?.value);
        console.log('Uplift:', statusData.results?.uplift + '%');
      } else {
        console.log('⏳ Test still processing... Check again in 30 seconds');
      }
    }

    // Test 5: Meta Ad - Multiple Strings (New Format)
    console.log('\n5. Testing meta ad (multiple strings)...');
    const metaResponse = await fetch(`${BASE_URL}/api/societies/test-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        testType: 'meta_ad',
        testStrings: [
          'Transform your business today',
          'Unlock your potential',
          'Join thousands of successful entrepreneurs'
        ],
        societyName: 'UK Enterprise Marketing Leaders',
        mode: 'async'
      })
    });
    const metaData = await metaResponse.json();
    console.log('✅ Meta ad test started:', metaData);

    // Test 6: Different Audience
    console.log('\n6. Testing HR Decision-Makers audience...');
    const hrResponse = await fetch(`${BASE_URL}/api/societies/test-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        testType: 'email_subject',
        testString: 'New HR software solution\nStreamline your processes\nReduce admin time by 50%',
        societyName: 'UK HR Decision-Makers',
        mode: 'async'
      })
    });
    const hrData = await hrResponse.json();
    console.log('✅ HR audience test started:', hrData);

    console.log('\n✅ All tests completed!');
    console.log('📝 Note: Jobs typically take 2-4 minutes to complete');
    console.log('🔍 Use the job IDs above to check status with:');
    console.log(`   curl -H "X-API-Key: ${API_KEY}" http://localhost:3001/api/jobs/{jobId}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('💡 Make sure the API server is running: npm start');
  }
}

// Run the test
testAPI();
