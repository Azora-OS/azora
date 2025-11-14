const router = require('express').Router();

const invoices = new Map();

router.get('/:userId', (req, res) => {
  const userInvoices = Array.from(invoices.values()).filter(i => i.userId === req.params.userId);
  res.json({ success: true, data: userInvoices });
});

router.post('/', (req, res) => {
  const { userId, amount, description } = req.body;
  const id = Date.now().toString();
  const invoice = {
    id,
    userId,
    amount,
    description,
    status: 'pending',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date()
  };
  invoices.set(id, invoice);
  res.json({ success: true, data: invoice });
});

router.post('/:id/pay', (req, res) => {
  const invoice = invoices.get(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  invoice.status = 'paid';
  invoice.paidAt = new Date();
  invoices.set(req.params.id, invoice);
  res.json({ success: true, data: invoice });
});

module.exports = router;
