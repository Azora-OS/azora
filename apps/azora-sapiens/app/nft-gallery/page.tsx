'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { UbuntuServices, useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

export default function NFTGalleryPage() {
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const ubuntuServices = useUbuntuServices();

  useEffect(() => {
    loadNFTData();
  }, []);

  const loadNFTData = async () => {
    try {
      setLoading(true);
      
      // Load user NFTs
      const nfts = await ubuntuServices.nftMinting.getUserNFTs('demo-student-001');
      setUserNFTs(nfts.nfts || []);

      // Load collections
      const collectionsData = await ubuntuServices.nftMinting.getCollections();
      setCollections(collectionsData.collections || []);

    } catch (error) {
      console.error('Error loading NFT data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMintCertificate = async () => {
    try {
      await ubuntuServices.nftMinting.mintNFT(
        'certificate-collection-demo',
        'demo-student-001',
        'certificate',
        {
          courseName: 'Ubuntu Philosophy 101',
          instructor: 'Dr. Ubuntu',
          score: 95,
          completionDate: new Date().toISOString()
        }
      );

      // Refresh NFTs
      await loadNFTData();

    } catch (error) {
      console.error('Error minting certificate:', error);
    }
  };

  if (loading) {
    return (
      <AppLayout appName="Azora Sapiens" userName="Azora Citizen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading Ubuntu NFT Gallery...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout appName="Azora Sapiens" userName="Azora Citizen">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold">
            <GradientText>Ubuntu NFT Gallery</GradientText>
          </h1>
          <p className="text-gray-400 text-lg">
            Your achievements and contributions to the Ubuntu community
          </p>
        </motion.div>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={handleMintCertificate}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Mint New Certificate
          </Button>
        </div>

        {/* NFT Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userNFTs.map((nft, index) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <AccessibleCard className="p-6 h-full">
                <div className="space-y-4">
                  {/* NFT Image Placeholder */}
                  <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <div className="text-4xl">🏆</div>
                  </div>
                  
                  {/* NFT Details */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {nft.metadata?.courseName || 'Ubuntu Achievement'}
                    </h3>
                    <p className="text-gray-400 mb-2">
                      Type: {nft.type}
                    </p>
                    <p className="text-gray-400 mb-2">
                      Score: {nft.metadata?.score || 'N/A'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Minted: {new Date(nft.mintedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Ubuntu Badge */}
                  <div className="flex items-center justify-center p-2 bg-green-900 bg-opacity-50 rounded-lg">
                    <span className="text-green-400 text-sm font-medium">
                      Ubuntu Verified
                    </span>
                  </div>
                </div>
              </AccessibleCard>
            </motion.div>
          ))}

          {/* Empty State */}
          {userNFTs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12"
            >
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="text-xl font-bold text-white mb-2">
                No NFTs Yet
              </h3>
              <p className="text-gray-400 mb-4">
                Complete courses and contribute to the Ubuntu community to earn NFT certificates
              </p>
              <Button onClick={handleMintCertificate}>
                Mint Your First Certificate
              </Button>
            </motion.div>
          )}
        </div>

        {/* Collections */}
        <AccessibleCard title="Ubuntu Collections" className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <div key={collection.id} className="p-4 bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-white mb-2">{collection.name}</h4>
                <p className="text-gray-400 text-sm mb-2">{collection.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Supply: {collection.currentSupply}/{collection.maxSupply || '∞'}</span>
                  <span className="text-green-400">{collection.royaltyPercentage}% Ubuntu</span>
                </div>
              </div>
            ))}
          </div>
        </AccessibleCard>
      </div>
    </AppLayout>
  );
}
