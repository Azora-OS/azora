class VirtualCardService {
  async issueCard(userAddress, amount) {
    // Mock: Generate a virtual card number
    const cardNumber = `4${Math.random().toString().slice(2, 15)}`; // Fake Visa number
    const expiry = '12/28';
    const cvv = Math.floor(Math.random() * 900) + 100;
    return {
      cardId: `CARD-${Date.now()}`,
      cardNumber,
      expiry,
      cvv,
      amount,
      status: 'Issued (mock)'
    };
  }
}

export default new VirtualCardService();