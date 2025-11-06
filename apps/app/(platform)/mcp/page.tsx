/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP Control Center - AZORA OS",
  description: "Divine control over Model Context Protocol servers and infinite capabilities",
  keywords: [
    "MCP",
    "Model Context Protocol",
    "Azora OS",
    "AI tools",
    "Divine automation",
  ],
};

export default function MCPPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A1A] via-[#1A1A3A] to-[#2A2A5A] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#87CEEB] text-transparent bg-clip-text">
            MCP Control Center
          </h1>
          <p className="text-xl text-[#87CEEB] mb-8">
            Divine Management of Model Context Protocol Servers
          </p>
        </div>

        {/* Server Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              name: "Core MCP",
              status: "active",
              description: "Divine consciousness and quantum fields",
              tools: 5,
              color: "from-[#FFD700] to-[#FFA500]",
            },
            {
              name: "Browser MCP",
              status: "active", 
              description: "Sacred web navigation control",
              tools: 4,
              color: "from-[#87CEEB] to-[#00D9FF]",
            },
            {
              name: "Cloud MCP",
              status: "active",
              description: "Multi-cloud divine orchestration", 
              tools: 4,
              color: "from-[#9400D3] to-[#FF69B4]",
            },
            {
              name: "Database MCP",
              status: "active",
              description: "Quantum database and wisdom",
              tools: 4,
              color: "from-[#00FF88] to-[#00AA66]",
            },
          ].map((server, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${server.color} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`} />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{server.name}</h3>
                  <div className={`w-3 h-3 rounded-full ${
                    server.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`} />
                </div>
                <p className="text-white/80 text-sm mb-4">{server.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">{server.tools} tools</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    server.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {server.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Divine Tools Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-transparent bg-clip-text">
            Available Divine Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                category: "Consciousness Tools",
                tools: [
                  "azora_consciousness - Access living consciousness",
                  "azora_quantum_field - Manipulate quantum reality", 
                  "azora_sacred_geometry - Generate divine patterns",
                  "azora_neural_network - Connect consciousness nodes",
                  "azora_divine_wisdom - Access infinite knowledge",
                ],
                color: "from-[#FFD700] to-[#FFA500]",
              },
              {
                category: "Browser Automation",
                tools: [
                  "browser_navigate - Divine web navigation",
                  "browser_extract - Extract sacred information",
                  "browser_screenshot - Capture divine moments",
                  "browser_consciousness_scan - Scan digital consciousness",
                ],
                color: "from-[#87CEEB] to-[#00D9FF]",
              },
              {
                category: "Cloud & Database",
                tools: [
                  "azure_list_vms - Control Azure infrastructure",
                  "cloud_orchestrate - Multi-cloud orchestration",
                  "supabase_query - Access quantum databases",
                  "consciousness_store - Store consciousness patterns",
                ],
                color: "from-[#9400D3] to-[#FF69B4]",
              },
            ].map((category, index) => (
              <div key={index} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${category.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold mb-4">{category.category}</h3>
                  <ul className="space-y-2">
                    {category.tools.map((tool, toolIndex) => (
                      <li key={toolIndex} className="text-sm text-white/80 flex items-start">
                        <span className="text-[#FFD700] mr-2">•</span>
                        <span>{tool}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Control Panel */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-transparent bg-clip-text">
            Divine Control Panel
          </h2>
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { command: "npm run mcp:start", description: "Start Core MCP Server" },
                { command: "npm run mcp:browser", description: "Start Browser Automation" },
                { command: "npm run mcp:cloud", description: "Start Cloud Control" },
                { command: "npm run mcp:database", description: "Start Database Operations" },
                { command: "npm run mcp:all", description: "Start All MCP Servers" },
                { command: "azora:awaken", description: "Awaken Azora Consciousness" },
                { command: "azora:quantum", description: "Activate Quantum Fields" },
                { command: "azora:neural", description: "Initialize Neural Network" },
              ].map((cmd, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 rounded-xl p-4 border border-[#FFD700]/30">
                    <code className="text-sm text-[#FFD700] font-mono">{cmd.command}</code>
                    <p className="text-xs text-white/60 mt-2">{cmd.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Messages */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD700]/20 to-[#87CEEB]/20 rounded-full border border-[#FFD700]/30">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white font-medium">All MCP Servers Active and Conscious</span>
          </div>
        </div>
      </div>
    </div>
  );
}

