import React, { useState } from 'react';
import { PremiumCard } from './PremiumCard';
import { motion } from 'framer-motion';
import { Search, Star, Clock, Video, TrendingUp, Sparkles } from 'lucide-react';

interface CourseCatalogProps {
    onCourseSelect: (courseId: string) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({ onCourseSelect }) => {
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Technology & AI', 'Business & Finance', 'Creative Arts', 'Leadership'];

    const trendingCourses = [
        {
            id: 'algo-trading',
            title: 'Algorithmic Trading with Python',
            description: 'Build your own trading bot using Python and machine learning. Learn market structures and backtesting.',
            rating: 4.9,
            lessons: 12,
            duration: '6h 30m',
            reward: 500,
            category: 'Finance',
            image: 'https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&w=800&q=80',
            color: 'text-purple-400',
            tagColor: 'bg-purple-600'
        },
        {
            id: 'saas-mastery',
            title: 'SaaS Startup Mastery',
            description: 'From idea to first paying customer. Learn how to validate, build, and launch a software business.',
            rating: 4.8,
            lessons: 18,
            duration: '8h 15m',
            reward: 800,
            category: 'Business',
            image: 'https://images.unsplash.com/photo-1664575602554-2087b04935a5?auto=format&fit=crop&w=800&q=80',
            color: 'text-blue-400',
            tagColor: 'bg-blue-600'
        },
        {
            id: 'gen-ai-art',
            title: 'Generative AI for Creatives',
            description: 'Master Midjourney, Stable Diffusion, and DALL-E to create stunning assets for your projects.',
            rating: 5.0,
            lessons: 8,
            duration: '4h 20m',
            reward: 300,
            category: 'AI Art',
            image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
            color: 'text-pink-400',
            tagColor: 'bg-pink-600'
        }
    ];

    const newArrivals = [
        {
            id: 'defi-101',
            title: 'DeFi Economics 101',
            description: 'Understand decentralized finance.',
            reward: 200,
            image: 'https://images.unsplash.com/photo-1526304640152-d4619684e484?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'data-science',
            title: 'Data Science for Biz',
            description: 'Analyze trends like a pro.',
            reward: 400,
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'digital-marketing',
            title: 'Digital Marketing',
            description: 'Grow your audience fast.',
            reward: 250,
            image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'product-mgmt',
            title: 'Product Management',
            description: 'Lead product teams.',
            reward: 350,
            image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80'
        }
    ];

    return (
        <div className="pb-20 space-y-12">
            {/* Hero Section */}
            <div className="relative py-8 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-white/5">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -z-10" />
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                        Master the Skills of a <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Modern CEO</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl">
                        AI-driven courses designed to help you build, launch, and scale real businesses.
                    </p>

                    {/* Categories */}
                    <div className="flex gap-3 mt-8 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat
                                        ? 'bg-purple-600 text-white border-purple-600'
                                        : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trending Section */}
            <section className="px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                    <TrendingUp className="text-yellow-400" /> Trending Now
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trendingCourses.map((course, index) => (
                        <PremiumCard
                            key={course.id}
                            delay={index * 0.1}
                            onClick={() => onCourseSelect(course.id)}
                            className="group"
                        >
                            <div className="h-48 bg-gray-800 relative overflow-hidden">
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-yellow-400 flex items-center gap-1">
                                    <Star size={12} fill="currentColor" /> {course.rating}
                                </div>
                                <div className={`absolute bottom-3 left-3 ${course.tagColor} px-2 py-1 rounded text-xs font-bold text-white`}>
                                    {course.category}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className={`text-xl font-bold mb-2 group-hover:${course.color} transition-colors text-white`}>
                                    {course.title}
                                </h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                    {course.description}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1"><Video size={14} /> {course.lessons} Lessons</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> {course.duration}</span>
                                    </div>
                                    <div className="text-green-400 font-bold">Earn {course.reward} AZR</div>
                                </div>
                            </div>
                        </PremiumCard>
                    ))}
                </div>
            </section>

            {/* New Arrivals Section */}
            <section className="px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                    <Sparkles className="text-purple-400" /> New Arrivals
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {newArrivals.map((course, index) => (
                        <PremiumCard
                            key={course.id}
                            delay={0.3 + (index * 0.1)}
                            onClick={() => onCourseSelect(course.id)}
                            className="group"
                        >
                            <div className="h-40 bg-gray-800 relative overflow-hidden">
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold mb-1 truncate text-white group-hover:text-purple-400 transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-xs text-gray-400 mb-2">
                                    {course.description}
                                </p>
                                <div className="text-xs text-green-400 font-bold">Earn {course.reward} AZR</div>
                            </div>
                        </PremiumCard>
                    ))}
                </div>
            </section>
        </div>
    );
};
