/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

INTEGRATED CODE EDITOR FOR SAPIENS
Educational IDE for K-12 Students learning to code
*/

'use client';

import React, { useState } from 'react';
import { Play, Save, Download, HelpCircle, Lightbulb, Code2 } from 'lucide-react';

interface IntegratedIDEProps {
  language?: 'python' | 'javascript' | 'html' | 'scratch';
  lesson?: string;
  startingCode?: string;
  onRun?: (code: string) => void;
}

export function IntegratedIDE({ 
  language = 'python', 
  lesson = 'Introduction to Programming',
  startingCode = '',
  onRun 
}: IntegratedIDEProps) {
  const [code, setCode] = useState(startingCode || getStarterCode(language));
  const [output, setOutput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [aiHelping, setAiHelping] = useState(false);

  const runCode = async () => {
    setOutput('Running code...\n');
    
    // Simulate code execution
    setTimeout(() => {
      try {
        if (language === 'python') {
          setOutput('>>> Code executed successfully!\n>>> Hello, World!\n>>> Process finished with exit code 0');
        } else if (language === 'javascript') {
          setOutput('Console:\nHello, World!\nundefined');
        }
        onRun?.(code);
      } catch (error) {
        setOutput(`Error: ${error}`);
      }
    }, 500);
  };

  const getAIHelp = async () => {
    setAiHelping(true);
    setOutput('🤖 Elara AI Tutor is analyzing your code...\n');
    
    setTimeout(() => {
      setOutput(
        '🤖 Elara AI Tutor:\n\n' +
        '✅ Great start! Your code structure looks good.\n\n' +
        '💡 Suggestion: Try adding a comment to explain what your code does.\n' +
        '   Comments in Python start with # symbol.\n\n' +
        '🎯 Next Challenge: Can you modify this to print your name instead?\n\n' +
        'Want me to explain any part? Just ask!'
      );
      setAiHelping(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-2xl overflow-hidden border border-purple-500/30">
      {/* IDE Header */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-4 border-b border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Code2 className="w-6 h-6 text-purple-300" />
            <div>
              <h3 className="font-bold text-white">{lesson}</h3>
              <p className="text-xs text-purple-300">Language: {language.toUpperCase()}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHint(!showHint)}
              className="bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 px-3 py-2 rounded-lg flex items-center space-x-1 text-sm transition-colors"
              title="Get a hint"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Hint</span>
            </button>
            
            <button
              onClick={getAIHelp}
              disabled={aiHelping}
              className="bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded-lg flex items-center space-x-1 text-sm transition-colors disabled:opacity-50"
              title="Ask AI Tutor"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Ask AI</span>
            </button>
            
            <button
              onClick={runCode}
              className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg flex items-center space-x-1 font-semibold transition-colors"
              title="Run code"
            >
              <Play className="w-4 h-4" />
              <span>Run</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hint Banner */}
      {showHint && (
        <div className="bg-yellow-900/30 border-b border-yellow-500/30 p-3">
          <p className="text-yellow-200 text-sm flex items-start space-x-2">
            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              💡 <strong>Hint:</strong> Start by typing <code className="bg-black/30 px-2 py-0.5 rounded">print("Hello, World!")</code>
              {' '}and click the Run button to see the output!
            </span>
          </p>
        </div>
      )}

      {/* Split View: Code + Output */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col border-r border-purple-500/20">
          <div className="bg-gray-800 px-4 py-2 border-b border-purple-500/20">
            <span className="text-xs text-purple-300 font-semibold">CODE EDITOR</span>
          </div>
          <div className="flex-1 relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 bg-gray-900 text-green-300 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ 
                tabSize: 2,
                lineHeight: '1.6',
              }}
              spellCheck={false}
              placeholder="Type your code here..."
            />
            {/* Line Numbers (simplified) */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-800/50 border-r border-purple-500/10 pointer-events-none">
              <div className="p-4 font-mono text-xs text-purple-500/50 leading-relaxed">
                {Array.from({length: 20}, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Output Console */}
        <div className="flex-1 flex flex-col bg-black">
          <div className="bg-gray-800 px-4 py-2 border-b border-purple-500/20 flex items-center justify-between">
            <span className="text-xs text-purple-300 font-semibold">OUTPUT CONSOLE</span>
            <button 
              onClick={() => setOutput('')}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <pre className="p-4 font-mono text-sm text-green-400 whitespace-pre-wrap">
              {output || '// Run your code to see output here...\n// Click the green "Run" button! ▶️'}
            </pre>
          </div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="bg-gray-800 border-t border-purple-500/20 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-purple-400">
          <span>✓ Syntax OK</span>
          <span>•</span>
          <span>Line 1, Col 1</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1">
            <Save className="w-3 h-3" />
            <span>Save</span>
          </button>
          <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1">
            <Download className="w-3 h-3" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to get starter code for different languages
function getStarterCode(language: string): string {
  const starters = {
    python: `# Welcome to Python Programming!
# Let's write your first program

print("Hello, World!")

# Try changing the message above
# Then click the Run button! ▶️
`,
    javascript: `// Welcome to JavaScript!
// Let's write your first program

console.log("Hello, World!");

// Try changing the message above
// Then click the Run button! ▶️
`,
    html: `<!DOCTYPE html>
<html>
<head>
  <title>My First Webpage</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Welcome to web development!</p>
</body>
</html>
`,
    scratch: `// Block-based programming
// Drag and drop blocks to create programs!
when green flag clicked
  say "Hello, World!" for 2 seconds
  move 10 steps
`,
  };

  return starters[language as keyof typeof starters] || starters.python;
}

// Age-Appropriate IDE Wrapper
interface AgeGroupIDEProps {
  ageGroup: 'K-2' | '3-5' | '6-8' | '9-12';
  lesson?: string;
}

export function AgeGroupIDE({ ageGroup, lesson }: AgeGroupIDEProps) {
  const configs = {
    'K-2': {
      language: 'scratch' as const,
      lesson: lesson || '🎨 Create Your First Animation!',
      startingCode: 'when green flag clicked\n  say "Hello!" for 2 seconds',
    },
    '3-5': {
      language: 'scratch' as const,
      lesson: lesson || '🎮 Build a Simple Game!',
      startingCode: 'when green flag clicked\n  forever\n    move 10 steps\n  end',
    },
    '6-8': {
      language: 'python' as const,
      lesson: lesson || '🐍 Introduction to Python',
      startingCode: '# Your first Python program!\nprint("Hello, Python!")\n',
    },
    '9-12': {
      language: 'python' as const,
      lesson: lesson || '💻 Advanced Programming Concepts',
      startingCode: '# Let\'s build something amazing!\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Student"))\n',
    },
  };

  const config = configs[ageGroup];

  return (
    <IntegratedIDE 
      language={config.language}
      lesson={config.lesson}
      startingCode={config.startingCode}
    />
  );
}
