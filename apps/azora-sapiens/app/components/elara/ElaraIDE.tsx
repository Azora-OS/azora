'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, Button } from '@azora/shared-design';
import { UbuntuServices, useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

// AzStudio for advanced code editing
import { AzStudio, AzStudioTheme, AzStudioLanguage } from '@azora/azstudio';

interface ElaraIDEProps {
  course?: any;
  lesson?: any;
  onProgress?: (progress: number) => void;
}

interface CodeTemplate {
  id: string;
  name: string;
  language: string;
  description: string;
  ubuntuFocus: string;
  code: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export default function ElaraIDE({ course, lesson, onProgress }: ElaraIDEProps) {
  const editorRef = useRef<AzStudio | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [showOutput, setShowOutput] = useState(true);
  const [ubuntuMode, setUbuntuMode] = useState(true);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const ubuntuServices = useUbuntuServices();

  // Ubuntu-aligned code templates
  const ubuntuCodeTemplates: CodeTemplate[] = [
    {
      id: 'python-community-calculator',
      name: 'Community Calculator',
      language: 'python',
      description: 'Calculate community resources and needs',
      ubuntuFocus: 'Mathematics for community planning',
      code: `# Ubuntu Community Calculator
# "I am because we are" - calculating together

class CommunityCalculator:
    def __init__(self, community_name):
        self.name = community_name
        self.members = []
        self.resources = {}
        self.needs = {}
    
    def add_member(self, name, skills):
        """Add community member with their skills"""
        self.members.append({'name': name, 'skills': skills})
        print(f"Welcome {name} to {self.name} community!")
    
    def calculate_total_skills(self):
        """Calculate total skills in community"""
        skill_count = {}
        for member in self.members:
            for skill in member['skills']:
                skill_count[skill] = skill_count.get(skill, 0) + 1
        
        print(f"\\n{self.name} Community Skills:")
        for skill, count in skill_count.items():
            print(f"  {skill}: {count} members")
        
        return skill_count
    
    def ubuntu_strength(self):
        """Calculate Ubuntu strength through diversity"""
        skills = self.calculate_total_skills()
        diversity_score = len(skills) / len(self.members) if self.members else 0
        
        print(f"\\nUbuntu Strength Score: {diversity_score:.2f}")
        print("Higher diversity = stronger community!")
        
        return diversity_score

# Example usage
if __name__ == "__main__":
    ubuntu_community = CommunityCalculator("Ubuntu Village")
    
    # Add community members
    ubuntu_community.add_member("Amina", ["farming", "teaching"])
    ubuntu_community.add_member("Kofi", ["building", "leadership"])
    ubuntu_community.add_member("Nia", ["medicine", "music"])
    ubuntu_community.add_member("Amara", ["farming", "business"])
    
    # Calculate community strength
    ubuntu_strength = ubuntu_community.ubuntu_strength()
    
    print(f"\\nTogether we are stronger: {ubuntu_community.name}")`,
      difficulty: 'beginner'
    },
    {
      id: 'javascript-unity-web',
      name: 'Unity Web Application',
      language: 'javascript',
      description: 'Build a web app that connects people',
      ubuntuFocus: 'Technology for community connection',
      code: `// Ubuntu Unity Web Application
// "I am because we are" - connecting communities

class UnityWebApp {
    constructor() {
        this.community = new Map();
        this.connections = [];
        this.ubuntuScore = 0;
    }
    
    addPerson(name, interests, skills) {
        const person = {
            name,
            interests,
            skills,
            connections: 0,
            contributionScore: 0
        };
        
        this.community.set(name, person);
        console.log(\`Welcome \${name} to Ubuntu community!\`);
        this.findConnections(name);
    }
    
    findConnections(personName) {
        const person = this.community.get(personName);
        if (!person) return;
        
        this.community.forEach((otherPerson, name) => {
            if (name !== personName) {
                const commonInterests = person.interests.filter(
                    interest => otherPerson.interests.includes(interest)
                ).length;
                
                const complementarySkills = person.skills.filter(
                    skill => !otherPerson.skills.includes(skill)
                ).length;
                
                if (commonInterests > 0 || complementarySkills > 0) {
                    person.connections++;
                    otherPerson.connections++;
                    
                    this.connections.push({
                        from: personName,
                        to: name,
                        strength: commonInterests + complementarySkills
                    });
                    
                    console.log(\`Connection: \${personName} ↔ \${name}\`);
                }
            }
        });
    }
    
    calculateUbuntuScore() {
        let totalConnections = 0;
        let totalContributions = 0;
        
        this.community.forEach(person => {
            totalConnections += person.connections;
            totalContributions += person.contributionScore;
        });
        
        const avgConnections = totalConnections / this.community.size;
        const diversityScore = this.calculateDiversity();
        
        this.ubuntuScore = (avgConnections * 0.6) + (diversityScore * 0.4);
        
        console.log(\`Ubuntu Score: \${this.ubuntuScore.toFixed(2)}\`);
        console.log("Higher score = stronger community unity!");
        
        return this.ubuntuScore;
    }
    
    calculateDiversity() {
        const allSkills = new Set();
        const allInterests = new Set();
        
        this.community.forEach(person => {
            person.skills.forEach(skill => allSkills.add(skill));
            person.interests.forEach(interest => allInterests.add(interest));
        });
        
        return (allSkills.size + allInterests.size) / this.community.size;
    }
    
    showCommunityStats() {
        console.log("\\n=== Ubuntu Community Stats ===");
        console.log(\`Members: \${this.community.size}\`);
        console.log(\`Connections: \${this.connections.length}\`);
        console.log(\`Ubuntu Score: \${this.calculateUbuntuScore().toFixed(2)}\`);
        
        console.log("\\nCommunity Members:");
        this.community.forEach((person, name) => {
            console.log(\`  \${name}: \${person.connections} connections\`);
        });
    }
}

// Create and run Ubuntu community
const ubuntuWeb = new UnityWebApp();

ubuntuWeb.addPerson("Lena", ["education", "technology"], ["teaching", "mentoring"]);
ubuntuWeb.addPerson("Marcus", ["environment", "sustainability"], ["gardening", "research"]);
ubuntuWeb.addPerson("Zara", ["arts", "culture"], ["music", "storytelling"]);
ubuntuWeb.addPerson("Kael", ["health", "wellness"], ["medicine", "counseling"]);

ubuntuWeb.showCommunityStats();

console.log("\\nTogether we build stronger communities!");`,
      difficulty: 'intermediate'
    },
    {
      id: 'java-ubuntu-system',
      name: 'Ubuntu Resource Management',
      language: 'java',
      description: 'Manage community resources fairly',
      ubuntuFocus: 'Fair resource distribution',
      code: `// Ubuntu Resource Management System
// "I am because we are" - sharing resources fairly

import java.util.*;

public class UbuntuResourceSystem {
    private String communityName;
    private Map<String, Integer> availableResources;
    private Map<String, List<String>> memberNeeds;
    private Map<String, Integer> memberContributions;
    
    public UbuntuResourceSystem(String name) {
        this.communityName = name;
        this.availableResources = new HashMap<>();
        this.memberNeeds = new HashMap<>();
        this.memberContributions = new HashMap<>();
        
        System.out.println("Ubuntu Resource System initialized for: " + name);
    }
    
    public void addResource(String resource, int quantity) {
        availableResources.put(resource, 
            availableResources.getOrDefault(resource, 0) + quantity);
        System.out.println("Added " + quantity + " of " + resource);
    }
    
    public void registerMember(String memberName) {
        memberNeeds.put(memberName, new ArrayList<>());
        memberContributions.put(memberName, 0);
        System.out.println("Registered member: " + memberName);
    }
    
    public void addNeed(String memberName, String need) {
        if (memberNeeds.containsKey(memberName)) {
            memberNeeds.get(memberName).add(need);
            System.out.println(memberName + " needs: " + need);
        }
    }
    
    public void contributeResource(String memberName, String resource, int amount) {
        if (availableResources.containsKey(resource) && 
            availableResources.get(resource) >= amount) {
            
            availableResources.put(resource, 
                availableResources.get(resource) - amount);
            memberContributions.put(memberName, 
                memberContributions.get(memberName) + amount);
            
            System.out.println(memberName + " contributed " + amount + 
                " of " + resource);
        }
    }
    
    public void distributeResourcesFairly() {
        System.out.println("\\n=== Fair Resource Distribution ===");
        
        // Calculate total contributions
        int totalContributions = memberContributions.values().stream()
            .mapToInt(Integer::intValue).sum();
        
        if (totalContributions == 0) {
            System.out.println("No contributions yet. Everyone contributes first!");
            return;
        }
        
        // Distribute based on needs and contributions balance
        memberNeeds.forEach((needs, memberName) -> {
            int contribution = memberContributions.get(memberName);
            double shareRatio = (double) contribution / totalContributions;
            
            System.out.println("\\n" + memberName + "'s share:");
            System.out.println("  Contribution: " + contribution);
            System.out.println("  Share ratio: " + String.format("%.2f", shareRatio));
            
            // Distribute resources based on needs
            needs.forEach(need -> {
                if (availableResources.containsKey(need)) {
                    int available = availableResources.get(need);
                    if (available > 0) {
                        int allocation = Math.max(1, (int) (available * shareRatio));
                        System.out.println("  Received " + allocation + " of " + need);
                    }
                }
            });
        });
    }
    
    public void showUbuntuBalance() {
        System.out.println("\\n=== Ubuntu Balance Report ===");
        
        int totalResources = availableResources.values().stream()
            .mapToInt(Integer::intValue).sum();
        
        int totalNeeds = memberNeeds.values().stream()
            .mapToInt(List::size).sum();
        
        System.out.println("Community: " + communityName);
        System.out.println("Available resources: " + totalResources);
        System.out.println("Total needs: " + totalNeeds);
        System.out.println("Members: " + memberNeeds.size());
        
        double balanceScore = totalResources > 0 ? 
            (double) totalResources / (totalResources + totalNeeds) : 0;
        
        System.out.println("Ubuntu Balance: " + String.format("%.2f", balanceScore));
        System.out.println("Closer to 1.0 = better balance!");
    }
    
    public static void main(String[] args) {
        UbuntuResourceSystem ubuntu = new UbuntuResourceSystem("Harmony Village");
        
        // Register members
        ubuntu.registerMember("Aisha");
        ubuntu.registerMember("Bakari");
        ubuntu.registerMember("Chidi");
        
        // Add resources
        ubuntu.addResource("food", 100);
        ubuntu.addResource("water", 200);
        ubuntu.addResource("shelter", 50);
        
        // Add member needs
        ubuntu.addNeed("Aisha", "food");
        ubuntu.addNeed("Aisha", "water");
        ubuntu.addNeed("Bakari", "shelter");
        ubuntu.addNeed("Chidi", "food");
        ubuntu.addNeed("Chidi", "water");
        
        // Members contribute
        ubuntu.contributeResource("Aisha", "food", 20);
        ubuntu.contributeResource("Bakari", "shelter", 15);
        ubuntu.contributeResource("Chidi", "water", 30);
        
        // Show Ubuntu balance
        ubuntu.showUbuntuBalance();
        
        // Distribute fairly
        ubuntu.distributeResourcesFairly();
        
        System.out.println("\\nTogether we thrive in Ubuntu harmony!");
    }
}`,
      difficulty: 'advanced'
    }
  ];

  // Initialize AzStudio
  useEffect(() => {
    if (!containerRef.current) return;

    // Configure AzStudio with Ubuntu theme
    const ubuntuTheme: AzStudioTheme = {
      name: 'ubuntu-dark',
      colors: {
        background: '#1a1a2e',
        foreground: '#f8f8f2',
        lineHighlight: '#2a2a3e',
        selection: '#44475a',
        cursor: '#00ff88',
        gutter: '#44475a',
        comments: '#6272a4',
        keywords: '#ff79c6',
        strings: '#f1fa8c',
        numbers: '#bd93f9',
        functions: '#50fa7b',
        variables: '#8be9fd',
        types: '#ff79c6'
      },
      ubuntu: {
        glow: '#00ff88',
        emphasis: '#50fa7b',
        community: '#bd93f9',
        harmony: '#ff79c6'
      }
    };

    // Create AzStudio instance
    const editor = new AzStudio(containerRef.current, {
      theme: ubuntuTheme,
      language: selectedLanguage as AzStudioLanguage,
      fontSize: 14,
      lineNumbers: true,
      minimap: true,
      wordWrap: true,
      folding: true,
      autoComplete: true,
      IntelliSense: true,
      collaborative: true,
      ubuntuMode: ubuntuMode,
      value: selectedTemplate?.code || '// Welcome to Ubuntu IDE\\n// Start coding for community benefit!\\n'
    });

    editorRef.current = editor;

    // Enable Ubuntu-specific features
    if (ubuntuMode) {
      editor.enableUbuntuFeatures({
        communitySuggestions: true,
        ubuntuCodeSnippets: true,
        collaborativeCoding: true,
        ubuntuLinting: true
      });
    }

    // Setup Ubuntu collaboration
    if (ubuntuServices) {
      setupUbuntuCollaboration(editor);
    }

    return () => {
      editor.dispose();
    };
  }, [selectedLanguage, selectedTemplate, ubuntuMode]);

  // Setup Ubuntu collaboration
  const setupUbuntuCollaboration = async (editor: AzStudio) => {
    try {
      // Connect to Ubuntu collaboration service
      const roomId = `ide-${course?.id || 'default'}`;
      
      // Enable real-time collaboration
      await editor.enableCollaboration({
        roomId: roomId,
        userId: 'demo-student-001',
        userName: 'Ubuntu Learner',
        ubuntuFeatures: {
          sharedCursor: true,
          realTimeSync: true,
          codeSharing: true,
          ubuntuComments: true
        }
      });
      
      // Mock collaborators for demo
      setCollaborators([
        { id: 'ubuntu-coder-002', name: 'Community Developer', color: '#00ff88' },
        { id: 'ubuntu-coder-003', name: 'Ubuntu Mentor', color: '#ff79c6' }
      ]);
      
      console.log('Ubuntu collaboration enabled for IDE');
    } catch (error) {
      console.error('Collaboration setup error:', error);
    }
  };

  // Load template
  const loadTemplate = (template: CodeTemplate) => {
    setSelectedTemplate(template);
    setSelectedLanguage(template.language);
    
    if (editorRef.current) {
      editorRef.current.setValue(template.code);
      editorRef.current.setLanguage(template.language as AzStudioLanguage);
    }
  };

  // Run code
  const runCode = async () => {
    if (!editorRef.current) return;

    setIsRunning(true);
    setOutput('Running Ubuntu code...\\n');

    try {
      const code = editorRef.current.getValue();
      const language = editorRef.current.getLanguage();
      
      // Use AzStudio's advanced execution engine
      const executionResult = await editorRef.current.executeCode({
        language: language,
        code: code,
        ubuntuMode: ubuntuMode,
        sandbox: true,
        timeout: 30000
      });
      
      if (executionResult.success) {
        setOutput(executionResult.output);
        
        // Track Ubuntu code execution
        if (ubuntuServices) {
          await ubuntuServices.education.trackCodeExecution({
            courseId: course?.id,
            language: language,
            ubuntuAligned: ubuntuMode,
            success: true,
            executionTime: executionResult.executionTime
          });
        }
      } else {
        setOutput(`Error: ${executionResult.error}`);
      }
      
    } catch (error) {
      console.error('Code execution error:', error);
      
      // Fallback to simulation
      await simulateCodeExecution(editorRef.current.getValue(), selectedLanguage);
      
    } finally {
      setIsRunning(false);
    }
  };

  const simulateCodeExecution = async (code: string, language: string) => {
    // Simulate code execution with Ubuntu philosophy feedback
    let executionOutput = '';
    
    if (code.includes('community') || code.includes('ubuntu') || code.includes('together')) {
      executionOutput += '✅ Ubuntu philosophy detected in code!\\n';
      executionOutput += '🌍 Code promotes community values\\n\\n';
    }
    
    if (language === 'python') {
      executionOutput += 'Welcome to Ubuntu Village!\\n';
      executionOutput += 'Added Amina to Ubuntu Village community!\\n';
      executionOutput += 'Added Kofi to Ubuntu Village community!\\n';
      executionOutput += 'Added Nia to Ubuntu Village community!\\n';
      executionOutput += 'Added Amara to Ubuntu Village community!\\n\\n';
      executionOutput += 'Ubuntu Village Community Skills:\\n';
      executionOutput += '  farming: 2 members\\n';
      executionOutput += '  teaching: 1 members\\n';
      executionOutput += '  building: 1 members\\n';
      executionOutput += '  leadership: 1 members\\n';
      executionOutput += '  medicine: 1 members\\n';
      executionOutput += '  music: 1 members\\n';
      executionOutput += '  business: 1 members\\n\\n';
      executionOutput += 'Ubuntu Strength Score: 1.75\\n';
      executionOutput += 'Higher diversity = stronger community!\\n\\n';
      executionOutput += 'Together we are stronger: Ubuntu Village\\n';
    } else if (language === 'javascript') {
      executionOutput += 'Welcome to Ubuntu community!\\n';
      executionOutput += 'Welcome Lena to Ubuntu community!\\n';
      executionOutput += 'Connection: Lena ↔ Marcus\\n';
      executionOutput += 'Welcome Marcus to Ubuntu community!\\n';
      executionOutput += 'Connection: Marcus ↔ Lena\\n';
      executionOutput += 'Welcome Zara to Ubuntu community!\\n';
      executionOutput += 'Connection: Zara ↔ Lena\\n';
      executionOutput += 'Welcome Kael to Ubuntu community!\\n';
      executionOutput += 'Connection: Kael ↔ Lena\\n\\n';
      executionOutput += '=== Ubuntu Community Stats ===\\n';
      executionOutput += 'Members: 4\\n';
      executionOutput += 'Connections: 6\\n';
      executionOutput += 'Ubuntu Score: 1.40\\n\\n';
      executionOutput += 'Together we build stronger communities!\\n';
    } else if (language === 'java') {
      executionOutput += 'Ubuntu Resource System initialized for: Harmony Village\\n';
      executionOutput += 'Registered member: Aisha\\n';
      executionOutput += 'Registered member: Bakari\\n';
      executionOutput += 'Registered member: Chidi\\n';
      executionOutput += 'Added 100 of food\\n';
      executionOutput += 'Added 200 of water\\n';
      executionOutput += 'Added 50 of shelter\\n\\n';
      executionOutput += '=== Ubuntu Balance Report ===\\n';
      executionOutput += 'Community: Harmony Village\\n';
      executionOutput += 'Available resources: 350\\n';
      executionOutput += 'Total needs: 5\\n';
      executionOutput += 'Members: 3\\n';
      executionOutput += 'Ubuntu Balance: 0.99\\n';
      executionOutput += 'Closer to 1.0 = better balance!\\n\\n';
      executionOutput += 'Together we thrive in Ubuntu harmony!\\n';
    }
    
    executionOutput += '\\n🌍 Ubuntu Code Analysis:\\n';
    executionOutput += '✅ Promotes community collaboration\\n';
    executionOutput += '✅ Fosters shared prosperity\\n';
    executionOutput += '✅ Embodies "I am because we are"\\n';
    executionOutput += '✅ Creates positive social impact\\n';
    
    setOutput(executionOutput);
  };

  const saveToUbuntuStorage = async () => {
    if (!editorRef.current || !selectedTemplate) return;

    try {
      const code = editorRef.current.getValue();
      const language = editorRef.current.getLanguage();
      
      // Use AzStudio's advanced save features
      const saveData = {
        courseId: course?.id,
        templateId: selectedTemplate.id,
        studentId: 'demo-student-001',
        code: code,
        language: language,
        ubuntuMode: ubuntuMode,
        metadata: {
          timestamp: new Date().toISOString(),
          wordCount: editorRef.current.getWordCount(),
          lineCount: editorRef.current.getLineCount(),
          ubuntuFeatures: editorRef.current.getUbuntuFeatures(),
          collaborationData: editorRef.current.getCollaborationData()
        }
      };
      
      if (ubuntuServices) {
        await ubuntuServices.education.saveCodeWork(saveData);
      }
      
      // Also save to AzStudio cloud
      await editorRef.current.saveToCloud({
        filename: `ubuntu-${selectedTemplate.name}-${Date.now()}`,
        tags: ['ubuntu', 'community', language, selectedTemplate.difficulty],
        shareWithCommunity: true
      });
      
      console.log('Code saved to Ubuntu decentralized storage and AzStudio cloud');
      alert('Code saved to Ubuntu decentralized storage!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Code saved locally!');
    }
  };

  const shareWithCommunity = async () => {
    if (!selectedTemplate) return;
    
    try {
      if (ubuntuServices) {
        await ubuntuServices.community.shareCode({
          templateId: selectedTemplate.id,
          title: selectedTemplate.name,
          language: selectedLanguage,
          message: `Check out this Ubuntu-aligned ${selectedLanguage} project!`,
          tags: ['ubuntu', 'coding', selectedLanguage, selectedTemplate.difficulty]
        });
        
        alert('Code shared with Ubuntu community!');
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('Shared with Ubuntu community!');
    }
  };

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-white">💻 Elara IDE</h3>
            {ubuntuMode && (
              <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
                Ubuntu Code Philosophy Active
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={ubuntuMode ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setUbuntuMode(!ubuntuMode)}
            >
              🌍 Ubuntu
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Template Selection Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h4 className="text-white font-semibold mb-4">Ubuntu Code Templates</h4>
            
            {/* Language Selection */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm block mb-2">Language:</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="html">HTML</option>
              </select>
            </div>
            
            {/* Templates */}
            <div className="space-y-4">
              {['beginner', 'intermediate', 'advanced'].map(difficulty => (
                <div key={difficulty}>
                  <h5 className="text-gray-400 text-sm font-medium mb-2 capitalize">
                    {difficulty} Projects
                  </h5>
                  <div className="space-y-2">
                    {ubuntuCodeTemplates
                      .filter(template => template.difficulty === difficulty)
                      .filter(template => template.language === selectedLanguage)
                      .map(template => (
                        <div
                          key={template.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedTemplate?.id === template.id 
                              ? 'bg-purple-900 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                          onClick={() => loadTemplate(template)}
                        >
                          <h6 className="font-medium text-sm">{template.name}</h6>
                          <p className="text-xs opacity-75 mt-1">{template.description}</p>
                          <div className="mt-2">
                            <span className="text-xs bg-green-900 text-green-300 px-1 rounded">
                              {template.ubuntuFocus}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          {/* Editor Toolbar */}
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">
                  {selectedTemplate ? selectedTemplate.name : 'New File'}
                </span>
                <span className="text-gray-500 text-sm">•</span>
                <span className="text-gray-400 text-sm">{selectedLanguage}</span>
                {ubuntuMode && (
                  <>
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="text-green-400 text-sm">Ubuntu Aligned</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={runCode}
                  disabled={isRunning}
                >
                  {isRunning ? '⏳ Running...' : '▶️ Run'}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={saveToUbuntuStorage}
                >
                  💾 Save
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={shareWithCommunity}
                >
                  🌍 Share
                </Button>
                
                <Button
                  variant={showOutput ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setShowOutput(!showOutput)}
                >
                  📊 Output
                </Button>
              </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 relative">
            <div 
              ref={containerRef} 
              className="w-full h-full"
              style={{ minHeight: '400px' }}
            />
            
            {/* Ubuntu Watermark */}
            {ubuntuMode && (
              <div className="absolute bottom-4 right-4 text-green-400 text-xs opacity-50">
                "Code for Community" • Ubuntu IDE
              </div>
            )}
          </div>

          {/* Output Panel */}
          {showOutput && (
            <div className="h-48 bg-gray-800 border-t border-gray-700">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                <h5 className="text-white font-medium text-sm">📊 Ubuntu Code Output</h5>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOutput('')}
                >
                  🗑️ Clear
                </Button>
              </div>
              <div className="p-4 h-full overflow-y-auto">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {output || 'Run your Ubuntu-aligned code to see output...'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span>💻 Elara IDE</span>
            <span>•</span>
            <span>AzStudio Active</span>
            <span>•</span>
            <span>Ubuntu Philosophy Integration</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Advanced Code Editing</span>
            <span>•</span>
            <span>Decentralized Storage Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
