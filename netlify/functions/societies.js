exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Health check
    if (event.path === '/health' && event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          service: 'Societies.io Content Testing API',
          note: 'For full automation, deploy to a server environment with Playwright support'
        })
      };
    }

    // Main API endpoint
    if (event.path === '/api/societies/test-content' && event.httpMethod === 'POST') {
      const { contentType, subjectLines, targetAudience } = JSON.parse(event.body || '{}');
      
      if (!contentType || !subjectLines || !targetAudience) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Missing required fields: contentType, subjectLines, targetAudience'
          })
        };
      }

      // Convert array to string if needed
      const testString = Array.isArray(subjectLines) 
        ? subjectLines.join('\n') 
        : subjectLines;

      console.log(`[API] Testing: ${contentType} for ${targetAudience}`);

      // Simulate realistic results based on input
      const results = simulateResults(contentType, testString, targetAudience);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          result: results,
          note: 'This is a simulation. For full automation with Playwright, deploy to a server environment.'
        })
      };
    }

    // 404 for other paths
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: 'Not found',
        message: 'API endpoint not found'
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

// Simulate realistic results based on input
function simulateResults(contentType, testString, targetAudience) {
  const lines = testString.split('\n').filter(line => line.trim());
  const winner = lines[Math.floor(Math.random() * lines.length)] || lines[0] || 'Test result';
  
  // Generate realistic scores
  const impactScore = Math.floor(Math.random() * 40) + 40; // 40-80
  const averageScore = Math.floor(Math.random() * 30) + 30; // 30-60
  const uplift = Math.floor(Math.random() * 30) + 10; // 10-40
  
  // Generate insights based on audience
  const insights = generateInsights(contentType, targetAudience, winner);
  
  return {
    winner: winner,
    impactScore: { 
      value: impactScore.toString(), 
      rating: impactScore > 60 ? "Good" : impactScore > 40 ? "Average" : "Below Average" 
    },
    averageScore: averageScore.toString(),
    uplift: uplift.toString(),
    insights: insights
  };
}

function generateInsights(contentType, targetAudience, winner) {
  const audienceInsights = {
    'UK Marketing Leaders': 'Marketing leaders responded best to content that demonstrates clear value proposition and ROI.',
    'UK HR Decision-Makers': 'HR decision-makers preferred content that emphasizes professional development and organizational benefits.',
    'UK Mortgage Advisors': 'Mortgage advisors engaged most with content that highlights financial security and long-term planning.',
    'UK Beauty Lovers': 'Beauty enthusiasts responded to content that emphasizes personal care and self-expression.',
    'UK Consumers': 'General consumers preferred straightforward, benefit-focused messaging.',
    'UK Journalists': 'Journalists engaged with content that provides newsworthy angles and credible information.',
    'UK Enterprise Marketing Leaders': 'Enterprise marketing leaders valued strategic, data-driven content approaches.'
  };
  
  const contentTypeInsights = {
    'Email subject': 'Email subject lines that create urgency and clear value perform best.',
    'Ad headline': 'Ad headlines with specific benefits and emotional triggers drive higher engagement.'
  };
  
  const baseInsight = audienceInsights[targetAudience] || 'The target audience responded positively to the content.';
  const typeInsight = contentTypeInsights[contentType] || 'Content type analysis shows strong performance.';
  
  return `${baseInsight} ${typeInsight} The winning option "${winner}" resonated most effectively with this audience segment.`;
}