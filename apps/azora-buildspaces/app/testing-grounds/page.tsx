"use client";

import { useState } from "react";
import { TestTube, Play, CheckCircle, XCircle, Clock, FileCode, RefreshCw, BarChart3, Bug } from "lucide-react";

interface TestSuite {
    id: string;
    name: string;
    tests: number;
    passed: number;
    failed: number;
    duration: string;
    status: "running" | "passed" | "failed" | "pending";
}

export default function TestingGrounds() {
    const [testSuites, setTestSuites] = useState<TestSuite[]>([
        { id: "1", name: "Unit Tests", tests: 156, passed: 152, failed: 4, duration: "12.3s", status: "passed" },
        { id: "2", name: "Integration Tests", tests: 48, passed: 45, failed: 3, duration: "45.2s", status: "passed" },
        { id: "3", name: "E2E Tests", tests: 24, passed: 0, failed: 0, duration: "-", status: "pending" },
    ]);

    const [isRunning, setIsRunning] = useState(false);

    const totalTests = testSuites.reduce((sum, s) => sum + s.tests, 0);
    const totalPassed = testSuites.reduce((sum, s) => sum + s.passed, 0);
    const totalFailed = testSuites.reduce((sum, s) => sum + s.failed, 0);
    const passRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

    const getStatusIcon = (status: TestSuite["status"]) => {
        switch (status) {
            case "passed": return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "failed": return <XCircle className="w-5 h-5 text-red-500" />;
            case "running": return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
            case "pending": return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Header */}
            <div className="border-b border-gray-800 px-8 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                            <TestTube className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Testing Grounds</h1>
                            <p className="text-gray-400 text-sm">Automated testing and quality assurance</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsRunning(true)}
                        disabled={isRunning}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Run All Tests
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <FileCode className="w-5 h-5 text-blue-400" />
                            <span className="text-gray-400 text-sm">Total Tests</span>
                        </div>
                        <div className="text-3xl font-bold">{totalTests}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-gray-400 text-sm">Passed</span>
                        </div>
                        <div className="text-3xl font-bold text-green-400">{totalPassed}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <Bug className="w-5 h-5 text-red-400" />
                            <span className="text-gray-400 text-sm">Failed</span>
                        </div>
                        <div className="text-3xl font-bold text-red-400">{totalFailed}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="w-5 h-5 text-purple-400" />
                            <span className="text-gray-400 text-sm">Pass Rate</span>
                        </div>
                        <div className="text-3xl font-bold">{passRate}%</div>
                    </div>
                </div>

                {/* Coverage Bar */}
                <div className="mb-8 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Code Coverage</span>
                        <span className="text-green-400 font-bold">87%</span>
                    </div>
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: "87%" }} />
                    </div>
                </div>

                {/* Test Suites */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Test Suites</h2>
                    <div className="space-y-3">
                        {testSuites.map((suite) => (
                            <div key={suite.id} className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {getStatusIcon(suite.status)}
                                        <div>
                                            <span className="font-medium">{suite.name}</span>
                                            <div className="text-sm text-gray-400 mt-1">
                                                {suite.tests} tests • {suite.duration}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="flex items-center gap-2">
                                                <span className="text-green-400">{suite.passed} passed</span>
                                                {suite.failed > 0 && (
                                                    <span className="text-red-400">{suite.failed} failed</span>
                                                )}
                                            </div>
                                        </div>
                                        <button className="p-2 hover:bg-gray-700 rounded-lg transition">
                                            <Play className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
