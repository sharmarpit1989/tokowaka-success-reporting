/**
 * Test Azure OpenAI Connection
 * Run with: node test-azure-openai.js
 */

require('dotenv').config();

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || 'https://aem-sites-1-genai-us-east-2.openai.azure.com';
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_API_VERSION = process.env.AZURE_API_VERSION || '2024-02-01';
const AZURE_COMPLETION_DEPLOYMENT = process.env.AZURE_COMPLETION_DEPLOYMENT || 'gpt-4o';

console.log('==================================');
console.log('  Azure OpenAI Connection Test');
console.log('==================================\n');

console.log('Configuration:');
console.log('  Endpoint:', AZURE_OPENAI_ENDPOINT);
console.log('  API Key:', AZURE_OPENAI_KEY ? `SET (${AZURE_OPENAI_KEY.length} chars)` : 'NOT SET');
console.log('  API Version:', AZURE_API_VERSION);
console.log('  Deployment:', AZURE_COMPLETION_DEPLOYMENT);
console.log();

if (!AZURE_OPENAI_KEY) {
  console.error('❌ ERROR: AZURE_OPENAI_KEY is not set!');
  console.log('\nAdd this to your backend/.env file:');
  console.log('AZURE_OPENAI_KEY=your-api-key-here');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('Testing connection...\n');
    
    const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_COMPLETION_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_OPENAI_KEY
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Say "Hello" if you can hear me.' }
        ],
        max_tokens: 10
      })
    });

    console.log('Response Status:', response.status, response.statusText);
    
    if (response.status === 401) {
      console.error('\n❌ ERROR 401: Unauthorized');
      console.error('This means your API key is invalid or doesn\'t match the endpoint.\n');
      console.error('Troubleshooting:');
      console.error('  1. Check your API key is correct');
      console.error('  2. Verify the endpoint matches your Azure resource');
      console.error('  3. Make sure the deployment name exists in your resource\n');
      
      const errorText = await response.text();
      console.error('Error details:', errorText);
      process.exit(1);
    }
    
    if (response.status === 404) {
      console.error('\n❌ ERROR 404: Deployment not found');
      console.error(`The deployment "${AZURE_COMPLETION_DEPLOYMENT}" doesn't exist.\n`);
      console.error('Troubleshooting:');
      console.error('  1. Go to Azure Portal → Your OpenAI Resource');
      console.error('  2. Click "Model deployments"');
      console.error('  3. Check the exact name of your deployed model');
      console.error('  4. Update AZURE_COMPLETION_DEPLOYMENT in your .env file\n');
      process.exit(1);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`\n❌ ERROR ${response.status}:`, errorText);
      process.exit(1);
    }

    const data = await response.json();
    
    console.log('\n✅ SUCCESS! Connection is working!\n');
    console.log('Response:', data.choices[0]?.message?.content);
    console.log('\nYour Azure OpenAI is configured correctly.');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testConnection();

