const valuationService = require('../valuation-service/index');
class TokenExchangeService {
  exchangeAZRtoZAR(userId, azrAmount, azoraCoinService) {
    const balance = azoraCoinService.getBalance(userId);
    if (balance < azrAmount) throw new Error('Insufficient AZR balance');
    azoraCoinService.balances[userId] -= azrAmount;
    return valuationService.convertAZRtoZAR(azrAmount);
  }
}
module.exports = new TokenExchangeService();
