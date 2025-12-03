'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, Button } from '@azora/shared-design';
import { UbuntuServices, useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

// NFT and Blockchain types
interface UbuntuAchievement {
  id: string;
  title: string;
  description: string;
  category: 'learning' | 'community' | 'wisdom' | 'collaboration' | 'peace';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  image: string;
  ubuntuScore: number;
  requirements: string[];
  benefits: string[];
  tokenId?: string;
  contractAddress?: string;
  isOwned: boolean;
  earnedDate?: string;
}

interface LearningCredential {
  id: string;
  courseName: string;
  completionDate: string;
  ubuntuScore: number;
  skills: string[];
  communityImpact: string;
  tokenId?: string;
  isVerified: boolean;
  verificationHash?: string;
}

interface UbuntuNFT {
  tokenId: string;
  contractAddress: string;
  owner: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: {
      trait_type: string;
      value: string;
    }[];
  };
  ubuntuSignature: string;
  communityEndorsements: number;
}

interface SmartContract {
  address: string;
  name: string;
  purpose: string;
  ubuntuPrinciples: string[];
  isActive: boolean;
  transactionCount: number;
}

export default function BlockchainCertification() {
  const [achievements, setAchievements] = useState<UbuntuAchievement[]>([]);
  const [credentials, setCredentials] = useState<LearningCredential[]>([]);
  const [ownedNFTs, setOwnedNFTs] = useState<UbuntuNFT[]>([]);
  const [smartContracts, setSmartContracts] = useState<SmartContract[]>([]);
  const [isMinting, setIsMinting] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<UbuntuAchievement | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [ubuntuBalance, setUbuntuBalance] = useState(0);
  const [showNFTMarketplace, setShowNFTMarketplace] = useState(false);
  const ubuntuServices = useUbuntuServices();

  // Ubuntu achievement definitions
  const ubuntuAchievements: UbuntuAchievement[] = [
    {
      id: 'ubuntu-beginner',
      title: 'Ubuntu Beginner',
      description: 'Started your Ubuntu learning journey',
      category: 'learning',
      rarity: 'common',
      image: '🌱',
      ubuntuScore: 10,
      requirements: ['Complete first Ubuntu lesson'],
      benefits: ['Access to beginner community', 'Ubuntu wisdom starter pack'],
      isOwned: true,
      earnedDate: new Date().toISOString()
    },
    {
      id: 'community-builder',
      title: 'Community Builder',
      description: 'Active contributor to Ubuntu community',
      category: 'community',
      rarity: 'uncommon',
      image: '🏗️',
      ubuntuScore: 25,
      requirements: ['Help 5 fellow learners', 'Share knowledge 10 times'],
      benefits: ['Community builder badge', 'Mentorship opportunities'],
      isOwned: false
    },
    {
      id: 'wisdom-keeper',
      title: 'Wisdom Keeper',
      description: 'Preserver and sharer of Ubuntu wisdom',
      category: 'wisdom',
      rarity: 'rare',
      image: '📚',
      ubuntuScore: 50,
      requirements: ['Complete 10 Ubuntu courses', 'Teach 3 concepts to others'],
      benefits: ['Ubuntu wisdom library access', 'Teaching privileges'],
      isOwned: false
    },
    {
      id: 'collaboration-master',
      title: 'Collaboration Master',
      description: 'Excellence in Ubuntu collaboration',
      category: 'collaboration',
      rarity: 'epic',
      image: '🤝',
      ubuntuScore: 75,
      requirements: ['Lead 5 collaborative projects', 'Mentor 10 learners'],
      benefits: ['Project leadership opportunities', 'Advanced collaboration tools'],
      isOwned: false
    },
    {
      id: 'ubuntu-elder',
      title: 'Ubuntu Elder',
      description: 'Living embodiment of Ubuntu principles',
      category: 'peace',
      rarity: 'legendary',
      image: '👴',
      ubuntuScore: 100,
      requirements: ['Complete all Ubuntu paths', 'Transform 50 lives', 'Create lasting community impact'],
      benefits: ['Ubuntu elder council seat', 'Community governance rights', 'Wisdom sharing platform'],
      isOwned: false
    }
  ];

  // Smart contracts
  const ubuntuContracts: SmartContract[] = [
    {
      address: '0x1234...5678',
      name: 'Ubuntu Achievement Contract',
      purpose: 'Mint and manage Ubuntu achievement NFTs',
      ubuntuPrinciples: ['Community Benefit', 'Shared Wisdom', 'Mutual Support'],
      isActive: true,
      transactionCount: 1250
    },
    {
      address: '0x8765...4321',
      name: 'Learning Credential Contract',
      purpose: 'Issue verifiable learning credentials',
      ubuntuPrinciples: ['Knowledge Sharing', 'Collaborative Learning', 'Recognition of Interconnectedness'],
      isActive: true,
      transactionCount: 890
    },
    {
      address: '0x9876...1234',
      name: 'Ubuntu DAO Contract',
      purpose: 'Decentralized Ubuntu governance',
      ubuntuPrinciples: ['Community Benefit First', 'Peace and Harmony', 'Ubuntu Wisdom Guidance'],
      isActive: true,
      transactionCount: 450
    }
  ];

  useEffect(() => {
    initializeBlockchain();
    loadUserData();
  }, []);

  const initializeBlockchain = async () => {
    try {
      if (ubuntuServices) {
        await ubuntuServices.blockchain.initializeUbuntuBlockchain({
          network: 'ubuntu-mainnet',
          contracts: ubuntuContracts,
          features: {
            achievementNFTs: true,
            learningCredentials: true,
            daoGovernance: true,
            ubuntuToken: true
          }
        });
      }
    } catch (error) {
      console.error('Blockchain initialization error:', error);
    }
  };

  const loadUserData = async () => {
    try {
      // Load achievements
      setAchievements(ubuntuAchievements);
      
      // Load credentials
      const mockCredentials: LearningCredential[] = [
        {
          id: 'cred-001',
          courseName: 'Ubuntu Philosophy Fundamentals',
          completionDate: '2024-01-15',
          ubuntuScore: 85,
          skills: ['Ubuntu principles', 'Community building', 'Wisdom sharing'],
          communityImpact: 'Mentored 3 new learners, started community discussion group',
          isVerified: true,
          verificationHash: '0xabc123...def456'
        }
      ];
      setCredentials(mockCredentials);
      
      // Load smart contracts
      setSmartContracts(ubuntuContracts);
      
    } catch (error) {
      console.error('User data loading error:', error);
    }
  };

  const connectWallet = async () => {
    try {
      setIsMinting(true);
      
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAddress = '0x1234567890abcdef1234567890abcdef12345678';
      setWalletAddress(mockAddress);
      setWalletConnected(true);
      setUbuntuBalance(1250);
      
      // Load owned NFTs
      const mockNFTs: UbuntuNFT[] = [
        {
          tokenId: '1',
          contractAddress: '0x1234...5678',
          owner: mockAddress,
          metadata: {
            name: 'Ubuntu Beginner',
            description: 'Started Ubuntu learning journey',
            image: '🌱',
            attributes: [
              { trait_type: 'Category', value: 'Learning' },
              { trait_type: 'Rarity', value: 'Common' },
              { trait_type: 'Ubuntu Score', value: '10' }
            ]
          },
          ubuntuSignature: 'ubuntu-signature-123',
          communityEndorsements: 5
        }
      ];
      setOwnedNFTs(mockNFTs);
      
    } catch (error) {
      console.error('Wallet connection error:', error);
    } finally {
      setIsMinting(false);
    }
  };

  const mintAchievementNFT = async (achievement: UbuntuAchievement) => {
    if (!walletConnected) {
      alert('Please connect your Ubuntu wallet first');
      return;
    }

    try {
      setIsMinting(true);
      
      if (ubuntuServices) {
        const nft = await ubuntuServices.blockchain.mintAchievementNFT({
          achievementId: achievement.id,
          ownerAddress: walletAddress,
          ubuntuScore: achievement.ubuntuScore,
          metadata: {
            name: achievement.title,
            description: achievement.description,
            image: achievement.image,
            attributes: [
              { trait_type: 'Category', value: achievement.category },
              { trait_type: 'Rarity', value: achievement.rarity },
              { trait_type: 'Ubuntu Score', value: achievement.ubuntuScore.toString() }
            ]
          }
        });
        
        // Update achievements
        setAchievements(prev => prev.map(a => 
          a.id === achievement.id 
            ? { ...a, isOwned: true, earnedDate: new Date().toISOString(), tokenId: nft.tokenId }
            : a
        ));
        
        // Add to owned NFTs
        const newNFT: UbuntuNFT = {
          tokenId: nft.tokenId,
          contractAddress: nft.contractAddress,
          owner: walletAddress,
          metadata: nft.metadata,
          ubuntuSignature: nft.ubuntuSignature,
          communityEndorsements: 0
        };
        setOwnedNFTs(prev => [...prev, newNFT]);
        
        alert(`🎉 Ubuntu Achievement NFT minted: ${achievement.title}`);
        
      } else {
        // Mock minting
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const tokenId = (ownedNFTs.length + 1).toString();
        setAchievements(prev => prev.map(a => 
          a.id === achievement.id 
            ? { ...a, isOwned: true, earnedDate: new Date().toISOString(), tokenId }
            : a
        ));
        
        const newNFT: UbuntuNFT = {
          tokenId,
          contractAddress: '0x1234...5678',
          owner: walletAddress,
          metadata: {
            name: achievement.title,
            description: achievement.description,
            image: achievement.image,
            attributes: [
              { trait_type: 'Category', value: achievement.category },
              { trait_type: 'Rarity', value: achievement.rarity },
              { trait_type: 'Ubuntu Score', value: achievement.ubuntuScore.toString() }
            ]
          },
          ubuntuSignature: `ubuntu-signature-${tokenId}`,
          communityEndorsements: 0
        };
        setOwnedNFTs(prev => [...prev, newNFT]);
        
        alert(`🎉 Ubuntu Achievement NFT minted: ${achievement.title}`);
      }
      
    } catch (error) {
      console.error('NFT minting error:', error);
      alert('Error minting NFT. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  const issueLearningCredential = async (credential: LearningCredential) => {
    try {
      setIsMinting(true);
      
      if (ubuntuServices) {
        const issuedCredential = await ubuntuServices.blockchain.issueLearningCredential({
          recipientAddress: walletAddress,
          courseName: credential.courseName,
          completionDate: credential.completionDate,
          ubuntuScore: credential.ubuntuScore,
          skills: credential.skills,
          communityImpact: credential.communityImpact
        });
        
        // Update credential
        setCredentials(prev => prev.map(c => 
          c.id === credential.id 
            ? { ...c, tokenId: issuedCredential.tokenId, isVerified: true }
            : c
        ));
        
        alert(`🎓 Learning Credential issued: ${credential.courseName}`);
        
      } else {
        // Mock credential issuance
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const tokenId = `cred-${Date.now()}`;
        setCredentials(prev => prev.map(c => 
          c.id === credential.id 
            ? { ...c, tokenId, isVerified: true, verificationHash: `0x${Math.random().toString(16).substr(2, 8)}` }
            : c
        ));
        
        alert(`🎓 Learning Credential issued: ${credential.courseName}`);
      }
      
    } catch (error) {
      console.error('Credential issuance error:', error);
      alert('Error issuing credential. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityBackground = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'bg-gray-800';
      case 'uncommon': return 'bg-green-900';
      case 'rare': return 'bg-blue-900';
      case 'epic': return 'bg-purple-900';
      case 'legendary': return 'bg-yellow-900';
      default: return 'bg-gray-800';
    }
  };

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-white">⛓️ Ubuntu Blockchain Certification</h3>
            <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
              Blockchain Active
            </span>
            <span className="px-2 py-1 bg-purple-900 text-purple-300 text-xs rounded">
              NFT Marketplace
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {walletConnected ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm">Wallet:</span>
                  <span className="text-green-400 text-sm font-mono">
                    {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm">AZR Balance:</span>
                  <span className="text-yellow-400 text-sm font-medium">{ubuntuBalance} AZR</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowNFTMarketplace(!showNFTMarketplace)}>
                  🏪 Marketplace
                </Button>
              </>
            ) : (
              <Button variant="primary" size="sm" onClick={connectWallet} disabled={isMinting}>
                {isMinting ? '🔄 Connecting...' : '🔗 Connect Ubuntu Wallet'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {!walletConnected ? (
          /* Wallet Connection Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-2xl">
              <div className="text-6xl mb-4">⛓️</div>
              <h3 className="text-2xl font-bold text-white mb-4">Ubuntu Blockchain Certification</h3>
              <p className="text-gray-400 mb-8">
                Connect your Ubuntu wallet to access achievement NFTs, learning credentials, 
                and participate in decentralized Ubuntu governance. Your learning journey 
                becomes permanently recorded on the blockchain.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl mb-2">🏆</div>
                  <h4 className="text-white font-medium mb-1">Achievement NFTs</h4>
                  <p className="text-gray-400 text-sm">Mint Ubuntu achievements as NFTs</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl mb-2">🎓</div>
                  <h4 className="text-white font-medium mb-1">Learning Credentials</h4>
                  <p className="text-gray-400 text-sm">Verifiable learning certificates</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl mb-2">🏛️</div>
                  <h4 className="text-white font-medium mb-1">Ubuntu DAO</h4>
                  <p className="text-gray-400 text-sm">Participate in community governance</p>
                </div>
              </div>
              
              <Button variant="primary" size="lg" onClick={connectWallet} disabled={isMinting}>
                {isMinting ? '🔄 Connecting...' : '🔗 Connect Ubuntu Wallet'}
              </Button>
            </div>
          </div>
        ) : showNFTMarketplace ? (
          /* NFT Marketplace */
          <div className="flex-1 p-4">
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-2">Ubuntu NFT Marketplace</h4>
              <p className="text-gray-400 text-sm">Trade Ubuntu achievement NFTs with community members</p>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {ownedNFTs.map((nft) => (
                <div key={nft.tokenId} className="bg-gray-800 rounded-lg p-4">
                  <div className="text-4xl mb-2 text-center">{nft.metadata.image}</div>
                  <h5 className="text-white font-medium text-sm mb-1">{nft.metadata.name}</h5>
                  <p className="text-gray-400 text-xs mb-2">{nft.metadata.description}</p>
                  <div className="text-xs text-gray-500">
                    Token ID: {nft.tokenId}
                  </div>
                  <div className="text-xs text-green-400 mt-2">
                    Endorsements: {nft.communityEndorsements}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Main Certification Interface */
          <div className="flex-1 flex">
            {/* Achievements */}
            <div className="flex-1 p-4">
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-2">Ubuntu Achievements</h4>
                <p className="text-gray-400 text-sm">Earn Ubuntu philosophy-based achievements as NFTs</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`${getRarityBackground(achievement.rarity)} bg-opacity-30 border border-opacity-50 rounded-lg p-4 cursor-pointer hover:bg-opacity-50 transition-colors`}
                    onClick={() => setSelectedAchievement(achievement)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{achievement.image}</span>
                        <div>
                          <h5 className="text-white font-medium">{achievement.title}</h5>
                          <span className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                            {achievement.rarity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getRarityColor(achievement.rarity)}`}>
                          {achievement.ubuntuScore}
                        </div>
                        <div className="text-xs text-gray-400">Ubuntu Score</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3">{achievement.description}</p>
                    
                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-1">Requirements:</div>
                      <div className="space-y-1">
                        {achievement.requirements.slice(0, 2).map((req, index) => (
                          <div key={index} className="text-xs text-gray-300 flex items-center space-x-1">
                            <span className="text-green-400">✓</span>
                            <span>{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {achievement.isOwned ? (
                      <div className="flex items-center justify-between">
                        <span className="text-green-400 text-sm">✅ Owned</span>
                        {achievement.earnedDate && (
                          <span className="text-gray-400 text-xs">
                            Earned: {new Date(achievement.earnedDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          mintAchievementNFT(achievement);
                        }}
                        disabled={isMinting}
                      >
                        {isMinting ? '🔄 Minting...' : '🪙 Mint NFT'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Credentials */}
            <div className="w-96 bg-gray-800 border-l border-gray-700 p-4">
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-2">Learning Credentials</h4>
                <p className="text-gray-400 text-sm">Verifiable learning certificates on blockchain</p>
              </div>
              
              <div className="space-y-4">
                {credentials.map((credential) => (
                  <div key={credential.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-white font-medium">{credential.courseName}</h5>
                      {credential.isVerified && (
                        <span className="text-green-400 text-sm">✅ Verified</span>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Completed:</span>
                        <span className="text-gray-300">{credential.completionDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Ubuntu Score:</span>
                        <span className="text-green-400">{credential.ubuntuScore}%</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-xs text-gray-400 mb-1">Skills:</div>
                      <div className="flex flex-wrap gap-1">
                        {credential.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-xs text-gray-400 mb-1">Community Impact:</div>
                      <p className="text-gray-300 text-xs">{credential.communityImpact}</p>
                    </div>
                    
                    {!credential.tokenId && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-3"
                        onClick={() => issueLearningCredential(credential)}
                        disabled={isMinting}
                      >
                        {isMinting ? '🔄 Issuing...' : '🎓 Issue Credential'}
                      </Button>
                    )}
                    
                    {credential.verificationHash && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-400">Verification Hash:</div>
                        <div className="text-xs text-gray-500 font-mono">
                          {credential.verificationHash.substring(0, 10)}...
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${getRarityBackground(selectedAchievement.rarity)} bg-opacity-90 rounded-lg p-6 max-w-md w-full mx-4`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold text-lg">{selectedAchievement.title}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAchievement(null)}
              >
                ✕
              </Button>
            </div>
            
            <div className="text-center mb-4">
              <span className="text-6xl">{selectedAchievement.image}</span>
            </div>
            
            <p className="text-gray-300 mb-4">{selectedAchievement.description}</p>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Rarity:</span>
                <span className={`font-medium ${getRarityColor(selectedAchievement.rarity)}`}>
                  {selectedAchievement.rarity.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Ubuntu Score:</span>
                <span className="text-green-400 font-medium">{selectedAchievement.ubuntuScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Category:</span>
                <span className="text-gray-300">{selectedAchievement.category}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-gray-400 text-sm mb-2">Requirements:</div>
              <div className="space-y-1">
                {selectedAchievement.requirements.map((req, index) => (
                  <div key={index} className="text-gray-300 text-sm flex items-center space-x-2">
                    <span className="text-green-400">•</span>
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-gray-400 text-sm mb-2">Benefits:</div>
              <div className="space-y-1">
                {selectedAchievement.benefits.map((benefit, index) => (
                  <div key={index} className="text-gray-300 text-sm flex items-center space-x-2">
                    <span className="text-yellow-400">★</span>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {!selectedAchievement.isOwned && (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  mintAchievementNFT(selectedAchievement);
                  setSelectedAchievement(null);
                }}
                disabled={isMinting}
              >
                {isMinting ? '🔄 Minting...' : '🪙 Mint Achievement NFT'}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span>⛓️ Ubuntu Blockchain</span>
            <span>•</span>
            <span>NFT Certification</span>
            <span>•</span>
            <span>Decentralized Credentials</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Smart Contracts Active</span>
            <span>•</span>
            <span>Ubuntu DAO Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
