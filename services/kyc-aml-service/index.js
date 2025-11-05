import axios from 'axios';

class ComplianceService {
  constructor() {
    this.geoApiKey = process.env.IPGEOLOCATION_API_KEY; // Free key from ipgeolocation.io
  }

  async checkKYC(userData) {
    // Basic checks
    const nameValid = /^[a-zA-Z\s]+$/.test(userData.name);
    const idValid = /^\d{13}$/.test(userData.idNumber); // South African ID example
    if (!nameValid || !idValid) {
      return { approved: false, reason: 'Invalid name or ID' };
    }
    return { approved: true };
  }

  async checkAML(transaction) {
    try {
      // Check IP location for sanctions
      const response = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${this.geoApiKey}&ip=${transaction.ip}`);
      const country = response.data.country_name;
      const sanctionedCountries = ['North Korea', 'Iran']; // Example
      if (sanctionedCountries.includes(country)) {
        return { flagged: true, reason: 'Sanctioned country' };
      }
      return { flagged: false };
    } catch (err) {
      return { flagged: true, reason: 'API error' };
    }
  }
}

export default new ComplianceService();