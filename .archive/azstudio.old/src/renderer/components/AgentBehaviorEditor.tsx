// Agent Behavior Profiles Component for AzStudio
// User-configurable agent preferences and coding styles

import React, { useState, useEffect } from 'react';
import { GenesisStation, AgentBehaviorProfile } from '../services/GenesisStation';

interface AgentBehaviorEditorProps {
  projectId: string;
  genesisStation: GenesisStation;
  selectedAgent?: string;
  onProfileUpdate?: (agentName: string, profile: AgentBehaviorProfile) => void;
}

const AgentBehaviorEditor: React.FC<AgentBehaviorEditorProps> = ({
  projectId,
  genesisStation,
  selectedAgent,
  onProfileUpdate
}) => {
  const [profiles, setProfiles] = useState<Record<string, AgentBehaviorProfile>>({});
  const [currentAgent, setCurrentAgent] = useState<string>(selectedAgent || 'Zola');
  const [currentProfile, setCurrentProfile] = useState<AgentBehaviorProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const agentOptions = [
    { value: 'Zola', label: '🧠 Zola - Backend Developer', description: 'System architecture, APIs, databases' },
    { value: 'Jabari', label: '🛡️ Jabari - Security Expert', description: 'Security analysis, code review, compliance' },
    { value: 'Kofi', label: '⚙️ Kofi - DevOps Engineer', description: 'Infrastructure, deployment, monitoring' },
    { value: 'Abeni', label: '🎨 Abeni - Frontend Developer', description: 'UI/UX, frontend development, accessibility' },
    { value: 'Nexus', label: '🔗 Nexus - Full Stack', description: 'Integration, testing, documentation' }
  ];

  useEffect(() => {
    loadProfiles();
  }, [projectId]);

  useEffect(() => {
    if (selectedAgent) {
      setCurrentAgent(selectedAgent);
    }
  }, [selectedAgent]);

  useEffect(() => {
    const profile = profiles[currentAgent];
    if (profile) {
      setCurrentProfile({ ...profile });
    } else {
      // Create default profile
      const defaultProfile: AgentBehaviorProfile = {
        agentName: currentAgent,
        projectId,
        codeStyle: {
          language: 'typescript',
          conventions: getDefaultConventions(currentAgent),
          formatting: 'prettier',
          linting: ['eslint']
        },
        priorities: getDefaultPriorities(currentAgent),
        constraints: [],
        libraries: {
          preferred: getDefaultLibraries(currentAgent),
          forbidden: []
        },
        customInstructions: '',
        lastUpdated: new Date(),
        updatedBy: 'user'
      };
      setCurrentProfile(defaultProfile);
    }
  }, [currentAgent, profiles, projectId]);

  const loadProfiles = async () => {
    try {
      const loadedProfiles: Record<string, AgentBehaviorProfile> = {};
      
      for (const agent of agentOptions) {
        const profile = await genesisStation.getAgentBehavior(agent.value, projectId);
        if (profile) {
          loadedProfiles[agent.value] = profile;
        }
      }
      
      setProfiles(loadedProfiles);
    } catch (error) {
      console.error('Failed to load agent profiles:', error);
    }
  };

  const getDefaultConventions = (agentName: string): string[] => {
    const conventions: Record<string, string[]> = {
      'Zola': ['Use functional components', 'Prefer composition over inheritance', 'Type-first development'],
      'Jabari': ['Security-first mindset', 'Validate all inputs', 'Use parameterized queries'],
      'Kofi': ['Infrastructure as code', 'Environment-specific configs', 'Monitor everything'],
      'Abeni': ['Mobile-first design', 'Accessibility first', 'Progressive enhancement'],
      'Nexus': ['Test-driven development', 'Comprehensive documentation', 'Clean code principles']
    };
    return conventions[agentName] || [];
  };

  const getDefaultPriorities = (agentName: string): AgentBehaviorProfile['priorities'] => {
    const priorities: Record<string, AgentBehaviorProfile['priorities']> = {
      'Zola': { performance: 8, readability: 7, security: 6, testCoverage: 8, maintainability: 9 },
      'Jabari': { performance: 6, readability: 7, security: 10, testCoverage: 8, maintainability: 8 },
      'Kofi': { performance: 9, readability: 6, security: 7, testCoverage: 7, maintainability: 8 },
      'Abeni': { performance: 6, readability: 9, security: 7, testCoverage: 6, maintainability: 8 },
      'Nexus': { performance: 7, readability: 9, security: 8, testCoverage: 9, maintainability: 10 }
    };
    return priorities[agentName] || { performance: 7, readability: 8, security: 7, testCoverage: 7, maintainability: 8 };
  };

  const getDefaultLibraries = (agentName: string): string[] => {
    const libraries: Record<string, string[]> = {
      'Zola': ['prisma', 'zod', 'express', 'node-postgres'],
      'Jabari': ['bcrypt', 'helmet', 'cors', 'express-rate-limit'],
      'Kofi': ['docker', 'kubernetes', 'prometheus', 'grafana'],
      'Abeni': ['react', 'tailwindcss', 'framer-motion', 'react-query'],
      'Nexus': ['jest', 'storybook', 'typescript', 'eslint']
    };
    return libraries[agentName] || [];
  };

  const saveProfile = async () => {
    if (!currentProfile) return;

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      await genesisStation.updateAgentBehavior(
        currentAgent,
        JSON.stringify(currentProfile),
        projectId
      );

      setProfiles(prev => ({
        ...prev,
        [currentAgent]: currentProfile
      }));

      setSaveStatus('success');
      onProfileUpdate?.(currentAgent, currentProfile);

      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save agent profile:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = (updates: Partial<AgentBehaviorProfile>) => {
    if (!currentProfile) return;
    
    setCurrentProfile({
      ...currentProfile,
      ...updates,
      lastUpdated: new Date(),
      updatedBy: 'user'
    });
  };

  const addConvention = () => {
    if (!currentProfile) return;
    
    const convention = prompt('Enter coding convention:');
    if (convention && convention.trim()) {
      updateProfile({
        codeStyle: {
          ...currentProfile.codeStyle,
          conventions: [...currentProfile.codeStyle.conventions, convention.trim()]
        }
      });
    }
  };

  const removeConvention = (index: number) => {
    if (!currentProfile) return;
    
    updateProfile({
      codeStyle: {
        ...currentProfile.codeStyle,
        conventions: currentProfile.codeStyle.conventions.filter((_, i) => i !== index)
      }
    });
  };

  const addConstraint = () => {
    if (!currentProfile) return;
    
    const constraint = prompt('Enter constraint (e.g., "Never use any type"):');
    if (constraint && constraint.trim()) {
      updateProfile({
        constraints: [...currentProfile.constraints, constraint.trim()]
      });
    }
  };

  const removeConstraint = (index: number) => {
    if (!currentProfile) return;
    
    updateProfile({
      constraints: currentProfile.constraints.filter((_, i) => i !== index)
    });
  };

  const addPreferredLibrary = () => {
    if (!currentProfile) return;
    
    const library = prompt('Enter preferred library:');
    if (library && library.trim()) {
      updateProfile({
        libraries: {
          ...currentProfile.libraries,
          preferred: [...currentProfile.libraries.preferred, library.trim()]
        }
      });
    }
  };

  const removePreferredLibrary = (index: number) => {
    if (!currentProfile) return;
    
    updateProfile({
      libraries: {
        ...currentProfile.libraries,
        preferred: currentProfile.libraries.preferred.filter((_, i) => i !== index)
      }
    });
  };

  const addForbiddenLibrary = () => {
    if (!currentProfile) return;
    
    const library = prompt('Enter forbidden library:');
    if (library && library.trim()) {
      updateProfile({
        libraries: {
          ...currentProfile.libraries,
          forbidden: [...currentProfile.libraries.forbidden, library.trim()]
        }
      });
    }
  };

  const removeForbiddenLibrary = (index: number) => {
    if (!currentProfile) return;
    
    updateProfile({
      libraries: {
        ...currentProfile.libraries,
        forbidden: currentProfile.libraries.forbidden.filter((_, i) => i !== index)
      }
    });
  };

  if (!currentProfile) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#8c8c8c' }}>
        Loading agent profile...
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '16px', 
      height: '100%', 
      overflow: 'auto',
      background: '#1e1e1e'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px'
      }}>
        <h3 style={{ margin: 0, color: '#007acc' }}>
          🤖 Agent Behavior Profiles
        </h3>
        
        <button
          onClick={saveProfile}
          disabled={isSaving}
          style={{
            padding: '8px 16px',
            background: saveStatus === 'success' ? '#10b981' : 
                       saveStatus === 'error' ? '#ef4444' : '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          {isSaving ? 'Saving...' : 
           saveStatus === 'success' ? '✅ Saved' :
           saveStatus === 'error' ? '❌ Error' : '💾 Save Profile'}
        </button>
      </div>

      {/* Agent Selector */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          color: '#cccccc', 
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          Select Agent:
        </label>
        <select
          value={currentAgent}
          onChange={(e) => setCurrentAgent(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            background: '#2d2d2d',
            border: '1px solid #3e3e3e',
            color: '#cccccc',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          {agentOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div style={{ 
          fontSize: '11px', 
          color: '#8c8c8c', 
          marginTop: '4px' 
        }}>
          {agentOptions.find(opt => opt.value === currentAgent)?.description}
        </div>
      </div>

      {/* Code Style Section */}
      <div style={{ 
        background: '#252526', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '16px' 
      }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#007acc', fontSize: '14px' }}>
          📝 Code Style
        </h4>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', color: '#cccccc', fontSize: '12px' }}>
            Language:
          </label>
          <select
            value={currentProfile.codeStyle.language}
            onChange={(e) => updateProfile({
              codeStyle: { ...currentProfile.codeStyle, language: e.target.value }
            })}
            style={{
              width: '100%',
              padding: '6px',
              background: '#2d2d2d',
              border: '1px solid #3e3e3e',
              color: '#cccccc',
              borderRadius: '4px',
              fontSize: '11px'
            }}
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', color: '#cccccc', fontSize: '12px' }}>
            Formatting:
          </label>
          <select
            value={currentProfile.codeStyle.formatting}
            onChange={(e) => updateProfile({
              codeStyle: { ...currentProfile.codeStyle, formatting: e.target.value }
            })}
            style={{
              width: '100%',
              padding: '6px',
              background: '#2d2d2d',
              border: '1px solid #3e3e3e',
              color: '#cccccc',
              borderRadius: '4px',
              fontSize: '11px'
            }}
          >
            <option value="prettier">Prettier</option>
            <option value="eslint">ESLint</option>
            <option value="black">Black</option>
            <option value="rustfmt">Rustfmt</option>
            <option value="gofmt">Gofmt</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ color: '#cccccc', fontSize: '12px' }}>
              Coding Conventions:
            </label>
            <button
              onClick={addConvention}
              style={{
                padding: '4px 8px',
                background: '#007acc',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              + Add
            </button>
          </div>
          
          {currentProfile.codeStyle.conventions.map((convention, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 8px',
              background: '#2d2d2d',
              borderRadius: '4px',
              marginBottom: '4px',
              fontSize: '11px',
              color: '#cccccc'
            }}>
              <span>{convention}</span>
              <button
                onClick={() => removeConvention(index)}
                style={{
                  padding: '2px 6px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontSize: '9px'
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Priorities Section */}
      <div style={{ 
        background: '#252526', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '16px' 
      }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#007acc', fontSize: '14px' }}>
          ⚖️ Priorities (1-10)
        </h4>
        
        {Object.entries(currentProfile.priorities).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ color: '#cccccc', fontSize: '12px', textTransform: 'capitalize' }}>
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </label>
              <span style={{ color: '#007acc', fontSize: '11px', fontWeight: 'bold' }}>
                {value}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={value}
              onChange={(e) => updateProfile({
                priorities: { ...currentProfile.priorities, [key]: parseInt(e.target.value) }
              })}
              style={{ width: '100%' }}
            />
          </div>
        ))}
      </div>

      {/* Constraints Section */}
      <div style={{ 
        background: '#252526', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '16px' 
      }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#007acc', fontSize: '14px' }}>
          🚫 Constraints
        </h4>
        
        <div style={{ marginBottom: '12px' }}>
          <button
            onClick={addConstraint}
            style={{
              padding: '6px 12px',
              background: '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            + Add Constraint
          </button>
        </div>
        
        {currentProfile.constraints.map((constraint, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px',
            background: '#2d2d2d',
            borderRadius: '4px',
            marginBottom: '6px',
            fontSize: '11px',
            color: '#cccccc'
          }}>
            <span>{constraint}</span>
            <button
              onClick={() => removeConstraint(index)}
              style={{
                padding: '2px 6px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '2px',
                cursor: 'pointer',
                fontSize: '9px'
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Libraries Section */}
      <div style={{ 
        background: '#252526', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '16px' 
      }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#007acc', fontSize: '14px' }}>
          📚 Libraries
        </h4>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ color: '#cccccc', fontSize: '12px' }}>
              Preferred Libraries:
            </label>
            <button
              onClick={addPreferredLibrary}
              style={{
                padding: '4px 8px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              + Add
            </button>
          </div>
          
          {currentProfile.libraries.preferred.map((library, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px 8px',
              background: '#064e3b20',
              border: '1px solid #10b981',
              borderRadius: '3px',
              marginBottom: '3px',
              fontSize: '10px',
              color: '#10b981'
            }}>
              <span>{library}</span>
              <button
                onClick={() => removePreferredLibrary(index)}
                style={{
                  padding: '1px 4px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontSize: '8px'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ color: '#cccccc', fontSize: '12px' }}>
              Forbidden Libraries:
            </label>
            <button
              onClick={addForbiddenLibrary}
              style={{
                padding: '4px 8px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              + Add
            </button>
          </div>
          
          {currentProfile.libraries.forbidden.map((library, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px 8px',
              background: '#7f1d1d20',
              border: '1px solid #ef4444',
              borderRadius: '3px',
              marginBottom: '3px',
              fontSize: '10px',
              color: '#ef4444'
            }}>
              <span>{library}</span>
              <button
                onClick={() => removeForbiddenLibrary(index)}
                style={{
                  padding: '1px 4px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontSize: '8px'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Instructions Section */}
      <div style={{ 
        background: '#252526', 
        borderRadius: '8px', 
        padding: '16px' 
      }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#007acc', fontSize: '14px' }}>
          📄 Custom Instructions
        </h4>
        
        <textarea
          value={currentProfile.customInstructions}
          onChange={(e) => updateProfile({ customInstructions: e.target.value })}
          placeholder="Enter custom instructions for this agent...&#10;&#10;Example:&#10;- Always use Zod for validation&#10;- Prefer server actions over API routes&#10;- Add comprehensive error handling&#10;- Include TypeScript types for all functions"
          style={{
            width: '100%',
            height: '120px',
            padding: '8px',
            background: '#2d2d2d',
            border: '1px solid #3e3e3e',
            color: '#cccccc',
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: 'monospace',
            resize: 'vertical'
          }}
        />
        
        <div style={{ 
          fontSize: '10px', 
          color: '#8c8c8c', 
          marginTop: '8px',
          textAlign: 'right'
        }}>
          {currentProfile.customInstructions.length} characters
        </div>
      </div>
    </div>
  );
};

export default AgentBehaviorEditor;
