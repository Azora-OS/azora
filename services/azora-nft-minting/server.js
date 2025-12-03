const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4017;

// Ubuntu Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));
app.use(express.json());

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Ubuntu rate limit exceeded', ubuntu: 'Please slow down for community harmony' }
});
app.use(ubuntuLimiter);

// Ubuntu Health Check
app.get('/health', (req, res) => {
  res.json({
    service: 'azora-nft-minting',
    status: 'healthy',
    ubuntu: 'I create because we express together',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I can because we can',
    principles: [
      'My success enables your success',
      'My knowledge becomes our knowledge',
      'My work strengthens our foundation',
      'My security ensures our freedom'
    ],
    service: 'azora-nft-minting',
    ubuntu: 'Ubuntu creative expression through NFTs'
  });
});

// NFT Minting State
let nfts = [];
let collections = [];
let mintingQueue = [];
let royalties = [];

// NFT Types
const NFTTypes = {
  CERTIFICATE: 'certificate',
  ARTWORK: 'artwork',
  COLLECTIBLE: 'collectible',
  ACHIEVEMENT: 'achievement',
  IDENTITY: 'identity',
  ACCESS_PASS: 'access_pass'
};

// Create Collection
app.post('/api/collections', async (req, res) => {
  try {
    const { name, description, creatorId, category, maxSupply, price, royaltyPercentage = 10 } = req.body;
    
    const collection = {
      id: 'collection-' + Date.now(),
      name,
      description,
      creatorId,
      category,
      maxSupply,
      price,
      royaltyPercentage,
      currentSupply: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      ubuntu: 'Ubuntu NFT collection'
    };
    
    collections.push(collection);
    
    console.log(`🎨 Collection Created: ${name} by ${creatorId}`);
    
    res.json({ 
      success: true, 
      collection: {
        id: collection.id,
        name,
        category,
        maxSupply,
        price,
        royaltyPercentage,
        status: 'active'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Collections
app.get('/api/collections', async (req, res) => {
  try {
    const category = req.query.category;
    const creatorId = req.query.creatorId;
    const status = req.query.status || 'active';
    
    let filteredCollections = collections.filter(c => c.status === status);
    
    if (category) {
      filteredCollections = filteredCollections.filter(c => c.category === category);
    }
    
    if (creatorId) {
      filteredCollections = filteredCollections.filter(c => c.creatorId === creatorId);
    }
    
    res.json({ 
      collections: filteredCollections.map(c => ({
        id: c.id,
        name: c.description,
        category: c.category,
        creatorId: c.creatorId,
        maxSupply: c.maxSupply,
        currentSupply: c.currentSupply,
        price: c.price,
        royaltyPercentage: c.royaltyPercentage,
        status: c.status,
        createdAt: c.createdAt,
        ubuntu: c.ubuntu
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mint NFT
app.post('/api/nfts/mint', async (req, res) => {
  try {
    const { 
      collectionId, 
      ownerId, 
      type, 
      metadata, 
      contentUri, 
      price = 0,
      attributes = []
    } = req.body;
    
    const collection = collections.find(c => c.id === collectionId && c.status === 'active');
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found or inactive' });
    }
    
    if (collection.maxSupply > 0 && collection.currentSupply >= collection.maxSupply) {
      return res.status(400).json({ error: 'Collection max supply reached' });
    }
    
    const nft = {
      id: 'nft-' + Date.now(),
      collectionId,
      ownerId,
      type,
      metadata,
      contentUri,
      price,
      attributes,
      status: 'minted',
      mintedAt: new Date().toISOString(),
      transactionHash: '0x' + Math.random().toString(36).substr(2, 64),
      ubuntu: 'Ubuntu NFT minted'
    };
    
    nfts.push(nft);
    collection.currentSupply += 1;
    
    // Add royalty record
    const royalty = {
      id: 'royalty-' + Date.now(),
      nftId: nft.id,
      creatorId: collection.creatorId,
      percentage: collection.royaltyPercentage,
      createdAt: new Date().toISOString(),
      ubuntu: 'Ubuntu royalty arrangement'
    };
    
    royalties.push(royalty);
    
    console.log(`🪙 NFT Minted: ${type} for ${ownerId} in collection ${collection.name}`);
    
    res.json({ 
      success: true, 
      nft: {
        id: nft.id,
        collectionId,
        type,
        price,
        transactionHash: nft.transactionHash,
        mintedAt: nft.mintedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User NFTs
app.get('/api/users/:userId/nfts', async (req, res) => {
  try {
    const { userId } = req.params;
    const type = req.query.type;
    
    let userNFTs = nfts.filter(n => n.ownerId === userId);
    
    if (type) {
      userNFTs = userNFTs.filter(n => n.type === type);
    }
    
    // Enrich with collection details
    const enrichedNFTs = userNFTs.map(nft => {
      const collection = collections.find(c => c.id === nft.collectionId);
      return {
        ...nft,
        collection: collection ? {
          name: collection.name,
          description: collection.description,
          category: collection.category
        } : null
      };
    });
    
    res.json({ nfts: enrichedNFTs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get NFT Details
app.get('/api/nfts/:nftId', async (req, res) => {
  try {
    const { nftId } = req.params;
    
    const nft = nfts.find(n => n.id === nftId);
    if (!nft) {
      return res.status(404).json({ error: 'NFT not found' });
    }
    
    const collection = collections.find(c => c.id === nft.collectionId);
    const royalty = royalties.find(r => r.nftId === nftId);
    
    res.json({
      nft: {
        id: nft.id,
        collectionId: nft.collectionId,
        ownerId: nft.ownerId,
        type: nft.type,
        metadata: nft.metadata,
        contentUri: nft.contentUri,
        price: nft.price,
        attributes: nft.attributes,
        status: nft.status,
        mintedAt: nft.mintedAt,
        transactionHash: nft.transactionHash,
        ubuntu: nft.ubuntu
      },
      collection: collection ? {
        name: collection.name,
        description: collection.description,
        category: collection.category,
        creatorId: collection.creatorId
      } : null,
      royalty: royalty ? {
        creatorId: royalty.creatorId,
        percentage: royalty.percentage
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer NFT
app.post('/api/nfts/:nftId/transfer', async (req, res) => {
  try {
    const { nftId } = req.params;
    const { fromUserId, toUserId, price = 0 } = req.body;
    
    const nft = nfts.find(n => n.id === nftId && n.ownerId === fromUserId);
    if (!nft) {
      return res.status(404).json({ error: 'NFT not found or not owned by user' });
    }
    
    // Calculate royalty if there's a sale
    const royalty = royalties.find(r => r.nftId === nftId);
    let royaltyAmount = 0;
    
    if (price > 0 && royalty) {
      royaltyAmount = price * (royalty.percentage / 100);
    }
    
    // Update owner
    nft.ownerId = toUserId;
    nft.lastTransferredAt = new Date().toISOString();
    
    // Record transfer
    const transfer = {
      id: 'transfer-' + Date.now(),
      nftId,
      fromUserId,
      toUserId,
      price,
      royaltyAmount,
      timestamp: new Date().toISOString(),
      ubuntu: 'Ubuntu NFT transfer'
    };
    
    console.log(`🤝 NFT Transferred: ${nftId} from ${fromUserId} to ${toUserId}`);
    if (royaltyAmount > 0) {
      console.log(`💰 Royalty Paid: ${royaltyAmount} to ${royalty.creatorId}`);
    }
    
    res.json({ 
      success: true, 
      transfer: {
        id: transfer.id,
        nftId,
        fromUserId,
        toUserId,
        price,
        royaltyAmount,
        timestamp: transfer.timestamp
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get NFT Market Stats
app.get('/api/stats/market', async (req, res) => {
  try {
    const totalNFTs = nfts.length;
    const totalCollections = collections.length;
    const totalVolume = nfts.reduce((sum, n) => sum + n.price, 0);
    
    const nftsByType = {};
    Object.values(NFTTypes).forEach(type => {
      nftsByType[type] = nfts.filter(n => n.type === type).length;
    });
    
    const collectionsByCategory = {};
    collections.forEach(collection => {
      if (!collectionsByCategory[collection.category]) {
        collectionsByCategory[collection.category] = 0;
      }
      collectionsByCategory[collection.category] += 1;
    });
    
    res.json({
      totalNFTs,
      totalCollections,
      totalVolume,
      nftsByType,
      collectionsByCategory,
      ubuntu: 'Ubuntu NFT market statistics'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mint Certificate NFT (Integration with Education)
app.post('/api/nfts/certificate', async (req, res) => {
  try {
    const { 
      studentId, 
      courseId, 
      courseName, 
      instructorId, 
      score, 
      completionDate,
      certificateId,
      metadataUri
    } = req.body;
    
    // Create or find certificate collection
    let certificateCollection = collections.find(c => c.category === 'certificate' && c.creatorId === instructorId);
    
    if (!certificateCollection) {
      certificateCollection = {
        id: 'collection-certificate-' + instructorId,
        name: `${instructorId}'s Certificates`,
        description: 'Academic achievement certificates',
        creatorId: instructorId,
        category: 'certificate',
        maxSupply: 0, // Unlimited
        price: 0,
        royaltyPercentage: 5,
        currentSupply: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        ubuntu: 'Ubuntu academic certificates'
      };
      collections.push(certificateCollection);
    }
    
    const nft = {
      id: 'cert-' + Date.now(),
      collectionId: certificateCollection.id,
      ownerId: studentId,
      type: NFTTypes.CERTIFICATE,
      metadata: {
        courseName,
        instructorId,
        score,
        completionDate,
        certificateId
      },
      contentUri: metadataUri,
      price: 0,
      attributes: [
        { trait_type: 'Course', value: courseName },
        { trait_type: 'Score', value: score },
        { trait_type: 'Completion Date', value: completionDate },
        { trait_type: 'Certificate ID', value: certificateId }
      ],
      status: 'minted',
      mintedAt: new Date().toISOString(),
      transactionHash: '0x' + Math.random().toString(36).substr(2, 64),
      ubuntu: 'Ubuntu academic achievement'
    };
    
    nfts.push(nft);
    certificateCollection.currentSupply += 1;
    
    console.log(`🎓 Certificate NFT Minted: ${courseName} for ${studentId}`);
    
    res.json({ 
      success: true, 
      certificate: {
        id: nft.id,
        courseName,
        score,
        transactionHash: nft.transactionHash,
        mintedAt: nft.mintedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Default Ubuntu Routes
app.get('/api/status', (req, res) => {
  res.json({
    service: 'azora-nft-minting',
    status: 'operational',
    ubuntu: 'Ubuntu NFT minting service ready'
  });
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  console.error('Ubuntu Service Error:', error);
  res.status(500).json({
    error: 'Ubuntu service error',
    ubuntu: 'We handle errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// Start Ubuntu Service
app.listen(PORT, () => {
  console.log(`🪙 Azora NFT Minting service running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I create because we express together!"');
  console.log(`🎨 Collections: ${collections.length}, NFTs: ${nfts.length}`);
});
