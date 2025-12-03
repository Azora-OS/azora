'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    AppLayout, AccessibleCard, GradientText, Button 
} from '../../components';
import {
    Search, Filter, Star, Download, Heart, Share2, Shield,
    Users, Globe, Award, TrendingUp, Clock, CheckCircle,
    AlertCircle, ShoppingCart, Gem, Coins, Zap, Leaf,
    HandHeart, Balance, ArrowUpRight, ArrowDownRight,
    Eye, MessageSquare, ThumbsUp, ThumbsDown, Flag,
    ExternalLink, Copy, Bookmark, Settings, BarChart3,
    TreePine, Sun, Wind, Droplets, Recycle
} from 'lucide-react';

// Enhanced marketplace types
interface MarketplaceItem {
    id: string;
    name: string;
    author: string;
    authorId: string;
    price: string;
    priceType: 'free' | 'azr' | 'usd' | 'barter';
    downloads: number;
    rating: number;
    reviews: number;
    category: string;
    tags: string[];
    description: string;
    features: string[];
    fairTrade?: {
        certified: boolean;
        ethicalScore: number;
        sustainabilityRating: number;
        communityImpact: number;
        revenueShare: number;
        carbonOffset: boolean;
        openSource: boolean;
        ubuntuAligned: boolean;
    };
    version: string;
    lastUpdated: Date;
    license: string;
    dependencies?: string[];
    compatibility: string[];
    support: 'community' | 'premium' | 'enterprise';
    documentation: string;
    demoUrl?: string;
    githubUrl?: string;
}

interface FairTradeMetrics {
    totalRevenueShared: number;
    communityProjects: number;
    carbonOffset: number;
    ethicalScore: number;
    sustainabilityRating: number;
    ubuntuCertifications: number;
}

