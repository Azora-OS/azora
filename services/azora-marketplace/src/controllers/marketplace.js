const products = new Map();
const orders = new Map();

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, sellerId } = req.body;
    
    if (!name || !price || !sellerId) {
      return res.status(400).json({ error: 'Name, price, and sellerId are required' });
    }

    const product = {
      id: `prod_${Date.now()}`,
      name,
      description: description || '',
      price,
      category: category || 'general',
      sellerId,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    products.set(product.id, product);

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProducts = async (req, res) => {
  try {
    const { category, search, limit = 10, offset = 0 } = req.query;
    let filteredProducts = Array.from(products.values());

    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    if (search) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = filteredProducts.length;
    filteredProducts = filteredProducts.slice(offset, offset + parseInt(limit));

    res.json({
      products: filteredProducts,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createOrder = async (req, res) => {
  try {
    const { productId, buyerId, quantity = 1 } = req.body;
    
    if (!productId || !buyerId) {
      return res.status(400).json({ error: 'ProductId and buyerId are required' });
    }

    const product = products.get(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const order = {
      id: `order_${Date.now()}`,
      productId,
      buyerId,
      sellerId: product.sellerId,
      quantity,
      totalAmount: product.price * quantity,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    orders.set(order.id, order);

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createProduct,
  getProducts,
  createOrder
};