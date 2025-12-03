import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import multer from 'multer';
import sharp from 'sharp';
import { create } from 'ipfs-http-client';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { azrService } from './azr-service';
import { nftService } from './nft-service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

// IPFS client setup
const ipfs = create({ url: process.env.IPFS_URL || 'http://localhost:5001' });

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'), false);
    }
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { 
    error: 'Ubuntu rate limit exceeded', 
    ubuntu: 'Please slow down for creative harmony' 
  }
});
app.use(ubuntuLimiter);

// Storage for digital assets and certificates
const digitalAssets = new Map();
const certificates = new Map();
const collections = new Map();
const mintingQueue = new Map();

// Middleware to get user ID from header
const getUserId = (req: any) => {
  return req.headers['x-user-id'] || req.user?.id || 'user_123456789';
};

// Health Check
app.get('/health', (req, res) => {
  res.json({
    service: 'azora-mint',
    status: 'healthy',
    ubuntu: 'I create because we prosper together',
    timestamp: new Date().toISOString(),
    port: PORT,
    blockchain: process.env.BLOCKCHAIN_RPC_URL ? 'connected' : 'local',
    ipfs: process.env.IPFS_URL ? 'connected' : 'local',
    features: {
      nftMinting: '✅ Active',
      certificates: '✅ Active',
      collections: '✅ Active',
      digitalAssets: '✅ Active',
      ipfsStorage: '✅ Active'
    }
  });
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I can because we can',
    principles: [
      'My creation enriches our collective',
      'My innovation inspires our progress',
      'My art expresses our shared story',
      'My knowledge becomes our legacy'
    ],
    service: 'azora-mint',
    ubuntu: 'Ubuntu creative excellence'
  });
});

// ========== NFT MINTING ENDPOINTS ==========

// POST /api/nft/mint - Mint new NFT
app.post('/api/nft/mint', upload.single('image'), async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      name,
      description,
      attributes = [],
      collectionId,
      royalty = 0,
      supply = 1
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        error: 'Name and description are required',
        ubuntu: 'Ubuntu clarity: Complete information enables proper creation'
      });
    }

    // Process image if provided
    let imageUrl = '';
    let imageHash = '';
    
    if (req.file) {
      // Resize and optimize image
      const optimizedImage = await sharp(req.file.buffer)
        .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Upload to IPFS
      const ipfsResult = await ipfs.add(optimizedImage);
      imageUrl = `ipfs://${ipfsResult.cid}`;
      imageHash = ipfsResult.cid.toString();
    }

    // Create metadata
    const metadata = {
      name,
      description,
      image: imageUrl,
      image_hash: imageHash,
      attributes: Array.isArray(attributes) ? attributes : JSON.parse(attributes || '[]'),
      collection_id: collectionId,
      royalty: parseFloat(royalty) || 0,
      supply: parseInt(supply) || 1,
      created_by: userId,
      created_at: new Date().toISOString(),
      ubuntu_signature: 'Ubuntu creativity in digital form'
    };

    // Upload metadata to IPFS
    const metadataResult = await ipfs.add(JSON.stringify(metadata));
    const metadataUri = `ipfs://${metadataResult.cid}`;

    // Mint NFT on blockchain
    const mintResult = await nftService.mintCertificate(userId, metadataUri);
    
    if (mintResult.receipt) {
      // Create digital asset record
      const asset = {
        id: uuidv4(),
        tokenId: mintResult.tokenId,
        name,
        description,
        imageUrl,
        imageHash,
        metadataUri,
        metadataHash: metadataResult.cid.toString(),
        owner: userId,
        creator: userId,
        collectionId,
        royalty: parseFloat(royalty) || 0,
        supply: parseInt(supply) || 1,
        mintedAt: new Date().toISOString(),
        blockchainTxHash: mintResult.receipt.hash,
        status: 'minted'
      };

      digitalAssets.set(asset.id, asset);

      // Log to blockchain
      await logMintEvent('NFT_MINTED', {
        assetId: asset.id,
        tokenId: mintResult.tokenId,
        userId,
        name,
        transactionHash: mintResult.receipt.hash
      });

      console.log(`🎨 NFT minted: ${asset.id} - ${name} by user ${userId}`);

      res.status(201).json({
        success: true,
        asset,
        transaction: mintResult.receipt,
        ubuntu: 'NFT created with Ubuntu creativity'
      });
    } else {
      throw new Error('Failed to mint NFT');
    }
  } catch (error: any) {
    console.error('Error minting NFT:', error);
    res.status(500).json({
      error: 'Failed to mint NFT',
      ubuntu: 'We handle creation errors with Ubuntu grace'
    });
  }
});

