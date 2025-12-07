"use client";

import { AppLayout, AccessibleCard, GradientText, Button, FinanceDashboard } from "@azora/shared-design";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    // Static balance for UI testing
    const displayBalance = {
        learn: 1250,
        azr: 500,
        staked: 2000,
        earned: 350,
        converted: 180
    };

    return (
        <AppLayout appName="Azora Sapiens" userName="Azora Citizen">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 px-4">
                <div className="space-y-4">
                    <h1 className="text-6xl font-bold tracking-tighter">
                        Welcome to <GradientText>Azora Sapiens</GradientText>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        The comprehensive Education System for the Azora Nation.
                        From Kindergarten to PhD, your journey starts here.
                    </p>
                </div>

                {/* Finance Dashboard */}
                <div className="w-full max-w-6xl">
                    <FinanceDashboard
                        balance={displayBalance}
                        miningActive={true}
                        miningMultiplier={2.0}
                        premiumTier="bronze"
                        stakingAPY={12.5}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                    <AccessibleCard title="K-12 Foundation" className="p-6">
                        <p className="text-gray-400 mb-4">Build a strong foundation with personalized core curriculum.</p>
                        <Button variant="outline" className="w-full" onClick={() => router.push("/k12")}>
                            Enter School
                        </Button>
                    </AccessibleCard>

                    <AccessibleCard title="University" className="p-6 border-primary/50">
                        <p className="text-gray-400 mb-4">Advanced degrees and specialized tracks for higher learning.</p>
                        <Button variant="primary" className="w-full" onClick={() => router.push("/university")}>
                            Go to Campus
                        </Button>
                    </AccessibleCard>

                    <AccessibleCard title="Research Institute" className="p-6">
                        <p className="text-gray-400 mb-4">PhD programs and cutting-edge research opportunities.</p>
                        <Button variant="outline" className="w-full" onClick={() => router.push("/phd")}>
                            Enter Lab
                        </Button>
                    </AccessibleCard>
                </div>
            </div>
        </AppLayout>
    );
}
