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
          service: 'Societies.io Content Testing API'
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

      // For now, return a mock response since we can't run Playwright in Netlify Functions
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          message: 'API endpoint is working! Playwright automation requires server environment.',
          result: {
            winner: 'Test result',
            impactScore: { value: '75', rating: 'Good' },
            averageScore: '65',
            uplift: '15',
            insights: 'This is a test response. For full automation, deploy to a server environment.'
          }
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