export default function MarketplacePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('trending');
    const [showFilters, setShowFilters] = useState(false);
    const [fairTradeOnly, setFairTradeOnly] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [favorites, setFavorites] = useState<string[]>([]);
    const [cart, setCart] = useState<string[]>([]);
    const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);

    // Enhanced marketplace data with fair trade integration
    const [items] = useState<MarketplaceItem[]>([
        {
            id: '1',
            name: 'Ubuntu Auth Module',
            author: 'Azora Core',
            authorId: 'azora-core',
            price: 'Free',
            priceType: 'free',
            downloads: 12543,
            rating: 4.9,
            reviews: 234,
            category: 'Authentication',
            tags: ['security', 'oauth', 'blockchain'],
            description: 'Decentralized authentication system with Ubuntu principles',
            features: ['Multi-chain support', 'Zero-knowledge proofs', 'Social recovery'],
            fairTrade: {
                certified: true,
                ethicalScore: 95,
                sustainabilityRating: 88,
                communityImpact: 92,
                revenueShare: 15,
                carbonOffset: true,
                openSource: true,
                ubuntuAligned: true
            },
            version: '2.1.0',
            lastUpdated: new Date(),
            license: 'MIT',
            compatibility: ['React', 'Vue', 'Angular'],
            support: 'community',
            documentation: 'https://docs.azora.dev/auth',
            githubUrl: 'https://github.com/azora/auth'
        },
        {
            id: '2',
            name: 'NFT Gallery Pro',
            author: 'PixelArt DAO',
            authorId: 'pixelart-dao',
            price: '50 AZR',
            priceType: 'azr',
            downloads: 3421,
            rating: 4.7,
            reviews: 89,
            category: 'NFT',
            tags: ['nft', 'gallery', 'marketplace'],
            description: 'Beautiful NFT gallery with fair artist compensation',
            features: ['Multi-chain support', 'Artist royalties', 'Carbon offsetting'],
            fairTrade: {
                certified: true,
                ethicalScore: 92,
                sustainabilityRating: 95,
                communityImpact: 88,
                revenueShare: 25,
                carbonOffset: true,
                openSource: false,
                ubuntuAligned: true
            },
            version: '1.5.2',
            lastUpdated: new Date(Date.now() - 86400000),
            license: 'Commercial',
            compatibility: ['React', 'Next.js'],
            support: 'premium',
            documentation: 'https://docs.pixelart.dev',
            demoUrl: 'https://demo.pixelart.dev'
        },
        {
            id: '3',
            name: 'DeFi Swap Widget',
            author: 'DeFi Builders Coop',
            authorId: 'defi-builders',
            price: '120 AZR',
            priceType: 'azr',
            downloads: 1234,
            rating: 4.8,
            reviews: 156,
            category: 'DeFi',
            tags: ['defi', 'swap', 'dex'],
            description: 'Decentralized exchange widget with fair fee distribution',
            features: ['Multi-DEX aggregation', 'Best routing', 'Fee sharing'],
            fairTrade: {
                certified: true,
                ethicalScore: 89,
                sustainabilityRating: 76,
                communityImpact: 94,
                revenueShare: 30,
                carbonOffset: false,
                openSource: true,
                ubuntuAligned: true
            },
            version: '3.0.1',
            lastUpdated: new Date(Date.now() - 172800000),
            license: 'GPL-3.0',
            compatibility: ['React', 'Vue'],
            support: 'premium',
            documentation: 'https://docs.defibuilders.dev'
        },
        {
            id: '4',
            name: 'Ubuntu Voting System',
            author: 'GovTech Collective',
            authorId: 'govtech-collective',
            price: 'Free',
            priceType: 'free',
            downloads: 5678,
            rating: 4.5,
            reviews: 78,
            category: 'Governance',
            tags: ['voting', 'dao', 'governance'],
            description: 'Democratic voting system with Ubuntu consensus principles',
            features: ['Quadratic voting', 'Delegation', 'Dispute resolution'],
            fairTrade: {
                certified: true,
                ethicalScore: 98,
                sustainabilityRating: 92,
                communityImpact: 96,
                revenueShare: 20,
                carbonOffset: true,
                openSource: true,
                ubuntuAligned: true
            },
            version: '1.2.0',
            lastUpdated: new Date(Date.now() - 259200000),
            license: 'MIT',
            compatibility: ['React', 'Angular', 'Svelte'],
            support: 'community',
            documentation: 'https://docs.govtech.dev'
        }
    ]);

    const categories = [
        'All', 'Authentication', 'NFT', 'DeFi', 'Governance', 
        'UI Components', 'Smart Contracts', 'Utilities', 'Templates'
    ];

    const sortOptions = [
        { value: 'trending', label: 'Trending', icon: TrendingUp },
        { value: 'rating', label: 'Top Rated', icon: Star },
        { value: 'downloads', label: 'Most Downloaded', icon: Download },
        { value: 'price-low', label: 'Price: Low to High', icon: ArrowUpRight },
        { value: 'price-high', label: 'Price: High to Low', icon: ArrowDownRight },
        { value: 'ethical', label: 'Ethical Score', icon: Shield }
    ];

    const ubuntuCertifiedItems = items.filter(
        item => item.fairTrade?.certified && item.fairTrade.ubuntuAligned
    );

    const fairTradeMetrics: FairTradeMetrics = {
        totalRevenueShared: 0,
        communityProjects: 0,
        carbonOffset: 0,
        ethicalScore: ubuntuCertifiedItems.length
            ? ubuntuCertifiedItems.reduce((sum, item) => sum + (item.fairTrade?.ethicalScore || 0), 0) / ubuntuCertifiedItems.length
            : 0,
        sustainabilityRating: ubuntuCertifiedItems.length
            ? ubuntuCertifiedItems.reduce((sum, item) => sum + (item.fairTrade?.sustainabilityRating || 0), 0) / ubuntuCertifiedItems.length
            : 0,
        ubuntuCertifications: ubuntuCertifiedItems.length
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        
        const matchesFairTrade = !fairTradeOnly || (item.fairTrade?.certified && item.fairTrade.ubuntuAligned);
        
        const matchesPrice = item.priceType === 'free' || 
                           (item.priceType === 'azr' && parseInt(item.price) >= priceRange.min && parseInt(item.price) <= priceRange.max);
        
        return matchesSearch && matchesCategory && matchesFairTrade && matchesPrice;
    });

    const sortedItems = [...filteredItems].sort((a, b) => {
        switch (sortBy) {
            case 'rating':
                return b.rating - a.rating;
            case 'downloads':
                return b.downloads - a.downloads;
            case 'price-low':
                return (a.priceType === 'free' ? 0 : parseInt(a.price)) - (b.priceType === 'free' ? 0 : parseInt(b.price));
            case 'price-high':
                return (b.priceType === 'free' ? 0 : parseInt(b.price)) - (a.priceType === 'free' ? 0 : parseInt(a.price));
            case 'ethical':
                return (b.fairTrade?.ethicalScore || 0) - (a.fairTrade?.ethicalScore || 0);
            default:
                return 0;
        }
    });

    const toggleFavorite = (itemId: string) => {
        setFavorites(prev => 
            prev.includes(itemId) 
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const addToCart = (itemId: string) => {
        setCart(prev => 
            prev.includes(itemId) 
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button size="sm" className="relative">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Cart
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {cart.length}
                            </span>
                        )}
                    </Button>
                    <Button variant="outline" size="sm">
                        <Bookmark className="w-4 h-4 mr-2" />
                        My Library
                    </Button>
                    <Button variant="primary" size="sm">
                        <HandHeart className="w-4 h-4 mr-2" />
                        Publish
                    </Button>
                </div>
            }
        >
            <div className="max-w-7xl mx-auto py-8">
                {/* Ubuntu Fair Trade Banner */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="mb-8"
                >
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold mb-2">
                                    <GradientText colors="from-white to-green-200">Ubuntu Marketplace</GradientText>
                                </h1>
                                <p className="text-green-100 mb-4">Fair trade components built on Ubuntu principles</p>
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        <span>{fairTradeMetrics.ubuntuCertifications} Ubuntu Certified</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <HandHeart className="w-4 h-4" />
                                        <span>
                                            {fairTradeMetrics.totalRevenueShared > 0
                                                ? `${(fairTradeMetrics.totalRevenueShared / 1000000).toFixed(1)}M Revenue Shared`
                                                : 'Connect Ubuntu Tokenomics to see revenue impact'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Leaf className="w-4 h-4" />
                                        <span>
                                            {fairTradeMetrics.carbonOffset > 0
                                                ? `${(fairTradeMetrics.carbonOffset / 1000).toFixed(0)}T CO2 Offset`
                                                : 'Connect Ubuntu Tokenomics to see CO2 impact'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden lg:block">
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                    <div className="text-center mb-2">
                                        <div className="text-3xl font-bold">{fairTradeMetrics.ethicalScore.toFixed(1)}</div>
                                        <div className="text-xs text-green-100">Avg Ethical Score</div>
                                    </div>
                                    <div className="flex gap-1 justify-center">
                                        {[1,2,3,4,5].map(i => (
                                            <div key={i} className={`w-2 h-2 rounded-full ${i <= Math.floor(fairTradeMetrics.ethicalScore / 20) ? 'bg-white' : 'bg-white/30'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Search and Filters */}
                <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
                    <div className="flex flex-col lg:flex-row gap-4 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Ubuntu components..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                                {showFilters && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                            </Button>
                            <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700">
                                {sortOptions.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setSortBy(option.value)}
                                        className={`px-3 py-2 text-sm transition-colors ${
                                            sortBy === option.value 
                                                ? 'bg-green-600 text-white' 
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        <option.icon className="w-4 h-4 inline mr-1" />
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="border-t border-gray-700 pt-4 space-y-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Categories</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                                    selectedCategory === cat
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-gray-800 text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Price Range (AZR)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                                            className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 1000 }))}
                                            className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={fairTradeOnly}
                                            onChange={(e) => setFairTradeOnly(e.target.checked)}
                                            className="rounded bg-gray-800 border-gray-700 text-green-600 focus:ring-green-600"
                                        />
                                        <Shield className="w-4 h-4" />
                                        Ubuntu Certified Only
                                    </label>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="text-gray-400">
                        Showing {sortedItems.length} of {items.length} components
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>Updated 2 min ago</span>
                    </div>
                </div>

                {/* Component Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <AccessibleCard className="bg-gray-900 border border-gray-800 hover:border-green-500 transition-all h-full flex flex-col group">
                                {/* Fair Trade Badge */}
                                {item.fairTrade?.certified && (
                                    <div className="absolute top-3 left-3 z-10">
                                        <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                            <Shield className="w-3 h-3" />
                                            Ubuntu Certified
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => toggleFavorite(item.id)}
                                            className="p-1.5 bg-gray-800 rounded text-gray-400 hover:text-red-400 transition-colors"
                                        >
                                            <Heart className={`w-3 h-3 ${favorites.includes(item.id) ? 'fill-red-400 text-red-400' : ''}`} />
                                        </button>
                                        <button className="p-1.5 bg-gray-800 rounded text-gray-400 hover:text-white transition-colors">
                                            <Share2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="w-full h-32 bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-lg mb-4 flex items-center justify-center text-4xl border border-gray-700">
                                    🌱
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-1 text-white group-hover:text-green-400 transition-colors">
                                        {item.name}
                                    </h3>
                                    <p className="text-sm text-gray-400 mb-2">by {item.author}</p>
                                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                                        {item.description}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {item.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">
                                                {tag}
                                            </span>
                                        ))}
                                        {item.tags.length > 3 && (
                                            <span className="text-xs text-gray-500">+{item.tags.length - 3}</span>
                                        )}
                                    </div>

                                    {/* Fair Trade Metrics */}
                                    {item.fairTrade && (
                                        <div className="mb-3 space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-400">Ethical Score</span>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-16 bg-gray-700 rounded-full h-1.5">
                                                        <div 
                                                            className="bg-green-500 h-1.5 rounded-full"
                                                            style={{ width: `${item.fairTrade.ethicalScore}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-green-400">{item.fairTrade.ethicalScore}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-400">Revenue Share</span>
                                                <span className="text-green-400">{item.fairTrade.revenueShare}%</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-sm mb-4">
                                        <div className="flex items-center gap-3 text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-400" />
                                                {item.rating}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Download className="w-3 h-3" />
                                                {(item.downloads / 1000).toFixed(1)}k
                                            </span>
                                        </div>
                                        {item.fairTrade?.carbonOffset && (
                                            <Leaf className="w-4 h-4 text-green-400" title="Carbon Offset" />
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold ${
                                            item.priceType === 'free' ? 'text-green-500' : 'text-white'
                                        }`}>
                                            {item.price === 'Free' ? 'Free' : `${item.price} AZR`}
                                        </span>
                                        {item.fairTrade?.openSource && (
                                            <div className="bg-blue-600/20 text-blue-400 text-xs px-1.5 py-0.5 rounded">
                                                OSS
                                            </div>
                                        )}
                                    </div>
                                    <Button 
                                        size="sm"
                                        onClick={() => addToCart(item.id)}
                                        className={cart.includes(item.id) ? 'bg-green-600' : ''}
                                    >
                                        {cart.includes(item.id) ? 'In Cart' : 'Get'}
                                    </Button>
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>

                {/* Ubuntu Philosophy Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12"
                >
                    <AccessibleCard className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-800 p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
                                    <HandHeart className="w-6 h-6 text-green-400" />
                                    Ubuntu Philosophy
                                </h3>
                                <p className="text-gray-300 mb-6">
                                    "I am because we are." Every component in this marketplace embodies the Ubuntu spirit of 
                                    sharing, collaboration, and mutual prosperity. When you contribute, you elevate the entire ecosystem.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                                            <Users className="w-4 h-4 text-green-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">Community First</div>
                                            <div className="text-sm text-gray-400">Revenue sharing with contributors</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                                            <Shield className="w-4 h-4 text-green-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">Ethical Sourcing</div>
                                            <div className="text-sm text-gray-400">Fair trade certified components</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                                            <Leaf className="w-4 h-4 text-green-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">Sustainable Development</div>
                                            <div className="text-sm text-gray-400">Carbon offset and eco-friendly practices</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold mb-4 text-white">Impact Metrics</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-800 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-green-400 mb-1">
                                            {fairTradeMetrics.totalRevenueShared > 0
                                                ? `$${fairTradeMetrics.totalRevenueShared.toLocaleString()}`
                                                : 'Not yet connected'}
                                        </div>
                                        <div className="text-sm text-gray-400">Revenue Shared</div>
                                    </div>
                                    <div className="bg-gray-800 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-blue-400 mb-1">
                                            {fairTradeMetrics.communityProjects}
                                        </div>
                                        <div className="text-sm text-gray-400">Community Projects</div>
                                    </div>
                                    <div className="bg-gray-800 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-emerald-400 mb-1">
                                            {fairTradeMetrics.carbonOffset > 0
                                                ? `${(fairTradeMetrics.carbonOffset / 1000).toFixed(0)}T`
                                                : 'Not yet connected'}
                                        </div>
                                        <div className="text-sm text-gray-400">CO2 Offset</div>
                                    </div>
                                    <div className="bg-gray-800 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-purple-400 mb-1">
                                            {fairTradeMetrics.ubuntuCertifications}
                                        </div>
                                        <div className="text-sm text-gray-400">Ubuntu Certified</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AccessibleCard>
                </motion.div>
            </div>
        </AppLayout>
    );
}