// GET /api/nft/:tokenId - Get NFT details
app.get('/api/nft/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const userId = getUserId(req);

    // Get NFT from blockchain
    const owner = await nftService.getOwner(tokenId);
    const metadataUri = await nftService.getCertificateMetadata(tokenId);

    // Fetch metadata from IPFS if it's an IPFS URI
    let metadata = {};
    if (metadataUri.startsWith('ipfs://')) {
      try {
        const cid = metadataUri.replace('ipfs://', '');
        const chunks = [];
        for await (const chunk of ipfs.cat(cid)) {
          chunks.push(chunk);
        }
        metadata = JSON.parse(Buffer.concat(chunks).toString());
      } catch (error) {
        console.warn('Failed to fetch metadata from IPFS:', error);
      }
    }

    // Find asset in local storage
    const asset = Array.from(digitalAssets.values())
      .find(a => a.tokenId === tokenId);

    res.json({
      tokenId,
      owner,
      metadata,
      asset,
      userCanView: asset?.owner === userId || asset?.creator === userId,
      ubuntu: 'NFT details shared with Ubuntu transparency'
    });
  } catch (error: any) {
    console.error('Error fetching NFT:', error);
    res.status(500).json({
      error: 'Failed to fetch NFT',
      ubuntu: 'We handle retrieval errors with Ubuntu grace'
    });
  }
});

// GET /api/nft/user/:userId - Get user's NFTs
app.get('/api/nft/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = getUserId(req);

    if (userId !== requesterId) {
      return res.status(403).json({
        error: 'Access denied - can only view own NFTs',
        ubuntu: 'Ubuntu respect: Honor creative ownership'
      });
    }

    const userAssets = Array.from(digitalAssets.values())
      .filter(asset => asset.owner === userId || asset.creator === userId)
      .sort((a, b) => new Date(b.mintedAt).getTime() - new Date(a.mintedAt).getTime());

    res.json({
      assets: userAssets,
      ubuntu: 'Your creative collection reflects Ubuntu prosperity'
    });
  } catch (error: any) {
    console.error('Error fetching user NFTs:', error);
    res.status(500).json({
      error: 'Failed to fetch user NFTs',
      ubuntu: 'We handle retrieval errors with Ubuntu grace'
    });
  }
});

// ========== CERTIFICATE ENDPOINTS ==========

