// Conflict Resolution System for AzStudio Multi-Agent Mode
// Auto and manual conflict resolution for agent changes

import React, { useState, useEffect } from 'react';
import { ElaraOrchestrator, AgentConflict, Resolution } from '../services/ElaraOrchestrator';
import { MultiAgentRuntime, MergeConflict } from '../services/MultiAgentRuntime';
import { GenesisStation } from '../services/GenesisStation';

interface ConflictData {
  id: string;
  type: 'file_conflict' | 'design_conflict' | 'requirement_conflict' | 'resource_conflict';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'resolving' | 'resolved' | 'escalated';
  description: string;
  involvedAgents: string[];
  file?: string;
  timestamp: Date;
  suggestedResolutions: Array<{
    strategy: string;
    description: string;
    pros: string[];
    cons: string[];
    confidence: number;
  }>;
  resolution?: Resolution;
  resolutionAttempts: number;
}

interface ConflictResolutionProps {
  projectId: string;
  elaraOrchestrator: ElaraOrchestrator;
  multiAgentRuntime: MultiAgentRuntime;
  genesisStation: GenesisStation;
  onConflictResolved?: (conflictId: string) => void;
}

const ConflictResolution: React.FC<ConflictResolutionProps> = ({
  projectId,
  elaraOrchestrator,
  multiAgentRuntime,
  genesisStation,
  onConflictResolved
}) => {
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<ConflictData | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [autoResolveEnabled, setAutoResolveEnabled] = useState(true);
  const [resolutionHistory, setResolutionHistory] = useState<Resolution[]>([]);
  const [showMergePreview, setShowMergePreview] = useState(false);
  const [mergePreview, setMergePreview] = useState<{
    base: string;
    changes: Array<{ agent: string; content: string; color: string }>;
    suggested: string;
  } | null>(null);

  // Conflict statistics
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    resolved: 0,
    autoResolved: 0,
    manuallyResolved: 0
  });

  useEffect(() => {
    loadConflicts();
    startConflictMonitoring();
    
    return () => {
      stopConflictMonitoring();
    };
  }, [projectId]);

  useEffect(() => {
    updateStats();
  }, [conflicts]);

  const loadConflicts = async () => {
    try {
      // Load existing conflicts from Genesis Station
      const projectContext = await genesisStation.getProjectContext(projectId);
      if (projectContext) {
        const activeBlockers = projectContext.activeContext.blockers;
        const conflictData: ConflictData[] = activeBlockers.map(blocker => ({
          id: blocker.id,
          type: 'resource_conflict', // Default type, would be determined by blocker analysis
          severity: blocker.severity,
          status: 'pending',
          description: blocker.description,
          involvedAgents: blocker.blockedAgents,
          timestamp: blocker.createdAt,
          suggestedResolutions: [{
            strategy: 'manual_intervention',
            description: 'Requires manual resolution',
            pros: ['User control'],
            cons: ['Time consuming'],
            confidence: 100
          }],
          resolutionAttempts: 0
        }));
        
        setConflicts(conflictData);
      }
    } catch (error) {
      console.error('Failed to load conflicts:', error);
    }
  };

  const startConflictMonitoring = () => {
    // Monitor for new conflicts every 5 seconds
    const interval = setInterval(async () => {
      await checkForNewConflicts();
    }, 5000);
    
    return () => clearInterval(interval);
  };

  const stopConflictMonitoring = () => {
    // Cleanup monitoring
  };

  const checkForNewConflicts = async () => {
    try {
      // Check for file conflicts
      const fileConflicts = await detectFileConflicts();
      
      // Check for design conflicts
      const designConflicts = await detectDesignConflicts();
      
      // Check for requirement conflicts
      const requirementConflicts = await detectRequirementConflicts();
      
      // Check for resource conflicts
      const resourceConflicts = await detectResourceConflicts();
      
      const newConflicts = [...fileConflicts, ...designConflicts, ...requirementConflicts, ...resourceConflicts];
      
      if (newConflicts.length > 0) {
        setConflicts(prev => [...prev, ...newConflicts]);
        
        // Auto-resolve if enabled and conflicts are low severity
        if (autoResolveEnabled) {
          await attemptAutoResolution(newConflicts);
        }
      }
    } catch (error) {
      console.error('Error checking for conflicts:', error);
    }
  };

  const detectFileConflicts = async (): Promise<ConflictData[]> => {
    // Simulate file conflict detection
    // In reality, this would analyze file changes from different agents
    return [];
  };

  const detectDesignConflicts = async (): Promise<ConflictData[]> => {
    // Simulate design conflict detection
    // This would check if agent implementations contradict design choices
    return [];
  };

  const detectRequirementConflicts = async (): Promise<ConflictData[]> => {
    // Simulate requirement conflict detection
    // This would check if new requirements invalidate existing work
    return [];
  };

  const detectResourceConflicts = async (): Promise<ConflictData[]> => {
    // Simulate resource conflict detection
    // This would check if multiple agents are trying to use the same resources
    return [];
  };

  const attemptAutoResolution = async (conflictsToResolve: ConflictData[]) => {
    for (const conflict of conflictsToResolve) {
      if (conflict.severity === 'low' || conflict.severity === 'medium') {
        try {
          await resolveConflict(conflict.id, 'auto_merge');
        } catch (error) {
          console.error(`Auto-resolution failed for conflict ${conflict.id}:`, error);
        }
      }
    }
  };

  const resolveConflict = async (conflictId: string, strategy: string) => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    setIsResolving(true);
    
    try {
      // Update conflict status
      setConflicts(prev => prev.map(c => 
        c.id === conflictId ? { ...c, status: 'resolving' } : c
      ));

      // Create resolution request
      const resolutionRequest: AgentConflict = {
        id: conflict.id,
        type: conflict.type,
        involvedAgents: conflict.involvedAgents,
        description: conflict.description,
        severity: conflict.severity,
        context: {
          file: conflict.file,
          strategy
        },
        timestamp: conflict.timestamp,
        suggestedResolutions: conflict.suggestedResolutions
      };

      // Let Elara handle the resolution
      const resolution = await elaraOrchestrator.resolveConflict(resolutionRequest);

      // Update conflict with resolution
      setConflicts(prev => prev.map(c => 
        c.id === conflictId ? { 
          ...c, 
          status: 'resolved',
          resolution,
          resolutionAttempts: c.resolutionAttempts + 1
        } : c
      ));

      // Add to resolution history
      setResolutionHistory(prev => [resolution, ...prev]);

      // Notify parent
      onConflictResolved?.(conflictId);

    } catch (error) {
      console.error(`Failed to resolve conflict ${conflictId}:`, error);
      
      // Update conflict status back to pending
      setConflicts(prev => prev.map(c => 
        c.id === conflictId ? { ...c, status: 'pending' } : c
      ));
    } finally {
      setIsResolving(false);
    }
  };

  const handleManualResolution = async (conflictId: string, customResolution: string) => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    const manualResolution: Resolution = {
      strategy: 'user_decision',
      resolvedContent: customResolution,
      requiresUserInput: false,
      resolutionNotes: 'Manually resolved by user',
      appliedBy: 'user',
      timestamp: new Date()
    };

    setConflicts(prev => prev.map(c => 
      c.id === conflictId ? { 
        ...c, 
        status: 'resolved',
        resolution: manualResolution,
        resolutionAttempts: c.resolutionAttempts + 1
      } : c
    ));

    setResolutionHistory(prev => [manualResolution, ...prev]);
    onConflictResolved?.(conflictId);
  };

  const escalateConflict = async (conflictId: string) => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    setConflicts(prev => prev.map(c => 
      c.id === conflictId ? { ...c, status: 'escalated', severity: 'critical' } : c
    ));

    // Log escalation to Genesis Station
    await genesisStation.logImplementation({
      projectId,
      agent: 'Elara',
      decision: 'conflict_escalation',
      impact: `Conflict ${conflictId} escalated to critical severity`,
      filesChanged: conflict.file ? [conflict.file] : [],
      requirementsUpdated: [],
      designChoicesUpdated: [],
      qualityMetrics: {}
    });
  };

  const showMergeDiff = async (conflict: ConflictData) => {
    if (conflict.type !== 'file_conflict' || !conflict.file) return;

    try {
      // Get merge conflict details
      const mergeConflict: MergeConflict = {
        id: conflict.id,
        file: conflict.file!,
        agentChanges: [
          {
            agent: conflict.involvedAgents[0] || 'Unknown',
            content: '// Agent 1 changes\nconst x = 1;\n',
            lineStart: 10,
            lineEnd: 12
          },
          {
            agent: conflict.involvedAgents[1] || 'Unknown',
            content: '// Agent 2 changes\nconst x = 2;\n',
            lineStart: 10,
            lineEnd: 12
          }
        ],
        baseVersion: '// Base version\nconst x = 0;\n',
        timestamp: conflict.timestamp
      };

      setMergePreview({
        base: mergeConflict.baseVersion,
        changes: mergeConflict.agentChanges.map(change => ({
          agent: change.agent,
          content: change.content,
          color: getAgentColor(change.agent)
        })),
        suggested: '// Suggested merge\nconst x = 1; // Using Agent 1\'s version\n'
      });

      setShowMergePreview(true);
    } catch (error) {
      console.error('Failed to load merge preview:', error);
    }
  };

  const getAgentColor = (agentName: string): string => {
    const colors: Record<string, string> = {
      'Zola': '#3b82f6',
      'Jabari': '#ef4444',
      'Kofi': '#10b981',
      'Abeni': '#f59e0b',
      'Nexus': '#8b5cf6'
    };
    return colors[agentName] || '#666666';
  };

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      'critical': '#dc2626',
      'high': '#ea580c',
      'medium': '#d97706',
      'low': '#65a30d'
    };
    return colors[severity] || '#6b7280';
  };

  const getStatusIcon = (status: string): string => {
    const icons: Record<string, string> = {
      'pending': '⏳',
      'resolving': '🔄',
      'resolved': '✅',
      'escalated': '🚨'
    };
    return icons[status] || '❓';
  };

  const getTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      'file_conflict': '📄',
      'design_conflict': '🎨',
      'requirement_conflict': '📋',
      'resource_conflict': '⚙️'
    };
    return icons[type] || '❓';
  };

  const updateStats = () => {
    const newStats = {
      total: conflicts.length,
      critical: conflicts.filter(c => c.severity === 'critical').length,
      high: conflicts.filter(c => c.severity === 'high').length,
      medium: conflicts.filter(c => c.severity === 'medium').length,
      low: conflicts.filter(c => c.severity === 'low').length,
      resolved: conflicts.filter(c => c.status === 'resolved').length,
      autoResolved: conflicts.filter(c => c.resolution?.strategy === 'auto_merge').length,
      manuallyResolved: conflicts.filter(c => c.resolution?.strategy === 'user_decision').length
    };
    
    setStats(newStats);
  };

  const filteredConflicts = conflicts.filter(c => c.status !== 'resolved');

  return (
    <div style={{ 
      padding: '16px', 
      height: '100%', 
      overflow: 'auto',
      background: '#1e1e1e',
      display: 'grid',
      gridTemplateColumns: '400px 1fr',
      gap: '16px'
    }}>
      
      {/* Conflict List */}
      <div style={{ 
        background: '#252526', 
        borderRadius: '8px', 
        padding: '16px',
        overflow: 'auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '16px' 
        }}>
          <h3 style={{ margin: 0, color: '#007acc', fontSize: '14px' }}>
            ⚔️ Active Conflicts
          </h3>
          
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            fontSize: '11px', 
            color: '#cccccc' 
          }}>
            <input
              type="checkbox"
              checked={autoResolveEnabled}
              onChange={(e) => setAutoResolveEnabled(e.target.checked)}
              style={{ marginRight: '6px' }}
            />
            Auto-resolve
          </label>
        </div>

        {/* Statistics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '8px', 
          marginBottom: '16px' 
        }}>
          <div style={{ 
            background: '#2d2d2d', 
            padding: '8px', 
            borderRadius: '4px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#007acc' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '9px', color: '#8c8c8c' }}>Total</div>
          </div>
          <div style={{ 
            background: '#2d2d2d', 
            padding: '8px', 
            borderRadius: '4px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ef4444' }}>
              {stats.critical}
            </div>
            <div style={{ fontSize: '9px', color: '#8c8c8c' }}>Critical</div>
          </div>
          <div style={{ 
            background: '#2d2d2d', 
            padding: '8px', 
            borderRadius: '4px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981' }}>
              {stats.resolved}
            </div>
            <div style={{ fontSize: '9px', color: '#8c8c8c' }}>Resolved</div>
          </div>
        </div>

        {/* Conflict Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredConflicts.map(conflict => (
            <div
              key={conflict.id}
              className={`conflict-item ${selectedConflict?.id === conflict.id ? 'selected' : ''}`}
              onClick={() => setSelectedConflict(conflict)}
              style={{
                padding: '12px',
                background: selectedConflict?.id === conflict.id ? '#007acc20' : '#2d2d2d',
                border: `1px solid ${selectedConflict?.id === conflict.id ? '#007acc' : '#3e3e3e'}`,
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ marginRight: '8px', fontSize: '16px' }}>
                  {getTypeIcon(conflict.type)}
                </span>
                <span style={{ marginRight: '8px', fontSize: '12px' }}>
                  {getStatusIcon(conflict.status)}
                </span>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: getSeverityColor(conflict.severity),
                    marginRight: '8px'
                  }}
                />
                <span style={{ 
                  color: '#cccccc', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  flex: 1
                }}>
                  {conflict.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              
              <div style={{ 
                fontSize: '11px', 
                color: '#8c8c8c', 
                marginBottom: '6px',
                lineHeight: '1.3'
              }}>
                {conflict.description}
              </div>
              
              {conflict.file && (
                <div style={{ 
                  fontSize: '10px', 
                  color: '#007acc', 
                  marginBottom: '4px' 
                }}>
                  📁 {conflict.file}
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '10px', color: '#8c8c8c' }}>
                  👤 {conflict.involvedAgents.join(', ')}
                </div>
                <div style={{ fontSize: '10px', color: '#8c8c8c' }}>
                  {conflict.resolutionAttempts > 0 && `Attempts: ${conflict.resolutionAttempts}`}
                </div>
              </div>
            </div>
          ))}
          
          {filteredConflicts.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              color: '#8c8c8c', 
              padding: '40px 0',
              fontSize: '12px'
            }}>
              ✅ No active conflicts
            </div>
          )}
        </div>
      </div>

      {/* Conflict Details */}
      <div style={{ 
        background: '#252526', 
        borderRadius: '8px', 
        padding: '16px',
        overflow: 'auto'
      }}>
        {selectedConflict ? (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '16px' 
            }}>
              <h3 style={{ margin: 0, color: '#007acc', fontSize: '14px' }}>
                Conflict Details: {selectedConflict.id}
              </h3>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedConflict.type === 'file_conflict' && (
                  <button
                    onClick={() => showMergeDiff(selectedConflict)}
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
                    📊 Show Diff
                  </button>
                )}
              </div>
            </div>

            {/* Conflict Information */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '4px', 
                  color: '#cccccc', 
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  Type & Severity:
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    background: '#2d2d2d', 
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#cccccc'
                  }}>
                    {getTypeIcon(selectedConflict.type)} {selectedConflict.type.replace(/_/g, ' ')}
                  </span>
                  <span style={{ 
                    padding: '4px 8px', 
                    background: `${getSeverityColor(selectedConflict.severity)}20`,
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: getSeverityColor(selectedConflict.severity),
                    border: `1px solid ${getSeverityColor(selectedConflict.severity)}`
                  }}>
                    {selectedConflict.severity.toUpperCase()}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '4px', 
                  color: '#cccccc', 
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  Description:
                </label>
                <div style={{ 
                  padding: '8px', 
                  background: '#2d2d2d', 
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: '#cccccc',
                  lineHeight: '1.4'
                }}>
                  {selectedConflict.description}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '4px', 
                  color: '#cccccc', 
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  Involved Agents:
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {selectedConflict.involvedAgents.map(agent => (
                    <span
                      key={agent}
                      style={{
                        padding: '4px 8px',
                        background: `${getAgentColor(agent)}20`,
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: getAgentColor(agent),
                        border: `1px solid ${getAgentColor(agent)}`
                      }}
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggested Resolutions */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                color: '#007acc', 
                fontSize: '12px' 
              }}>
                💡 Suggested Resolutions:
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedConflict.suggestedResolutions.map((resolution, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    background: '#2d2d2d',
                    borderRadius: '6px',
                    border: '1px solid #3e3e3e'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{ 
                        color: '#cccccc', 
                        fontSize: '11px', 
                        fontWeight: 'bold' 
                      }}>
                        {resolution.strategy.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span style={{ 
                        color: '#10b981', 
                        fontSize: '10px',
                        background: '#10b98120',
                        padding: '2px 6px',
                        borderRadius: '3px'
                      }}>
                        {resolution.confidence}% confidence
                      </span>
                    </div>
                    
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#8c8c8c', 
                      marginBottom: '8px',
                      lineHeight: '1.3'
                    }}>
                      {resolution.description}
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '10px', color: '#10b981', marginBottom: '2px' }}>
                        ✅ Pros:
                      </div>
                      <ul style={{ margin: '0 0 8px 0', paddingLeft: '16px' }}>
                        {resolution.pros.map((pro, i) => (
                          <li key={i} style={{ fontSize: '9px', color: '#8c8c8c', marginBottom: '2px' }}>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '10px', color: '#ef4444', marginBottom: '2px' }}>
                        ❌ Cons:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '16px' }}>
                        {resolution.cons.map((con, i) => (
                          <li key={i} style={{ fontSize: '9px', color: '#8c8c8c', marginBottom: '2px' }}>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <button
                      onClick={() => resolveConflict(selectedConflict.id, resolution.strategy)}
                      disabled={isResolving}
                      style={{
                        marginTop: '12px',
                        padding: '6px 12px',
                        background: isResolving ? '#666' : '#007acc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isResolving ? 'not-allowed' : 'pointer',
                        fontSize: '10px',
                        width: '100%'
                      }}
                    >
                      {isResolving ? 'Resolving...' : `Apply ${resolution.strategy}`}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Resolution */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                color: '#007acc', 
                fontSize: '12px' 
              }}>
                ✏️ Manual Resolution:
              </h4>
              
              <textarea
                placeholder="Enter custom resolution..."
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '8px',
                  background: '#2d2d2d',
                  border: '1px solid #3e3e3e',
                  color: '#cccccc',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  marginBottom: '8px'
                }}
              />
              
              <button
                onClick={() => {
                  const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                  if (textarea?.value) {
                    handleManualResolution(selectedConflict.id, textarea.value);
                  }
                }}
                style={{
                  padding: '6px 12px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  marginRight: '8px'
                }}
              >
                Apply Manual Resolution
              </button>
              
              <button
                onClick={() => escalateConflict(selectedConflict.id)}
                style={{
                  padding: '6px 12px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px'
                }}
              >
                🚨 Escalate
              </button>
            </div>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            color: '#8c8c8c', 
            padding: '60px 0',
            fontSize: '12px'
          }}>
            Select a conflict to view details
          </div>
        )}
      </div>

      {/* Merge Preview Modal */}
      {showMergePreview && mergePreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#252526',
            borderRadius: '8px',
            padding: '20px',
            width: '80%',
            height: '80%',
            maxWidth: '800px',
            overflow: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '16px' 
            }}>
              <h3 style={{ margin: 0, color: '#007acc' }}>
                📊 Merge Conflict Preview
              </h3>
              <button
                onClick={() => setShowMergePreview(false)}
                style={{
                  padding: '4px 8px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Close
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <h4 style={{ color: '#cccccc', fontSize: '12px', marginBottom: '8px' }}>
                  Base Version:
                </h4>
                <pre style={{
                  background: '#1e1e1e',
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: '#cccccc',
                  overflow: 'auto',
                  height: '200px'
                }}>
                  {mergePreview.base}
                </pre>
              </div>
              
              <div>
                <h4 style={{ color: '#cccccc', fontSize: '12px', marginBottom: '8px' }}>
                  Agent Changes:
                </h4>
                {mergePreview.changes.map((change, index) => (
                  <div key={index} style={{ marginBottom: '8px' }}>
                    <div style={{ 
                      color: change.color, 
                      fontSize: '10px', 
                      marginBottom: '4px',
                      fontWeight: 'bold'
                    }}>
                      {change.agent}:
                    </div>
                    <pre style={{
                      background: `${change.color}10`,
                      border: `1px solid ${change.color}40`,
                      padding: '8px',
                      borderRadius: '4px',
                      fontSize: '9px',
                      color: change.color,
                      overflow: 'auto',
                      height: '60px'
                    }}>
                      {change.content}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ color: '#cccccc', fontSize: '12px', marginBottom: '8px' }}>
                Suggested Resolution:
              </h4>
              <pre style={{
                background: '#064e3b20',
                border: '1px solid #10b981',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '10px',
                color: '#10b981',
                overflow: 'auto',
                height: '100px'
              }}>
                {mergePreview.suggested}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConflictResolution;
