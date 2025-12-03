const invoices = new Map();
const subscriptions = new Map();

const createInvoice = async (req, res) => {
  try {
    const { userId, amount, description, items } = req.body;
    
    if (!userId || !amount || !description) {
      return res.status(400).json({ error: 'UserId, amount, and description are required' });
    }

    const invoice = {
      id: `inv_${Date.now()}`,
      userId,
      amount,
      description,
      items: items || [],
      status: 'pending',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    invoices.set(invoice.id, invoice);

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice
    });
  } catch (error) {
    console.error('Invoice creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const processPayment = async (req, res) => {
  try {
    const { invoiceId, paymentMethod } = req.body;
    
    if (!invoiceId || !paymentMethod) {
      return res.status(400).json({ error: 'InvoiceId and paymentMethod are required' });
    }

    const invoice = invoices.get(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ error: 'Invoice already paid' });
    }

    invoice.status = 'paid';
    invoice.paidAt = new Date().toISOString();
    invoice.paymentMethod = paymentMethod;

    invoices.set(invoiceId, invoice);

    res.json({
      message: 'Payment processed successfully',
      invoice,
      transactionId: `txn_${Date.now()}`
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createInvoice,
  processPayment
};