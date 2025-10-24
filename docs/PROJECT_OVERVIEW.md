# Societies.io Content Testing API

## Overview
Automated API for testing content with societies.io platform. Supports both Email subject lines and Ad headlines testing.

## Features
- ✅ Email subject line testing
- ✅ Ad headline testing  
- ✅ Multiple audience targeting
- ✅ Async job processing
- ✅ Accurate result extraction
- ✅ New UI support

## Quick Setup
1. `npm install`
2. `npm run api`
3. Test with Postman collection or curl commands

## API Endpoints
- `POST /api/societies/test-content` - Main testing endpoint
- `GET /api/jobs/{jobId}` - Check job status
- `GET /health` - Health check

## Content Types
- **Email subject** - Email subject line testing
- **Ad headline** - Meta ad headline testing

## Audiences
- UK Marketing Leaders
- UK HR Decision-Makers  
- UK Mortgage Advisors
- UK Beauty Lovers
- UK Consumers
- UK Journalists
- UK Enterprise Marketing Leaders

## Response Format
Returns winner, impact score, average score, uplift percentage, and detailed insights.