const axios = require('axios');

async function paystackTransfer(zarAmount, recipientCode, reason = 'Azora OS Withdrawal') {
  const response = await axios.post('https://api.paystack.co/transfer', {
    source: 'balance',
    amount: zarAmount * 100,
    recipient: recipientCode,
    reason
  }, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
  });
  return response.data;
}

module.exports = { paystackTransfer };
