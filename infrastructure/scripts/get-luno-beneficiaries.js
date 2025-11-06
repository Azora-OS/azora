// filepath: scripts/get-luno-beneficiaries.js
require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

async function getLunoBeneficiaries() {
  const timestamp = Math.floor(Date.now() / 1000);
  const method = 'GET';
  const path = '/api/1/beneficiaries';
  const message = timestamp + method + path;
  const signature = crypto.createHmac('sha256', process.env.LUNO_API_SECRET).update(message).digest('hex');

  try {
    const response = await axios.get('https://api.luno.com' + path, {
      headers: {
        'Authorization': `LUNO-API-KEY ${process.env.LUNO_API_KEY}`,
        'LUNO-TIMESTAMP': timestamp.toString(),
        'LUNO-SIGNATURE': signature
      }
    });
    console.log('Beneficiaries:', response.data.beneficiaries);
    // Copy the 'id' for ZAR EFT and update LUNO_BENEFICIARY_ID in .env
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

getLunoBeneficiaries();