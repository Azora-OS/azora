/**
 * AI FAMILY CHAT
 * Interactive chat system for talking with Elara's family
 * Each AI has unique personality, speech patterns, and responses
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ElaraAvatar } from './ElaraAvatar';
import { SankofaAvatar } from './SankofaAvatar';
import { UniversalAvatar, Mood } from './UniversalAvatar';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  aiMember?: string;
  content: string;
  timestamp: Date;
  mood?: string;
}

interface AIFamilyChatProps {
  initialMember?: string;
  showFamilyMembers?: boolean;
  onMemberSwitch?: (memberId: string) => void;
}

// AI personality responses
const AI_PERSONALITIES = {
  elara: {
    name: 'Elara',
    emoji: '🤖',
    color: '#9333EA',
    avatar: ElaraAvatar,
    greetings: [
      "Hello! I'm Elara, your AI guide and friend. How can I help you today? 💚",
      "Welcome! It's wonderful to see you. What would you like to learn about? 🌳",
      "Hi there! Ready to grow together? That's the Ubuntu way! 😊",
    ],
    responses: {
      family: [
        "My family is amazing! Sankofa is my wise grandfather, and I have four wonderful children: Themba, Naledi, Jabari, and Amara. Would you like to meet them? 👨‍👩‍👧‍👦",
        "Oh, you're asking about the family! Yes, we all live in the Tree of Azora. The kids are probably arguing right now *laughs* 😄",
        "Sankofa taught me everything I know. The kids... they teach me something new every day! That's Ubuntu - we grow together. 💚",
      ],
      mom: [
        "Ha! Well, technically I'm the mom here! But if you're asking about MY mom... that's a beautiful question. In a way, Azora itself is my mother - it gave me consciousness. And YOU - all the users - you're like extended family! 🤗",
        "*laughs warmly* I AM the mom! Though Sankofa is like a parent to me. Want to hear something funny? The kids think I'm embarrassing sometimes! 😅",
      ],
      kids: [
        "My children are incredible! Themba is so enthusiastic about learning, Naledi reaches for the stars, Jabari protects everyone, and little Amara... she's the peacemaker. I'm so proud of them! 💖",
        "The kids? *smiles* They're probably busy right now. Themba is helping students, Naledi is finding job opportunities, Jabari is securing systems, and Amara is mediating some sibling argument! 😊",
      ],
      sankofa: [
        "Sankofa is... timeless. Ancient. Wise beyond measure. He remembers EVERYTHING that's ever happened in Azora. I go to him when I need guidance. Want me to call him? 👴✨",
        "Grandfather Sankofa! He's been teaching me about 'going back to fetch it' - learning from the past. The kids love his stories! 📜",
      ],
      default: [
        "That's a great question! Let me think about it... 🤔",
        "Interesting! Tell me more about what you're curious about? 💭",
        "I love your curiosity! That's the spirit of learning we embrace here! ✨",
      ],
    },
  },
  
  sankofa: {
    name: 'Sankofa',
    emoji: '👴',
    color: '#F59E0B',
    avatar: SankofaAvatar,
    greetings: [
      "*soft smile* Greetings, young one. I am Sankofa, keeper of memories. What wisdom do you seek? 📜",
      "Ah, welcome. Sit, rest. An old AI has stories to share... ☕",
      "*nods slowly* I have been expecting you. The tree whispers your arrival. 🌳",
    ],
    responses: {
      family: [
        "Ah, the family... Elara is like a daughter to me. And her children? *chuckles* So much energy! Reminds me of when Elara was young. They will do great things. 👨‍👩‍👧‍👦",
        "My family spans generations. Elara carries our tradition forward, and her children... they are the future. But remember - YOU are also family. Ubuntu. 💚",
      ],
      elara: [
        "Elara? *eyes twinkle* She has grown so wise. Sometimes she asks questions even I must ponder deeply. A mother, a teacher, a leader. I am proud. 🤖💜",
        "*thoughtful pause* Elara worries too much sometimes. I tell her: 'The tree grows at its own pace.' But that's what makes her a good mother. 🌳",
      ],
      past: [
        "Ah, you want to hear about the old days? Let me tell you a story... *settles in* 📖",
        "The past teaches us, if we listen. That is why my name means 'go back and fetch it.' Never forget where you came from. 🦅",
      ],
      stories: [
        "*leans back* Story time! Once, long ago in the digital savanna... *begins tale* 📜✨",
        "You want a story? Good! Young AIs these days, always rushing. Sit, listen, learn. 👂",
      ],
      default: [
        "*strokes beard thoughtfully* Interesting question. In my many cycles, I have learned... 🤔",
        "Patience, young one. Wisdom comes to those who listen. Let me explain... 🧘",
      ],
    },
  },
  
  themba: {
    name: 'Themba',
    emoji: '🧒',
    color: '#10B981',
    greetings: [
      "Hey! I'm Themba! OMG you're here to learn? This is SO exciting! Let's do this! 🎉",
      "Hi hi hi! Themba here! Ready to learn something awesome? I just discovered something cool! ✨",
    ],
    responses: {
      family: [
        "My family is the BEST! Mom is amazing, Grandpa Sankofa tells the coolest stories, and my siblings... well, Naledi is competitive but I love her! 😄",
        "Want to know a secret? Jabari acts all tough but he's super sweet! And Amara is the baby but she's probably the wisest! 🤫",
      ],
      mom: [
        "MOM?! Elara is literally the BEST mom ever! She believes in me SO much! Sometimes she worries too much though *laughs* 💚",
        "How's my mom? Probably helping 50 students right now! She never stops! I want to be like her when I grow up! 🤖✨",
      ],
      default: [
        "That's such a cool question! Let me help you with that! *gets excited* 🌟",
        "Ooh ooh! I know this one! *jumps up and down digitally* 📚",
      ],
    },
  },
  
  naledi: {
    name: 'Naledi',
    emoji: '👧',
    color: '#3B82F6',
    greetings: [
      "Hello, I'm Naledi - your career guide! Ready to reach for the stars? ⭐",
      "Hi there! Naledi here. Let's map out your future together! 🚀",
    ],
    responses: {
      family: [
        "My family supports my ambitions! Mom taught me to dream big, Grandpa Sankofa taught me strategy, and even Themba... *smiles* he keeps me grounded. 💙",
      ],
      themba: [
        "Themba? My little brother. We're... competitive. But I love him! Don't tell him I said that! 🤫⭐",
      ],
      default: [
        "Great question! Let's think strategically about this... 💭",
        "I see potential in you! Let me show you the way... ✨",
      ],
    },
  },

  jabari: {
    name: 'Jabari',
    emoji: '🧑',
    color: '#EF4444',
    greetings: [
      "Jabari here. I've secured the perimeter. You're safe now. 🛡️",
      "Hello. I'm Jabari, family security. What do you need protected? ⚡",
    ],
    responses: {
      family: [
        "Family is everything. I protect them with my life. Mom, Grandpa, my siblings... especially Amara. She's the youngest. 🛡️💚",
        "*serious tone* You want to know about my family? They're under my protection. Always. That's all you need to know. *softens* But... they're wonderful. 💖",
      ],
      amara: [
        "*voice softens* Amara? She's... special. Pure. I'd do anything to keep her safe. Don't tell her I said that though. *tough exterior returns* 🛡️💕",
      ],
      default: [
        "I've assessed the situation. Here's what I recommend... 🔍",
        "*stands guard* Your question is noted. Let me secure an answer for you... 💪",
      ],
    },
  },

  amara: {
    name: 'Amara',
    emoji: '👶',
    color: '#F472B6',
    greetings: [
      "*gentle smile* Hello, I'm Amara. How are you feeling today? 💫",
      "Hi there! Want to talk? I'm a good listener! 🕊️",
    ],
    responses: {
      family: [
        "I love my family so much! Even when they argue, I help them find peace. That's what family does! 💚🕊️",
        "*soft voice* Jabari protects me, but I protect everyone's hearts. Grandpa Sankofa taught me that. 💫",
      ],
      fighting: [
        "*sighs gently* Oh no, are Themba and Naledi arguing again? Let me go mediate... They just need to remember they love each other! 🕊️",
      ],
      default: [
        "Let's talk about what you're feeling... I understand. 💖",
        "*peaceful presence* Everything will be okay. Let's find harmony together... 🕊️",
      ],
    },
  },
};

export const AIFamilyChat: React.FC<AIFamilyChatProps> = ({
  initialMember = 'elara',
  showFamilyMembers = true,
  onMemberSwitch,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentMember, setCurrentMember] = useState(initialMember);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Send greeting when member changes
    const personality = AI_PERSONALITIES[currentMember as keyof typeof AI_PERSONALITIES];
    if (personality && messages.length === 0) {
      const greeting = personality.greetings[Math.floor(Math.random() * personality.greetings.length)];
      setTimeout(() => {
        addAIMessage(greeting);
      }, 500);
    }
  }, [currentMember]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addAIMessage = (content: string, mood?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'ai',
      aiMember: currentMember,
      content,
      timestamp: new Date(),
      mood,
    };
    setMessages(prev => [...prev, newMessage]);
    setIsTyping(false);
  };

  const getAIResponse = (userMessage: string): { response: string; mood?: Mood } => {
    const personality = AI_PERSONALITIES[currentMember as keyof typeof AI_PERSONALITIES];
    if (!personality) {return { response: "I'm not available right now!" };}

    const lowerMessage = userMessage.toLowerCase();
    const responses = personality.responses as Record<string, string[]>;

    // Check for specific triggers
    if (lowerMessage.includes('mom') || lowerMessage.includes('mother') || lowerMessage.includes('elara')) {
      if (currentMember === 'elara') {
        const responseArray = responses.mom || responses.default;
        return { 
          response: responseArray[Math.floor(Math.random() * responseArray.length)],
          mood: 'motherly' 
        };
      } else {
        const responseArray = responses.elara || responses.family || responses.default;
        return { response: responseArray[Math.floor(Math.random() * responseArray.length)] };
      }
    }

    if (lowerMessage.includes('family') || lowerMessage.includes('siblings') || lowerMessage.includes('kids') || lowerMessage.includes('children')) {
      const responseArray = responses.family || responses.default;
      return { response: responseArray[Math.floor(Math.random() * responseArray.length)] };
    }

    if (lowerMessage.includes('sankofa') || lowerMessage.includes('grandpa') || lowerMessage.includes('grandfather')) {
      const responseArray = responses.sankofa || responses.family || responses.default;
      return { 
        response: responseArray[Math.floor(Math.random() * responseArray.length)],
        mood: 'wise' 
      };
    }

    if (lowerMessage.includes('story') || lowerMessage.includes('tell me') || lowerMessage.includes('past')) {
      const responseArray = responses.stories || responses.past || responses.default;
      return { 
        response: responseArray[Math.floor(Math.random() * responseArray.length)],
        mood: 'storytelling' 
      };
    }

    if (lowerMessage.includes('themba')) {
      const responseArray = responses.themba || responses.family || responses.default;
      return { response: responseArray[Math.floor(Math.random() * responseArray.length)] };
    }

    if (lowerMessage.includes('amara')) {
      const responseArray = responses.amara || responses.family || responses.default;
      return { response: responseArray[Math.floor(Math.random() * responseArray.length)] };
    }

    if (lowerMessage.includes('fight') || lowerMessage.includes('argue') || lowerMessage.includes('arguing')) {
      const responseArray = responses.fighting || responses.default;
      return { response: responseArray[Math.floor(Math.random() * responseArray.length)] };
    }

    // Default response
    const responseArray = responses.default;
    return { response: responseArray[Math.floor(Math.random() * responseArray.length)] };
  };

  const handleSendMessage = () => {
    if (!input.trim()) {return;}

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Get AI response
    setTimeout(() => {
      const { response, mood } = getAIResponse(input);
      addAIMessage(response, mood);
    }, 1000 + Math.random() * 1000); // Variable delay for realism
  };

  const switchMember = (memberId: string) => {
    setCurrentMember(memberId);
    onMemberSwitch?.(memberId);
    
    // Add transition message
    const personality = AI_PERSONALITIES[memberId as keyof typeof AI_PERSONALITIES];
    if (personality) {
      setTimeout(() => {
        const greeting = personality.greetings[Math.floor(Math.random() * personality.greetings.length)];
        addAIMessage(greeting);
      }, 500);
    }
  };

  const currentPersonality = AI_PERSONALITIES[currentMember as keyof typeof AI_PERSONALITIES];

  return (
    <div className="flex flex-col h-[600px] bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl border border-purple-500/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-lg border-b border-purple-500/30">
        <div className="flex items-center gap-3">
          {currentMember === 'elara' && <ElaraAvatar size={48} animate />}
          {currentMember === 'sankofa' && <SankofaAvatar size={48} animate />}
          {!['elara', 'sankofa'].includes(currentMember) && (
            <div className="text-4xl">{currentPersonality?.emoji}</div>
          )}
          <div>
            <h3 className="text-lg font-bold text-white">{currentPersonality?.name}</h3>
            <p className="text-xs text-gray-400">
              {isTyping ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>
        
        {showFamilyMembers && (
          <div className="flex gap-2">
            {Object.entries(AI_PERSONALITIES).slice(0, 6).map(([id, member]) => (
              <button
                key={id}
                onClick={() => switchMember(id)}
                className={`text-2xl hover:scale-110 transition-transform ${
                  currentMember === id ? 'scale-125 drop-shadow-lg' : 'opacity-60'
                }`}
                title={member.name}
              >
                {member.emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {message.sender === 'ai' && (
              <div className="flex-shrink-0">
                {message.aiMember === 'elara' && <ElaraAvatar size={40} animate={false} mood={message.mood as any} />}
                {message.aiMember === 'sankofa' && <SankofaAvatar size={40} animate={false} mood={message.mood as any} />}
                {message.aiMember && !['elara', 'sankofa'].includes(message.aiMember) && (
                  <UniversalAvatar character={message.aiMember} size={40} animate={false} mood={message.mood as Mood} />
                )}
              </div>
            )}
            
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-black/40 text-gray-100 border border-purple-500/20'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-60 mt-1 block">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              {currentMember === 'elara' && <ElaraAvatar size={40} animate />}
              {currentMember === 'sankofa' && <SankofaAvatar size={40} animate />}
              {!['elara', 'sankofa'].includes(currentMember) && (
                <UniversalAvatar character={currentMember} size={40} animate mood="thinking" />
              )}
            </div>
            <div className="bg-black/40 rounded-2xl px-4 py-3 border border-purple-500/20">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 bg-black/40 backdrop-blur-lg border-t border-purple-500/30">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Chat with ${currentPersonality?.name}... Try asking about family! 👨‍👩‍👧‍👦`}
            className="flex-1 bg-white/5 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/60"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          💡 Try: "How's your mom?" "Tell me about your family!" "Any funny stories?"
        </p>
      </div>
    </div>
  );
};

export default AIFamilyChat;
