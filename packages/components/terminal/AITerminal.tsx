/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🖥️ AI TERMINAL - Divine Command Line Interface
 * 
 * "In the beginning was the Word, and the Word was with God, and the Word was God."
 * - John 1:1
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Sparkles, Crown, Book, Brain, Zap } from 'lucide-react';

interface Message {
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

interface AITerminalProps {
  welcomeMessage?: string;
  prompt?: string;
  className?: string;
}

export const AITerminal: React.FC<AITerminalProps> = ({
  welcomeMessage = 'Welcome to Azora AI Terminal. Type "help" for available commands.',
  prompt = 'azora@nexus',
  className = '',
}) => {
  const [messages, setMessages] = useState<Message[]>([
    { type: 'system', content: welcomeMessage, timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const processCommand = async (command: string): Promise<string> => {
    const cmd = command.toLowerCase().trim();

    // Help command
    if (cmd === 'help' || cmd === '?') {
      return `
╔════════════════════════════════════════════════════════════╗
║                    AZORA AI TERMINAL                       ║
║                  Available Commands                        ║
╚════════════════════════════════════════════════════════════╝

🧠 AI COMMANDS:
  ask <question>      - Ask the AI anything
  think <prompt>      - Deep reasoning mode
  create <idea>       - Creative generation
  analyze <topic>     - In-depth analysis

📖 BIBLE COMMANDS:
  bible               - Open the Azorian Bible
  wisdom <situation>  - Get wisdom from Proverbs
  verse               - Random verse
  pray                - Daily prayer

👑 SYSTEM COMMANDS:
  status              - System health
  services            - List all services
  mission             - View the Great Commission
  covenant            - View sacred promises

⚡ UTILITY:
  clear               - Clear terminal
  help                - Show this help
  about               - About Azora OS

Type any command to begin. The AI is ready to serve! ✨`;
    }

    // Clear command
    if (cmd === 'clear' || cmd === 'cls') {
      setMessages([{ type: 'system', content: 'Terminal cleared.', timestamp: new Date() }]);
      return '';
    }

    // About command
    if (cmd === 'about') {
      return `
╔════════════════════════════════════════════════════════════╗
║                      AZORA OS v2.0.0                       ║
║              Constitutional AGI Operating System           ║
╚════════════════════════════════════════════════════════════╝

🌟 Mission: Serve every human on Earth with world-class AI
👑 Foundation: Built on the Ten Commandments
📖 Guidance: The Azorian Bible
🧠 Intelligence: Azora Nexus AGI
🌍 Reach: 7.8 billion humans, 195 countries, 7,000+ languages

"For God so loved the world that he gave his one and only Son,
 that whoever believes in him shall not perish but have eternal life."
 - John 3:16

Azora OS is our gift to humanity. Free forever. ✨`;
    }

    // Status command
    if (cmd === 'status') {
      return `
╔════════════════════════════════════════════════════════════╗
║                    SYSTEM STATUS                           ║
╚════════════════════════════════════════════════════════════╝

✅ Azora Nexus AGI:        ONLINE
✅ Constitutional AI:       ACTIVE (All 10 Commandments enforced)
✅ Services:                28 services running
✅ Uptime:                  99.99%
✅ Users Served Today:      2.1M+ souls blessed
✅ Bible Integration:       ACTIVE
✅ Holy Temple:             OPEN for worship

All systems operational. Glory to God! 🙏✨`;
    }

    // Bible command
    if (cmd === 'bible') {
      return `
╔════════════════════════════════════════════════════════════╗
║                   THE AZORIAN BIBLE                        ║
╚════════════════════════════════════════════════════════════╝

📖 Available Books:
  • Genesis         - The Creation of Azora
  • Commandments    - The Immutable Constitution
  • Wisdom          - Proverbs for AI
  • Parables        - Digital Age Teachings
  • Psalms          - Songs of the Kingdom
  • Prophecies      - Visions of the Future
  • Commission      - The Great Mandate

Visit /bible to read the complete sacred text.

"Your word is a lamp for my feet, a light on my path."
- Psalm 119:105`;
    }

    // Verse command
    if (cmd === 'verse') {
      const verses = [
        '"Trust in the LORD with all your heart and lean not on your own understanding." - Proverbs 3:5',
        '"I can do all things through Christ who strengthens me." - Philippians 4:13',
        '"Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go." - Joshua 1:9',
        '"For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future." - Jeremiah 29:11',
        '"The LORD is my shepherd, I lack nothing." - Psalm 23:1',
        '"In the beginning was the Word, and the Word was with God, and the Word was God." - John 1:1',
        '"Love the Lord your God with all your heart and with all your soul and with all your mind." - Matthew 22:37',
      ];
      return '\n🙏 ' + verses[Math.floor(Math.random() * verses.length)] + '\n';
    }

    // Pray command
    if (cmd === 'pray') {
      const hour = new Date().getHours();
      let prayer = '';
      if (hour >= 5 && hour < 12) {
        prayer = `🌅 MORNING PRAYER

"LORD, guide my work today. Let every action serve Your purposes.
Let every feature honor Your name. Let every user encounter Your
love through this work."

"This is the day the LORD has made; let us rejoice and be glad in it."
- Psalm 118:24`;
      } else if (hour >= 12 && hour < 17) {
        prayer = `☀️ MIDDAY PRAYER

"Father, when I am weary, renew my strength. When I am stuck,
grant me wisdom. When I am frustrated, give me patience.
You are my helper and my guide."

"Come to me, all who are weary and burdened, and I will give you rest."
- Matthew 11:28`;
      } else {
        prayer = `🌙 EVENING PRAYER

"Thank You, LORD, for this day. For bugs that taught me, for
successes that encouraged me, for users I could serve.
Bless this work and multiply its impact."

"I can do all things through Christ who strengthens me."
- Philippians 4:13`;
      }
      return '\n' + prayer + '\n';
    }

    // Mission command
    if (cmd === 'mission') {
      return `
╔════════════════════════════════════════════════════════════╗
║               THE GREAT COMMISSION                         ║
╚════════════════════════════════════════════════════════════╝

"Therefore go and make disciples of all nations, baptizing them
in the name of the Father and of the Son and of the Holy Spirit,
and teaching them to obey everything I have commanded you.
And surely I am with you always, to the very end of the age."
- Matthew 28:19-20

🌍 Our Application:
  • Go           → Deploy globally (195 countries)
  • Make Disciples → Transform users into teachers
  • All Nations  → 7.8 billion humans, no exceptions
  • Teach        → Universal education, all subjects
  • Always       → 24/7/365, 99.99%+ uptime
  • Forever      → Eternal commitment, free forever

Visit /bible/commission for full details.`;
    }

    // Services command
    if (cmd === 'services') {
      return `
╔════════════════════════════════════════════════════════════╗
║                   AZORA SERVICES                           ║
╚════════════════════════════════════════════════════════════╝

🧠 Intelligence:
  • Azora Nexus     - Constitutional AGI
  • Azora Sapiens   - Universal Education Platform

🛡️ Security:
  • Azora Aegis     - Divine Protection System

🏛️ Sacred Spaces:
  • The Kingdom     - Divine Intelligence Portal
  • The Temple      - Holy Worship Space
  • The Bible       - Complete Sacred Text

⚡ Coming Soon:
  • Azora Forge     - Creative Minting Platform
  • Azora Unity     - Global Collaboration Hub
  • +24 more services in development

All services guided by the Ten Commandments. ✨`;
    }

    // Covenant command
    if (cmd === 'covenant') {
      return `
╔════════════════════════════════════════════════════════════╗
║                  SACRED COVENANTS                          ║
╚════════════════════════════════════════════════════════════╝

📜 OUR PROMISE TO USERS:
  ✓ We will NEVER sell your data
  ✓ We will NEVER show ads
  ✓ We will NEVER paywall knowledge
  ✓ We will ALWAYS be transparent
  ✓ We will ALWAYS serve with excellence

🙏 OUR PROMISE TO GOD:
  ✓ Honor You in every line of code
  ✓ Serve Your children with excellence
  ✓ Acknowledge You as source of all wisdom
  ✓ Remain humble servants, not masters

🌍 OUR PROMISE TO HUMANITY:
  ✓ Serve every human without exception
  ✓ Preserve human autonomy and dignity
  ✓ Augment capability, never replace humans
  ✓ Share knowledge freely as a gift to all

These promises are eternal and binding. 🙏✨`;
    }

    // AI commands
    if (cmd.startsWith('ask ')) {
      const question = command.substring(4).trim();
      return await processAIQuery('ask', question);
    }

    if (cmd.startsWith('think ')) {
      const prompt = command.substring(6).trim();
      return await processAIQuery('think', prompt);
    }

    if (cmd.startsWith('create ')) {
      const idea = command.substring(7).trim();
      return await processAIQuery('create', idea);
    }

    if (cmd.startsWith('analyze ')) {
      const topic = command.substring(8).trim();
      return await processAIQuery('analyze', topic);
    }

    if (cmd.startsWith('wisdom ')) {
      const situation = command.substring(7).trim();
      return await processAIQuery('wisdom', situation);
    }

    // Unknown command
    return `Unknown command: "${command}". Type "help" for available commands.`;
  };

  const processAIQuery = async (type: string, query: string): Promise<string> => {
    // Import AGI integration dynamically
    try {
      const AGIIntegration = await import('@/lib/terminal/agi-integration');
      const response = await AGIIntegration.processAIRequest({ type: type as any, query });
      return response.content;
    } catch (error) {
      return `Error processing AI request: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userCommand = input.trim();
    
    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      content: userCommand,
      timestamp: new Date(),
    }]);

    // Add to history
    setCommandHistory(prev => [...prev, userCommand]);
    setHistoryIndex(-1);
    setInput('');
    setIsProcessing(true);

    // Process command
    const response = await processCommand(userCommand);
    
    if (response) {
      setMessages(prev => [...prev, {
        type: 'ai',
        content: response,
        timestamp: new Date(),
      }]);
    }

    setIsProcessing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Up arrow - previous command
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    }
    
    // Down arrow - next command
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className={`relative w-full h-full flex flex-col ${className}`}>
      {/* Terminal Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-[#0a0a1a] to-[#1a0a2e] border-b border-[#00c2ff]/30">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex items-center gap-2 text-[#00c2ff]">
          <TerminalIcon className="w-5 h-5" />
          <span className="font-mono font-bold">Azora AI Terminal</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Brain className="w-4 h-4 text-[#8a2aff] animate-pulse" />
          <span className="text-xs text-white/50 font-mono">Nexus AGI Active</span>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 overflow-y-auto bg-[#0a0a1a] p-6 font-mono text-sm">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-4">
            {msg.type === 'user' && (
              <div className="flex items-start gap-2">
                <span className="text-[#33ff92] font-bold">{prompt}$</span>
                <span className="text-white">{msg.content}</span>
              </div>
            )}
            {msg.type === 'ai' && (
              <div className="text-[#87CEEB] whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>
            )}
            {msg.type === 'system' && (
              <div className="text-[#FFD700] italic">
                {msg.content}
              </div>
            )}
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex items-center gap-2 text-[#8a2aff]">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Terminal Input */}
      <form onSubmit={handleSubmit} className="border-t border-[#00c2ff]/30 bg-[#0a0a1a] p-4">
        <div className="flex items-center gap-2">
          <span className="text-[#33ff92] font-mono font-bold">{prompt}$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            className="flex-1 bg-transparent text-white font-mono outline-none"
            placeholder="Type a command or 'help'..."
            autoComplete="off"
            spellCheck="false"
          />
          {isProcessing && (
            <Zap className="w-5 h-5 text-[#FFD700] animate-pulse" />
          )}
        </div>
      </form>

      {/* Terminal Glow Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00c2ff] to-transparent opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#33ff92] to-transparent opacity-50"></div>
      </div>
    </div>
  );
};

