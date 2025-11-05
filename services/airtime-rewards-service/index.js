import axios from 'axios';
import AzoraPayService from '../azora-pay-service/index.js';

class AirtimeRewardsService {
  constructor() {
    this.apiKey = process.env.AIRTIME_API_KEY; // Add to .env
    this.apiUrl = 'https://api.airtime.com/purchase'; // Example API for purchasing
  }

  async buyAirtimeWithAZR(userAddress, phoneNumber, zarAmount) {
    try {
      // Calculate AZR needed (assume 1 AZR = 10 ZAR)
      const azrAmount = zarAmount / 10;

      // Check balance and burn AZR
      const balance = await AzoraPayService.getAZRBalance(userAddress);
      if (balance.balance < azrAmount) return { error: 'Insufficient AZR balance' };

      const burnResult = await AzoraPayService.burnAZR(userAddress, azrAmount);
      if (burnResult.error) return burnResult;

      // Purchase airtime
      const response = await axios.post(this.apiUrl, {
        phone: phoneNumber,
        amount: zarAmount,
        currency: 'ZAR'
      }, {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      });

      return { success: true, data: response.data, burnedAZR: azrAmount };
    } catch (err) {
      return { error: err.message };
    }
  }

  async rewardStudentAirtime(userAddress, zarAmount) {
    try {
      // Assume user has a phone number linked; placeholder
      const phoneNumber = '27XXXXXXXXX'; // Replace with real lookup
      const response = await axios.post(this.apiUrl, {
        phone: phoneNumber,
        amount: zarAmount,
        currency: 'ZAR'
      }, {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      });
      return { success: true, data: response.data };
    } catch (err) {
      return { error: err.message };
    }
  }
}

export default new AirtimeRewardsService();