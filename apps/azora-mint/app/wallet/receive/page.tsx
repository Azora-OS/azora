'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { QrCode, ArrowLeft, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function ReceiveTokensPage() {
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const walletAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";

    const copyAddress = () => {
        navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AppLayout appName="Azora Mint" userName="User">
            <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Button variant="outline" onClick={() => router.push('/wallet')} className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Wallet
                    </Button>
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Receive Tokens</GradientText>
                    </h1>
                    <p className="text-gray-400">Share your wallet address to receive tokens</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <AccessibleCard className="p-8">
                        <div className="text-center space-y-6">
                            <div className="w-64 h-64 mx-auto bg-white rounded-2xl p-4 flex items-center justify-center">
                                <QrCode className="w-full h-full text-gray-900" />
                            </div>

                            <div>
                                <div className="text-gray-400 text-sm mb-2">Your Wallet Address</div>
                                <div className="text-lg font-mono bg-card/50 p-4 rounded-xl break-all">
                                    {walletAddress}
                                </div>
                            </div>

                            <Button variant="primary" onClick={copyAddress} className="w-full">
                                {copied ? (
                                    <>
                                        <Check className="h-5 w-5 mr-2" />
                                        Address Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-5 w-5 mr-2" />
                                        Copy Address
                                    </>
                                )}
                            </Button>

                            <div className="text-sm text-gray-400 text-left space-y-2">
                                <div className="font-bold">Important:</div>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Only send LEARN or AZR tokens to this address</li>
                                    <li>Sending other tokens may result in permanent loss</li>
                                    <li>Always verify the address before sending</li>
                                </ul>
                            </div>
                        </div>
                    </AccessibleCard>
                </motion.div>
            </div>
        </AppLayout>
    );
}
