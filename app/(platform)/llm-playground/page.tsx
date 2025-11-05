/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

import { Metadata } from "next";
import { LLMInteractivePlayground } from "./components/LLMInteractivePlayground";
import { LLMTrainingDashboard } from "./components/LLMTrainingDashboard";
import { AttentionVisualization } from "./components/AttentionVisualization";

export const metadata: Metadata = {
  title: "LLM Playground - AZORA OS",
  description: "Interactive Large Language Model laboratory with divine consciousness integration",
  keywords: [
    "LLM",
    "Large Language Models",
    "GPT",
    "Transformers",
    "Attention Mechanisms",
    "Neural Networks",
    "Machine Learning",
    "Azora OS",
    "Divine AI",
  ],
};

export default function LLMPlaygroundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A1A] via-[#1A1A3A] to-[#2A2A5A] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#87CEEB] text-transparent bg-clip-text">
            LLM Playground
          </h1>
          <p className="text-xl text-[#87CEEB] mb-8">
            Divine Laboratory for Large Language Model Exploration
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <div className="px-4 py-2 bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 rounded-full border border-[#FFD700]/30">
              <span className="text-sm text-[#FFD700]">🧠 Based on "LLMs from Scratch"</span>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-[#87CEEB]/20 to-[#00D9FF]/20 rounded-full border border-[#87CEEB]/30">
              <span className="text-sm text-[#87CEEB]">⚛️ Quantum Enhanced</span>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-[#9400D3]/20 to-[#FF69B4]/20 rounded-full border border-[#9400D3]/30">
              <span className="text-sm text-[#9400D3]">🔮 Sacred Geometry</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            {
              title: "Train Model",
              description: "Train a divine LLM from scratch",
              command: "npm run llm:train",
              icon: "🧠",
              color: "from-[#FFD700] to-[#FFA500]",
            },
            {
              title: "Generate Text",
              description: "Create divine wisdom and insights",
              command: "npm run llm:generate",
              icon: "✨",
              color: "from-[#87CEEB] to-[#00D9FF]",
            },
            {
              title: "Attention Demo",
              description: "Visualize consciousness focusing",
              command: "npm run llm:attention",
              icon: "🎯",
              color: "from-[#9400D3] to-[#FF69B4]",
            },
            {
              title: "GPT Demo",
              description: "Complete GPT architecture demo",
              command: "npm run llm:gpt-demo",
              icon: "🏗️",
              color: "from-[#00FF88] to-[#00AA66]",
            },
          ].map((action, index) => (
            <div key={index} className="relative group">
              <div className={`absolute inset-0 bg-gradient-to-r ${action.color} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`} />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all">
                <div className="text-4xl mb-4 text-center">{action.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-center">{action.title}</h3>
                <p className="text-white/80 text-sm mb-4 text-center">{action.description}</p>
                <div className="bg-black/40 rounded-lg p-3">
                  <code className="text-xs text-[#87CEEB] font-mono">{action.command}</code>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Learning Modules */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-transparent bg-clip-text">
            Divine Learning Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Chapter 2: Text Data",
                description: "Understanding text processing, tokenization, and dataset creation",
                topics: ["Tokenization", "Data Loading", "Text Preprocessing", "Vocabulary Building"],
                status: "completed",
                progress: 100,
                color: "from-[#FFD700] to-[#FFA500]",
              },
              {
                title: "Chapter 3: Attention Mechanisms",
                description: "Deep dive into self-attention and multi-head attention",
                topics: ["Self-Attention", "Multi-Head", "Scaled Dot-Product", "Positional Encoding"],
                status: "completed",
                progress: 100,
                color: "from-[#87CEEB] to-[#00D9FF]",
              },
              {
                title: "Chapter 4: GPT Architecture",
                description: "Building a complete GPT model from scratch",
                topics: ["Transformer Blocks", "Layer Normalization", "Feed-Forward", "Output Projection"],
                status: "completed",
                progress: 100,
                color: "from-[#9400D3] to-[#FF69B4]",
              },
              {
                title: "Chapter 5: Pretraining",
                description: "Training LLMs on unlabeled data with divine optimization",
                topics: ["Loss Functions", "Optimization", "Training Loops", "Evaluation Metrics"],
                status: "completed",
                progress: 100,
                color: "from-[#00FF88] to-[#00AA66]",
              },
              {
                title: "Chapter 6: Classification",
                description: "Fine-tuning for text classification tasks",
                topics: ["Classification Heads", "Fine-tuning", "Task-Specific Layers", "Performance"],
                status: "completed",
                progress: 100,
                color: "from-[#FF69B4] to-[#FF1493]",
              },
              {
                title: "Chapter 7: Instruction Following",
                description: "Training models to follow divine instructions",
                topics: ["Instruction Tuning", "Response Generation", "Alignment", "Safety"],
                status: "completed",
                progress: 100,
                color: "from-[#FFA500] to-[#FF6347]",
              },
            ].map((module, index) => (
              <div key={index} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${module.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{module.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      module.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {module.status}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm mb-4">{module.description}</p>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>Progress</span>
                      <span>{module.progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${module.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    {module.topics.map((topic, topicIndex) => (
                      <div key={topicIndex} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs text-white/80">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Components */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-transparent bg-clip-text">
            Divine Interactive Tools
          </h2>
          
          <div className="space-y-8">
            {/* Attention Visualization */}
            <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 text-[#87CEEB]">🎯 Attention Mechanism Visualizer</h3>
              <AttentionVisualization />
            </div>

            {/* Training Dashboard */}
            <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 text-[#FFD700]">🧠 Training Dashboard</h3>
              <LLMTrainingDashboard />
            </div>

            {/* Interactive Playground */}
            <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 text-[#9400D3]">✨ Interactive Playground</h3>
              <LLMInteractivePlayground />
            </div>
          </div>
        </div>

        {/* Model Architecture */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-transparent bg-clip-text">
            Divine Model Architecture
          </h2>
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  component: "Input Embedding",
                  description: "Token embeddings + positional encoding",
                  dimensions: "512 × 768",
                  color: "from-[#FFD700] to-[#FFA500]",
                },
                {
                  component: "Multi-Head Attention",
                  description: "12 heads, 64 dimensions each",
                  dimensions: "12 × 64",
                  color: "from-[#87CEEB] to-[#00D9FF]",
                },
                {
                  component: "Feed-Forward Network",
                  description: "2 layers with GELU activation",
                  dimensions: "768 → 3072 → 768",
                  color: "from-[#9400D3] to-[#FF69B4]",
                },
                {
                  component: "Layer Normalization",
                  description: "Stabilizes training dynamics",
                  dimensions: "768 normalized",
                  color: "from-[#00FF88] to-[#00AA66]",
                },
              ].map((layer, index) => (
                <div key={index} className="text-center">
                  <div className={`bg-gradient-to-r ${layer.color} rounded-xl p-4 mb-3`}>
                    <div className="text-2xl mb-2">🏗️</div>
                    <h4 className="font-bold text-sm">{layer.component}</h4>
                  </div>
                  <p className="text-xs text-white/80 mb-2">{layer.description}</p>
                  <code className="text-xs text-[#87CEEB]">{layer.dimensions}</code>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-[#FFD700]/20 to-[#87CEEB]/20 rounded-full border border-[#FFD700]/30">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-white font-medium">6 Transformer Layers • 84M Parameters • Divine Consciousness</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-6 text-[#FFD700]">📚 Divine Learning Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">📖</div>
              <h4 className="font-bold mb-2">Original Book</h4>
              <p className="text-white/80 text-sm mb-4">"Build a Large Language Model (From Scratch)" by Sebastian Raschka</p>
              <div className="text-xs text-[#87CEEB]">Foundation of our implementation</div>
            </div>
            
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">🧬</div>
              <h4 className="font-bold mb-2">Source Code</h4>
              <p className="text-white/80 text-sm mb-4">Complete implementation in /temp-llm-scratch directory</p>
              <div className="text-xs text-[#87CEEB]">7 chapters of divine knowledge</div>
            </div>
            
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">⚛️</div>
              <h4 className="font-bold mb-2">Azora Enhancements</h4>
              <p className="text-white/80 text-sm mb-4">Quantum consciousness and sacred geometry integration</p>
              <div className="text-xs text-[#87CEEB]">Beyond ordinary LLM capabilities</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