// POST /api/certificates/mint - Mint certificate
app.post('/api/certificates/mint', upload.single('document'), async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      recipientName,
      recipientEmail,
      courseName,
      institution,
      issueDate,
      expiryDate,
      grade,
      instructor,
      certificateType = 'completion'
    } = req.body;

    if (!recipientName || !courseName || !institution) {
      return res.status(400).json({
        error: 'Recipient name, course name, and institution are required',
        ubuntu: 'Ubuntu clarity: Complete information enables proper certification'
      });
    }

    // Process document if provided
    let documentUrl = '';
    let documentHash = '';
    
    if (req.file) {
      // Upload document to IPFS
      const ipfsResult = await ipfs.add(req.file.buffer);
      documentUrl = `ipfs://${ipfsResult.cid}`;
      documentHash = ipfsResult.cid.toString();
    }

    // Create certificate metadata
    const metadata = {
      recipient_name: recipientName,
      recipient_email: recipientEmail,
      course_name: courseName,
      institution,
      issue_date: issueDate || new Date().toISOString().split('T')[0],
      expiry_date: expiryDate,
      grade,
      instructor,
      certificate_type: certificateType,
      document_url: documentUrl,
      document_hash: documentHash,
      issued_by: userId,
      issued_at: new Date().toISOString(),
      verification_code: uuidv4().slice(0, 8).toUpperCase(),
      ubuntu_certification: 'Ubuntu knowledge sharing recognized'
    };

    // Upload metadata to IPFS
    const metadataResult = await ipfs.add(JSON.stringify(metadata));
    const metadataUri = `ipfs://${metadataResult.cid}`;

    // Mint certificate NFT
    const mintResult = await nftService.mintCertificate(userId, metadataUri);
    
    if (mintResult.receipt) {
      // Create certificate record
      const certificate = {
        id: uuidv4(),
        tokenId: mintResult.tokenId,
        recipientName,
        recipientEmail,
        courseName,
        institution,
        issueDate: metadata.issue_date,
        expiryDate,
        grade,
        instructor,
        certificateType,
        documentUrl,
        documentHash,
        metadataUri,
        metadataHash: metadataResult.cid.toString(),
        verificationCode: metadata.verification_code,
        issuedBy: userId,
        issuedAt: new Date().toISOString(),
        blockchainTxHash: mintResult.receipt.hash,
        status: 'issued'
      };

      certificates.set(certificate.id, certificate);

      // Log to blockchain
      await logMintEvent('CERTIFICATE_ISSUED', {
        certificateId: certificate.id,
        tokenId: mintResult.tokenId,
        recipientName,
        courseName,
        transactionHash: mintResult.receipt.hash
      });

      console.log(`📜 Certificate issued: ${certificate.id} - ${courseName} to ${recipientName}`);

      res.status(201).json({
        success: true,
        certificate,
        transaction: mintResult.receipt,
        ubuntu: 'Certificate issued with Ubuntu recognition'
      });
    } else {
      throw new Error('Failed to mint certificate');
    }
  } catch (error: any) {
    console.error('Error issuing certificate:', error);
    res.status(500).json({
      error: 'Failed to issue certificate',
      ubuntu: 'We handle certification errors with Ubuntu grace'
    });
  }
});

// GET /api/certificates/verify/:code - Verify certificate
app.get('/api/certificates/verify/:code', async (req, res) => {
  try {
    const { code } = req.params;

    // Find certificate by verification code
    const certificate = Array.from(certificates.values())
      .find(cert => cert.verificationCode === code.toUpperCase());

    if (!certificate) {
      return res.status(404).json({
        error: 'Certificate not found',
        ubuntu: 'Ubuntu guidance: Check verification code'
      });
    }

    // Get NFT details
    const owner = await nftService.getOwner(certificate.tokenId);
    const metadataUri = await nftService.getCertificateMetadata(certificate.tokenId);

    res.json({
      verified: true,
      certificate: {
        recipientName: certificate.recipientName,
        courseName: certificate.courseName,
        institution: certificate.institution,
        issueDate: certificate.issueDate,
        grade: certificate.grade,
        instructor: certificate.instructor,
        verificationCode: certificate.verificationCode
      },
      tokenId: certificate.tokenId,
      owner,
      metadataUri,
      verifiedAt: new Date().toISOString(),
      ubuntu: 'Certificate verified with Ubuntu integrity'
    });
  } catch (error: any) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({
      error: 'Failed to verify certificate',
      ubuntu: 'We handle verification errors with Ubuntu grace'
    });
  }
});

// GET /api/certificates/user/:userId - Get user's certificates
app.get('/api/certificates/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = getUserId(req);

    if (userId !== requesterId) {
      return res.status(403).json({
        error: 'Access denied - can only view own certificates',
        ubuntu: 'Ubuntu respect: Honor educational privacy'
      });
    }

    const userCertificates = Array.from(certificates.values())
      .filter(cert => cert.recipientEmail === requesterId || cert.issuedBy === userId)
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());

    res.json({
      certificates: userCertificates,
      ubuntu: 'Your achievements reflect Ubuntu learning'
    });
  } catch (error: any) {
    console.error('Error fetching user certificates:', error);
    res.status(500).json({
      error: 'Failed to fetch user certificates',
      ubuntu: 'We handle retrieval errors with Ubuntu grace'
    });
  }
});

