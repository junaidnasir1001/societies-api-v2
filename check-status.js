#!/usr/bin/env node

// Job status checker for local testing
// Usage: node check-status.js <jobId>

const BASE_URL = 'http://localhost:3001';
const API_KEY = process.env.API_KEY || 'your_api_key_here';

async function checkStatus(jobId) {
  if (!jobId) {
    console.log('❌ Please provide a job ID');
    console.log('Usage: node check-status.js <jobId>');
    process.exit(1);
  }

  try {
    console.log(`🔍 Checking status for job: ${jobId}`);
    
    const response = await fetch(`${BASE_URL}/api/jobs/${jobId}`, {
      headers: { 'X-API-Key': API_KEY }
    });
    
    const data = await response.json();
    
    console.log('\n📊 Job Status:');
    console.log('==============');
    console.log(`Status: ${data.status}`);
    console.log(`Created: ${data.createdAt}`);
    console.log(`Updated: ${data.updatedAt}`);
    
    if (data.status === 'completed') {
      console.log('\n🎉 Results:');
      console.log('===========');
      console.log(`Winner: ${data.results?.winner || 'N/A'}`);
      console.log(`Impact Score: ${data.results?.impactScore?.value || 'N/A'} (${data.results?.impactScore?.rating || 'N/A'})`);
      console.log(`Average Score: ${data.results?.averageScore || 'N/A'}`);
      console.log(`Uplift: ${data.results?.uplift || 'N/A'}%`);
      console.log(`Insights: ${data.results?.insights || 'N/A'}`);
      
      if (data.results?.attention) {
        console.log('\n📈 Attention Metrics:');
        console.log(`Full: ${data.results.attention.full}`);
        console.log(`Partial: ${data.results.attention.partial}`);
        console.log(`Ignore: ${data.results.attention.ignore}`);
      }
    } else if (data.status === 'running') {
      console.log('\n⏳ Job is still processing...');
      console.log('💡 Check again in 30 seconds');
    } else if (data.status === 'failed') {
      console.log('\n❌ Job failed');
      console.log(`Error: ${data.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking status:', error.message);
  }
}

// Get job ID from command line arguments
const jobId = process.argv[2];
checkStatus(jobId);
