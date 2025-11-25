const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { ethers } = require('ethers');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'mint-service' });
});

// Create collection
app.post('/collections', async (req, res) => {
  try {
    const { name, description, symbol, creatorId } = req.body;

    if (!name || !symbol || !creatorId) {
      return res.status(400).json({ error: 'Name, symbol, and creatorId are required' });
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        symbol,
        creatorId
      }
    });

    res.json({ success: true, collection });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// Get collections
app.get('/collections', async (req, res) => {
  try {
    const { creatorId } = req.query;
    const where = creatorId ? { creatorId } : {};

    const collections = await prisma.collection.findMany({
      where,
      include: {
        _count: {
          select: { nfts: true }
        }
      }
    });

    res.json({ collections });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ error: 'Failed to get collections' });
  }
});

// Create NFT
app.post('/nfts', upload.single('image'), async (req, res) => {
  try {
    const { name, description, collectionId, creatorId, price } = req.body;

    if (!name || !collectionId || !creatorId || !req.file) {
      return res.status(400).json({ error: 'Name, collectionId, creatorId, and image are required' });
    }

    // In a real implementation, you'd upload the image to IPFS or similar
    const imageUrl = `https://azora-mint.s3.amazonaws.com/${Date.now()}-${req.file.originalname}`;

    const nft = await prisma.nFT.create({
      data: {
        name,
        description,
        imageUrl,
        collectionId,
        creatorId,
        ownerId: creatorId,
        price: price ? parseFloat(price) : null
      }
    });

    res.json({ success: true, nft });
  } catch (error) {
    console.error('Create NFT error:', error);
    res.status(500).json({ error: 'Failed to create NFT' });
  }
});

// Get NFTs
app.get('/nfts', async (req, res) => {
  try {
    const { collectionId, ownerId, status } = req.query;
    const where = {};

    if (collectionId) where.collectionId = collectionId;
    if (ownerId) where.ownerId = ownerId;
    if (status) where.status = status;

    const nfts = await prisma.nFT.findMany({
      where,
      include: {
        collection: true
      }
    });

    res.json({ nfts });
  } catch (error) {
    console.error('Get NFTs error:', error);
    res.status(500).json({ error: 'Failed to get NFTs' });
  }
});

// Mint NFT (simulate blockchain minting)
app.post('/nfts/:id/mint', async (req, res) => {
  try {
    const { id } = req.params;
    const { contractAddress } = req.body;

    const nft = await prisma.nFT.findUnique({
      where: { id }
    });

    if (!nft) {
      return res.status(404).json({ error: 'NFT not found' });
    }

    if (nft.status !== 'draft') {
      return res.status(400).json({ error: 'NFT already minted' });
    }

    // Simulate minting process
    const tokenId = `0x${Math.random().toString(16).substr(2, 64)}`;

    const updatedNft = await prisma.nFT.update({
      where: { id },
      data: {
        tokenId,
        status: 'minted'
      }
    });

    res.json({ success: true, nft: updatedNft });
  } catch (error) {
    console.error('Mint NFT error:', error);
    res.status(500).json({ error: 'Failed to mint NFT' });
  }
});

// List NFT for sale
app.post('/nfts/:id/list', async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }

    const nft = await prisma.nFT.update({
      where: { id },
      data: {
        price: parseFloat(price),
        status: 'listed'
      }
    });

    res.json({ success: true, nft });
  } catch (error) {
    console.error('List NFT error:', error);
    res.status(500).json({ error: 'Failed to list NFT' });
  }
});

// Get NFT details
app.get('/nfts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const nft = await prisma.nFT.findUnique({
      where: { id },
      include: {
        collection: true
      }
    });

    if (!nft) {
      return res.status(404).json({ error: 'NFT not found' });
    }

    res.json({ nft });
  } catch (error) {
    console.error('Get NFT error:', error);
    res.status(500).json({ error: 'Failed to get NFT' });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, async () => {
  console.log(`🎨 Azora Mint Service running on port ${PORT}`);
  console.log(`📚 Collections: GET/POST http://localhost:${PORT}/collections`);
  console.log(`🖼️  NFTs: GET/POST http://localhost:${PORT}/nfts`);
  console.log(`⚡ Mint: POST http://localhost:${PORT}/nfts/:id/mint`);

  try {
    await prisma.$connect();
    console.log('🗄️  Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
});