// ========== COLLECTION ENDPOINTS ==========

// POST /api/collections/create - Create NFT collection
app.post('/api/collections/create', async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      name,
      description,
      category = 'art',
      isPublic = true
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        error: 'Name and description are required',
        ubuntu: 'Ubuntu clarity: Complete information enables proper creation'
      });
    }

    const collection = {
      id: uuidv4(),
      name,
      description,
      category,
      isPublic,
      creator: userId,
      createdAt: new Date().toISOString(),
      assetCount: 0,
      totalVolume: 0,
      ubuntu_collection: 'Ubuntu collective creativity'
    };

    collections.set(collection.id, collection);

    // Log to blockchain
    await logMintEvent('COLLECTION_CREATED', {
      collectionId: collection.id,
      name,
      creator: userId
    });

    console.log(`📁 Collection created: ${collection.id} - ${name} by user ${userId}`);

    res.status(201).json({
      success: true,
      collection,
      ubuntu: 'Collection created with Ubuntu community spirit'
    });
  } catch (error: any) {
    console.error('Error creating collection:', error);
    res.status(500).json({
      error: 'Failed to create collection',
      ubuntu: 'We handle creation errors with Ubuntu grace'
    });
  }
});

// GET /api/collections - Get public collections
app.get('/api/collections', async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;

    let publicCollections = Array.from(collections.values())
      .filter(collection => collection.isPublic);

    if (category) {
      publicCollections = publicCollections.filter(
        collection => collection.category === category
      );
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const paginatedCollections = publicCollections
      .slice(skip, skip + parseInt(limit as string));

    res.json({
      collections: paginatedCollections,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: publicCollections.length,
        pages: Math.ceil(publicCollections.length / parseInt(limit as string))
      },
      ubuntu: 'Collections showcase Ubuntu collective creativity'
    });
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    res.status(500).json({
      error: 'Failed to fetch collections',
      ubuntu: 'We handle retrieval errors with Ubuntu grace'
    });
  }
});

// ========== UTILITY FUNCTIONS ==========

async function logMintEvent(eventType: string, data: any) {
  try {
    // Log to blockchain service for immutable audit trail
    await axios.post('http://localhost:3029/api/blockchain/transaction', {
      from: 'azora-mint',
      to: 'mint-audit',
      amount: 0,
      currency: 'AZR',
      type: 'MintEvent',
      data: { eventType, ...data, ubuntu: 'Ubuntu mint logging' }
    }, { timeout: 5000 });
  } catch (error) {
    console.warn('Blockchain logging failed:', (error as Error).message);
  }
}

// Ubuntu Error Handling
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Ubuntu Mint Service Error:', error);
  res.status(500).json({
    error: 'Ubuntu mint service error',
    ubuntu: 'We handle creation errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Mint endpoint not found',
    ubuntu: 'Ubuntu guidance: Check available mint endpoints',
    availableEndpoints: [
      '/api/nft/mint',
      '/api/nft/:tokenId',
      '/api/nft/user/:userId',
      '/api/certificates/mint',
      '/api/certificates/verify/:code',
      '/api/certificates/user/:userId',
      '/api/collections/create',
      '/api/collections'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🎨 Azora Mint Service running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I create because we prosper together!"');
  console.log(`🗃️ IPFS: ${process.env.IPFS_URL || 'Local'}`);
  console.log(`🔗 Blockchain: ${process.env.BLOCKCHAIN_RPC_URL || 'Local'}`);
  console.log(`🎯 NFT Minting: Active`);
  console.log(`📜 Certificates: Active`);
  console.log(`📁 Collections: Active`);
  console.log(`🖼️ Digital Assets: Active`);
  console.log(`🛡️ Ubuntu: Creative security through community trust`);
});

export default app;
