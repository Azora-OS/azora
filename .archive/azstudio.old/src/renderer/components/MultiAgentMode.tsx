// Multi-Agent Mode Integration Component for AzStudio
// Main entry point for the multi-agent collaborative IDE features

import React, { useState, useEffect } from 'react';
import { MultiAgentRuntime } from '../services/MultiAgentRuntime';
import { ElaraOrchestrator } from '../services/ElaraOrchestrator';
import { GenesisStation } from '../services/GenesisStation';
import { BuildSpacesAPI, useBuildSpaces } from '../services/BuildSpacesAPI';

// Component imports
import RealTimeCollaboration from './RealTimeCollaboration';
import AgentBehaviorEditor from './AgentBehaviorEditor';
import ConflictResolution from './ConflictResolution';
import UserInteraction from './UserInteraction';

interface MultiAgentModeProps {
  projectId: string;
  onModeChange?: (mode: 'collaboration' | 'behavior' | 'conflicts' | 'chat') => void;
}

const MultiAgentMode: React.FC<MultiAgentModeProps> = ({
  projectId,
  onModeChange
}) => {
  const [activeMode, setActiveMode] = useState<'collaboration' | 'behavior' | 'conflicts' | 'chat'>('collaboration');
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [agentsInitialized, setAgentsInitialized] = useState(false);
  
  // Initialize core services
  const [multiAgentRuntime] = useState(() => new MultiAgentRuntime());
  const [genesisStation] = useState(() => new GenesisStation());
  const [elaraOrchestrator] = useState(() => new ElaraOrchestrator(multiAgentRuntime, genesisStation));
  
  // BuildSpaces integration
  const { api: buildSpacesAPI, isConnected: buildSpacesConnected } = useBuildSpaces({
    projectId,
    autoConnect: true,
    onError: (error) => console.error('BuildSpaces error:', error)
  });

  // Initialize the multi-agent system
  useEffect(() => {
    initializeMultiAgentSystem();
  }, [projectId]);

  const initializeMultiAgentSystem = async () => {
    try {
      console.log('🚀 Initializing AzStudio Multi-Agent Mode...');
      
      // Step 1: Initialize Genesis Station
      await genesisStation.startPeriodicSync(projectId, 5);
      console.log('✅ Genesis Station initialized');
      
      // Step 2: Initialize Elara Orchestrator
      await elaraOrchestrator.syncWithGenesisStation(projectId);
      console.log('✅ Elara Orchestrator synced with Genesis Station');
      
      // Step 3: Initialize agents
      const agentNames = ['Zola', 'Jabari', 'Kofi', 'Abeni', 'Nexus'];
      await multiAgentRuntime.initializeAgents(projectId, agentNames);
      setAgentsInitialized(true);
      console.log('✅ Agents initialized:', agentNames.join(', '));
      
      // Step 4: Connect to BuildSpaces if available
      if (buildSpacesConnected) {
        console.log('✅ Connected to BuildSpaces Citadel');
        // Sync with BuildSpaces
        try {
          await buildSpacesAPI.updateGenesisStation(projectId, {
            agents: agentNames,
            orchestrator: 'Elara',
            runtime: 'MultiAgentRuntime'
          });
        } catch (error) {
          console.warn('⚠️ Failed to sync with BuildSpaces:', error);
        }
      } else {
        console.log('⚠️ BuildSpaces not available, running in standalone mode');
      }
      
      // Step 5: Start monitoring
      startSystemMonitoring();
      
      setIsInitialized(true);
      console.log('🎉 Multi-Agent Mode fully initialized!');
      
    } catch (error) {
      console.error('❌ Failed to initialize Multi-Agent Mode:', error);
      setInitializationError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const startSystemMonitoring = () => {
    // Monitor agent status changes
    multiAgentRuntime.on('agent_status_change', (data) => {
      console.log('📊 Agent status change:', data);
    });
    
    // Monitor conflicts
    multiAgentRuntime.on('conflict_detected', (data) => {
      console.log('⚔️ Conflict detected:', data);
      // Auto-switch to conflicts view for critical conflicts
      if (data.severity === 'critical') {
        setActiveMode('conflicts');
      }
    });
    
    // Monitor progress
    elaraOrchestrator.on('progress_update', (data) => {
      console.log('📈 Progress update:', data);
    });
    
    // Monitor Genesis Station updates
    genesisStation.on('context_updated', (data) => {
      console.log('📖 Genesis Station updated:', data.projectId);
    });
  };

  const handleModeChange = (mode: typeof activeMode) => {
    setActiveMode(mode);
    onModeChange?.(mode);
  };

  const handleAgentClick = (agentName: string) => {
    // Switch to chat mode and select the specific agent
    setActiveMode('chat');
  };

  const handleTaskClick = (taskId: string) => {
    // Could open task details or switch to collaboration view
    console.log('Task clicked:', taskId);
  };

  const handleFileClick = (filePath: string) => {
    // Could open file in editor
    console.log('File clicked:', filePath);
  };

  const handleConflictResolved = (conflictId: string) => {
    console.log('Conflict resolved:', conflictId);
    // Could show notification or update UI
  };

  const handleTaskCreated = (taskId: string) => {
    console.log('Task created:', taskId);
    // Could update task board or show notification
  };

  const handleAgentInstruction = (agentName: string, instruction: string) => {
    console.log(`Agent instruction sent to ${agentName}:`, instruction);
    // Could update agent status or show confirmation
  };

  const handleProfileUpdate = (agentName: string, profile: any) => {
    console.log(`Agent profile updated for ${agentName}:`, profile);
    // Could show confirmation or update UI
  };

  if (initializationError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '40px',
        background: '#1e1e1e',
        color: '#cccccc'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <h2 style={{ margin: '0 0 16px 0', color: '#ef4444' }}>
          Initialization Failed
        </h2>
        <p style={{ margin: '0 0 24px 0', textAlign: 'center', color: '#8c8c8c' }}>
          {initializationError}
        </p>
        <button
          onClick={initializeMultiAgentSystem}
          style={{
            padding: '12px 24px',
            background: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Retry Initialization
        </button>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '40px',
        background: '#1e1e1e',
        color: '#cccccc'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>🔄</div>
        <h2 style={{ margin: '0 0 16px 0', color: '#007acc' }}>
          Initializing Multi-Agent Mode
        </h2>
        <p style={{ margin: '0 0 8px 0', color: '#8c8c8c' }}>
          Setting up collaborative development environment...
        </p>
        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
          {agentsInitialized ? '✅ Agents Ready' : '⏳ Initializing Agents...'}
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e' }}>
      
      {/* Mode Selector */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #3e3e3e',
        background: '#252526'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h3 style={{ margin: 0, color: '#007acc', fontSize: '14px' }}>
            🤖 Multi-Agent Mode
          </h3>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: buildSpacesConnected ? '#10b981' : '#f59e0b'
            }} />
            <span style={{ fontSize: '10px', color: '#8c8c8c' }}>
              {buildSpacesConnected ? 'BuildSpaces Connected' : 'Standalone Mode'}
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleModeChange('collaboration')}
            style={{
              padding: '6px 12px',
              background: activeMode === 'collaboration' ? '#007acc' : '#2d2d2d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            🤝 Collaboration
          </button>
          <button
            onClick={() => handleModeChange('chat')}
            style={{
              padding: '6px 12px',
              background: activeMode === 'chat' ? '#007acc' : '#2d2d2d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            💬 Chat
          </button>
          <button
            onClick={() => handleModeChange('behavior')}
            style={{
              padding: '6px 12px',
              background: activeMode === 'behavior' ? '#007acc' : '#2d2d2d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            ⚙️ Agent Behavior
          </button>
          <button
            onClick={() => handleModeChange('conflicts')}
            style={{
              padding: '6px 12px',
              background: activeMode === 'conflicts' ? '#007acc' : '#2d2d2d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            ⚔️ Conflicts
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeMode === 'collaboration' && (
          <RealTimeCollaboration
            projectId={projectId}
            multiAgentRuntime={multiAgentRuntime}
            elaraOrchestrator={elaraOrchestrator}
            genesisStation={genesisStation}
            onAgentClick={handleAgentClick}
            onTaskClick={handleTaskClick}
            onFileClick={handleFileClick}
          />
        )}
        
        {activeMode === 'chat' && (
          <UserInteraction
            projectId={projectId}
            elaraOrchestrator={elaraOrchestrator}
            multiAgentRuntime={multiAgentRuntime}
            genesisStation={genesisStation}
            onTaskCreated={handleTaskCreated}
            onAgentInstruction={handleAgentInstruction}
          />
        )}
        
        {activeMode === 'behavior' && (
          <AgentBehaviorEditor
            projectId={projectId}
            genesisStation={genesisStation}
            onProfileUpdate={handleProfileUpdate}
          />
        )}
        
        {activeMode === 'conflicts' && (
          <ConflictResolution
            projectId={projectId}
            elaraOrchestrator={elaraOrchestrator}
            multiAgentRuntime={multiAgentRuntime}
            genesisStation={genesisStation}
            onConflictResolved={handleConflictResolved}
          />
        )}
      </div>
    </div>
  );
};

export default MultiAgentMode;
