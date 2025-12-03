'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

export default function CertificatesPage() {
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const ubuntuServices = useUbuntuServices();

    useEffect(() => {
        loadCertificates();
    }, []);

    const loadCertificates = async () => {
        try {
            setLoading(true);
            // Load user NFTs (certificates are minted as NFTs)
            const nfts = await ubuntuServices.nftMinting.getUserNFTs('demo-student-001');

            // Mock certificates for demonstration
            const mockCertificates = [
                {
                    id: '1',
                    title: 'Introduction to Computer Science',
                    issuer: 'Azora Sapiens Academy',
                    issueDate: '2024-05-15',
                    grade: 'A',
                    credentialId: 'AZR-CS101-2024-001',
                    blockchainHash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                    verified: true,
                    icon: '💻'
                },
                {
                    id: '2',
                    title: 'Advanced Mathematics',
                    issuer: 'Azora Sapiens Academy',
                    issueDate: '2024-06-20',
                    grade: 'A-',
                    credentialId: 'AZR-MATH201-2024-002',
                    blockchainHash: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
                    verified: true,
                    icon: '📐'
                },
                {
                    id: '3',
                    title: 'Business Ethics & Ubuntu Philosophy',
                    issuer: 'Azora Sapiens Academy',
                    issueDate: '2024-08-10',
                    grade: 'B+',
                    credentialId: 'AZR-BUS301-2024-003',
                    blockchainHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
                    verified: true,
                    icon: '⚖️'
                }
            ];

            setCertificates(mockCertificates);
        } catch (error) {
            console.error('Error loading certificates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (certificateId: string) => {
        // Publish download event
        await ubuntuServices.events.publishEvent('certificate.downloaded', {
            userId: 'demo-student-001',
            certificateId,
            timestamp: new Date().toISOString()
        }, 'azora-sapiens');

        alert('Certificate download started! (Feature coming soon)');
    };

    const handleShare = async (certificateId: string) => {
        // Publish share event
        await ubuntuServices.events.publishEvent('certificate.shared', {
            userId: 'demo-student-001',
            certificateId,
            timestamp: new Date().toISOString()
        }, 'azora-sapiens');

        alert('Share link copied to clipboard! (Feature coming soon)');
    };

    const handleVerify = (blockchainHash: string) => {
        window.open(`https://polygonscan.com/tx/${blockchainHash}`, '_blank');
    };

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Request Certificate</Button>
                    <Button size="sm">View on Blockchain</Button>
                </div>
            }
        >
            <div className="max-w-6xl mx-auto py-8">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>My Certificates</GradientText>
                    </h1>
                    <p className="text-muted-foreground">
                        Blockchain-verified credentials recognized globally
                    </p>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-primary">{certificates.length}</div>
                        <div className="text-sm text-muted-foreground">Total Certificates</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-green-500">{certificates.filter(c => c.verified).length}</div>
                        <div className="text-sm text-muted-foreground">Blockchain Verified</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-blue-500">
                            {certificates.reduce((sum, c) => {
                                const gradePoints: any = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0 };
                                return sum + (gradePoints[c.grade] || 0);
                            }, 0) / certificates.length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Average GPA</div>
                    </AccessibleCard>
                </div>

                {/* Certificates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.map((cert, index) => (
                        <motion.div
                            key={cert.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <AccessibleCard className="glass-card p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="text-4xl">{cert.icon}</div>
                                        <div>
                                            <h3 className="font-bold text-lg">{cert.title}</h3>
                                            <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                                        </div>
                                    </div>
                                    {cert.verified && (
                                        <div className="flex items-center gap-1 text-green-500 text-sm">
                                            <span>✓</span>
                                            <span>Verified</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Issue Date:</span>
                                        <span className="font-semibold">{new Date(cert.issueDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Grade:</span>
                                        <span className="font-semibold">{cert.grade}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Credential ID:</span>
                                        <span className="font-mono text-xs">{cert.credentialId}</span>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs text-muted-foreground">Blockchain:</span>
                                        <code className="text-xs font-mono bg-card px-2 py-1 rounded">
                                            {cert.blockchainHash.substring(0, 10)}...{cert.blockchainHash.substring(cert.blockchainHash.length - 8)}
                                        </code>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleDownload(cert.id)}
                                        >
                                            📥 Download
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleShare(cert.id)}
                                        >
                                            🔗 Share
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleVerify(cert.blockchainHash)}
                                        >
                                            🔍 Verify
                                        </Button>
                                    </div>
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>

                {/* Ubuntu Philosophy */}
                <AccessibleCard className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                        Your certificates are blockchain-verified and globally recognized. They represent not just your individual achievement,
                        but your contribution to the collective knowledge and prosperity of the Azora community.
                        <span className="italic"> "Ngiyakwazi ngoba sikwazi" - "I can because we can"</span>
                    </p>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
