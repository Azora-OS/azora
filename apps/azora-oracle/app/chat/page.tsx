'use client';

import { AppLayout, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AIFamilyChat from '@azora/shared-design/components/AIFamilyChat';

export default function ChatPage() {
    const router = useRouter();

    const handleSendMessage = async (message: string, agentId: string) => {
        // TODO: Connect to AI service
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `Oracle: I've analyzed your question about "${message}". Based on current market data and business metrics, I recommend focusing on customer retention strategies. Would you like me to create a detailed action plan?`;
    };

    return (
        <AppLayout appName="Azora Oracle" userName="Business Leader">
            <div className="max-w-7xl mx-auto py-8 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-6"
                >
                    <div>
                        <h1 className="text-4xl font-bold mb-2">
                            <GradientText>AI Chat</GradientText>
                        </h1>
                        <p className="text-gray-400">Ask Oracle anything about your business</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push('/')}>
                        Back to Dashboard
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="h-[calc(100vh-250px)] bg-card/30 rounded-xl border border-border overflow-hidden"
                >
                    <AIFamilyChat
                        defaultAgent="jabari"
                        availableAgents={['jabari', 'elara', 'nia']}
                        onSendMessage={handleSendMessage}
                    />
                </motion.div>
            </div>
        </AppLayout>
    );
}
