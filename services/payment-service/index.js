const axios = require('axios');

// Stitch open banking payout (real API, requires account/key)
async function withdrawZARStitch(zarAmount, bankDetails) {
  try {
    const response = await axios.post('https://api.stitch.money/payments', {
      amount: zarAmount,
      bank_account: bankDetails.account,
      reference: 'Azora OS Withdrawal'
    }, {
      headers: { Authorization: `Bearer ${process.env.STITCH_API_KEY}` }
    });
    return { status: 'success', ref: response.data.reference, zarAmount };
  } catch (err) {
    return { status: 'failed', error: err.message };
  }
}

// Flutterwave payout (real API, requires account/key)
async function withdrawZARFlutterwave(zarAmount, bankDetails) {
  try {
    const response = await axios.post('https://api.flutterwave.com/v3/transfers', {
      amount: zarAmount,
      account_bank: bankDetails.bankCode,
      account_number: bankDetails.account,
      narration: 'Azora OS Withdrawal',
      currency: 'ZAR'
    }, {
      headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_API_KEY}` }
    });
    return { status: 'success', ref: response.data.data.id, zarAmount };
  } catch (err) {
    return { status: 'failed', error: err.message };
  }
}

// Luno payout (real API, requires account/key)
async function withdrawZARLuno(zarAmount, bankDetails) {
  try {
    const response = await axios.post('https://api.luno.com/api/1/withdrawals', {
      amount: zarAmount,
      currency: 'ZAR',
      account_id: process.env.LUNO_ACCOUNT_ID,
      reference: 'Azora OS Withdrawal'
    }, {
      headers: { Authorization: `Bearer ${process.env.LUNO_API_KEY}` }
    });
    return { status: 'success', ref: response.data.reference, zarAmount };
  } catch (err) {
    return { status: 'failed', error: err.message };
  }
}

// Open-source/local alternative: Simulate EFT (for dev/demo, no real transfer)
async function withdrawZARLocal(zarAmount, bankDetails) {
  // This is a free, open-source fallback for testing or demo
  return {
    status: 'success',
    ref: `LOCAL-${Date.now()}`,
    zarAmount,
    bankDetails,
    note: 'Simulated local EFT (no real transfer, open source alternative)'
  };
}

// Example: Add another open-source alternative using a webhook (for custom integrations)
async function withdrawZARWebhook(zarAmount, bankDetails) {
  try {
    // Replace with your own webhook endpoint for custom payout logic
    const response = await axios.post(process.env.WITHDRAW_WEBHOOK_URL, {
      amount: zarAmount,
      bankDetails,
      reference: 'Azora OS Withdrawal'
    });
    return { status: 'success', ref: response.data.ref || response.data.id, zarAmount };
  } catch (err) {
    return { status: 'failed', error: err.message };
  }
}

module.exports = {
  withdrawZARStitch,
  withdrawZARFlutterwave,
  withdrawZARLuno,
  withdrawZARLocal,
  withdrawZARWebhook
};