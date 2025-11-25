/**
 * DeploymentPanel Component
 * 
 * UI for managing deployment configurations, environments, and deployment targets.
 */

import React, { useState, useEffect } from 'react';
import './DeploymentPanel.css';

interface EnvironmentConfig {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production';
  variables: Record<string, string>;
  secrets: Record<string, string>;
  deploymentTarget?: 'vercel' | 'railway' | 'docker' | 'custom';
  targetConfig?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface DeploymentStatus {
  environmentId: string;
  target: string;
  status: 'idle' | 'deploying' | 'deployed' | 'failed';
  lastDeployment?: any;
  liveUrl?: string;
  health?: 'healthy' | 'unhealthy' | 'unknown';
}

interface ServiceMetrics {
  url: string;
  uptime: number;
  avgResponseTime: number;
  errorRate: number;
  totalRequests: number;
  errors: Array<{
    timestamp: Date;
    message: string;
    statusCode?: number;
  }>;
}

export const DeploymentPanel: React.FC = () => {
  const [environments, setEnvironments] = useState<EnvironmentConfig[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'variables' | 'secrets' | 'target' | 'monitoring'>('variables');
  const [deploymentStatus, setDeploymentStatus] = useState<Map<string, DeploymentStatus>>(new Map());
  const [metrics, setMetrics] = useState<ServiceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // New environment form
  const [showNewEnvForm, setShowNewEnvForm] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [newEnvType, setNewEnvType] = useState<'development' | 'staging' | 'production'>('development');
  
  // Variable/Secret form
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  
  // Target configuration
  const [targetType, setTargetType] = useState<'vercel' | 'railway' | 'docker' | 'custom'>('vercel');
  const [targetConfig, setTargetConfig] = useState<any>({});

  useEffect(() => {
    loadEnvironments();
  }, []);

  useEffect(() => {
    if (selectedEnv) {
      loadDeploymentStatus(selectedEnv);
      loadMetrics(selectedEnv);
    }
  }, [selectedEnv]);

  useEffect(() => {
    // Set up monitoring interval for deployed services
    const interval = setInterval(() => {
      if (selectedEnv && status?.status === 'deployed' && status.liveUrl) {
        loadMetrics(selectedEnv);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [selectedEnv, status]);

  const loadEnvironments = async () => {
    try {
      const envs = await window.electron.deployment.getEnvironments();
      setEnvironments(envs);
      if (envs.length > 0 && !selectedEnv) {
        setSelectedEnv(envs[0].id);
      }
    } catch (error) {
      console.error('Failed to load environments:', error);
    }
  };

  const loadDeploymentStatus = async (envId: string) => {
    try {
      const status = await window.electron.deployment.getDeploymentStatus(envId);
      setDeploymentStatus(prev => new Map(prev).set(envId, status));
    } catch (error) {
      console.error('Failed to load deployment status:', error);
    }
  };

  const loadMetrics = async (envId: string) => {
    try {
      const metricsData = await window.electron.deployment.getMetrics(envId);
      setMetrics(metricsData);
      setIsMonitoring(await window.electron.deployment.isMonitoring(envId));
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const handleStartMonitoring = async () => {
    if (!selectedEnv || !status?.liveUrl) return;

    try {
      await window.electron.deployment.startMonitoring(selectedEnv, {
        url: status.liveUrl,
        interval: 30000,
        timeout: 10000,
      });
      setIsMonitoring(true);
      await loadMetrics(selectedEnv);
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    }
  };

  const handleStopMonitoring = async () => {
    if (!selectedEnv) return;

    try {
      await window.electron.deployment.stopMonitoring(selectedEnv);
      setIsMonitoring(false);
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
    }
  };

  const handleCreateEnvironment = async () => {
    if (!newEnvName.trim()) return;

    try {
      await window.electron.deployment.createEnvironment(newEnvName, newEnvType);
      setShowNewEnvForm(false);
      setNewEnvName('');
      setNewEnvType('development');
      await loadEnvironments();
    } catch (error) {
      console.error('Failed to create environment:', error);
    }
  };

  const handleDeleteEnvironment = async (envId: string) => {
    if (!confirm('Are you sure you want to delete this environment?')) return;

    try {
      await window.electron.deployment.deleteEnvironment(envId);
      if (selectedEnv === envId) {
        setSelectedEnv(null);
      }
      await loadEnvironments();
    } catch (error) {
      console.error('Failed to delete environment:', error);
    }
  };

  const handleAddVariable = async () => {
    if (!selectedEnv || !newVarKey.trim() || !newVarValue.trim()) return;

    try {
      await window.electron.deployment.setEnvironmentVariable(
        selectedEnv,
        newVarKey,
        newVarValue
      );
      setNewVarKey('');
      setNewVarValue('');
      await loadEnvironments();
    } catch (error) {
      console.error('Failed to add variable:', error);
    }
  };

  const handleRemoveVariable = async (key: string) => {
    if (!selectedEnv) return;

    try {
      await window.electron.deployment.removeEnvironmentVariable(selectedEnv, key);
      await loadEnvironments();
    } catch (error) {
      console.error('Failed to remove variable:', error);
    }
  };

  const handleAddSecret = async () => {
    if (!selectedEnv || !newVarKey.trim() || !newVarValue.trim()) return;

    try {
      // First, store the secret in the vault
      const secretId = await window.electron.secrets.setSecret(
        newVarKey,
        newVarValue,
        'project'
      );
      
      // Then reference it in the environment
      await window.electron.deployment.setEnvironmentSecret(
        selectedEnv,
        newVarKey,
        secretId
      );
      
      setNewVarKey('');
      setNewVarValue('');
      await loadEnvironments();
    } catch (error) {
      console.error('Failed to add secret:', error);
    }
  };

  const handleRemoveSecret = async (key: string) => {
    if (!selectedEnv) return;

    try {
      await window.electron.deployment.removeEnvironmentSecret(selectedEnv, key);
      await loadEnvironments();
    } catch (error) {
      console.error('Failed to remove secret:', error);
    }
  };

  const handleSaveTargetConfig = async () => {
    if (!selectedEnv) return;

    try {
      await window.electron.deployment.configureDeploymentTarget(
        selectedEnv,
        targetType,
        targetConfig
      );
      await loadEnvironments();
    } catch (error) {
      console.error('Failed to save target configuration:', error);
    }
  };

  const handleDeploy = async () => {
    if (!selectedEnv) return;

    try {
      const env = environments.find(e => e.id === selectedEnv);
      if (!env?.deploymentTarget) {
        alert('Please configure a deployment target first');
        return;
      }

      // Trigger deployment based on target
      switch (env.deploymentTarget) {
        case 'vercel':
          await window.electron.deployment.deployToVercel(selectedEnv);
          break;
        case 'railway':
          await window.electron.deployment.deployToRailway(selectedEnv);
          break;
        case 'docker':
          await window.electron.deployment.deployToDocker(selectedEnv);
          break;
        default:
          alert('Deployment target not supported yet');
      }

      await loadDeploymentStatus(selectedEnv);
    } catch (error) {
      console.error('Deployment failed:', error);
      alert(`Deployment failed: ${error}`);
    }
  };

  const selectedEnvironment = environments.find(e => e.id === selectedEnv);
  const status = selectedEnv ? deploymentStatus.get(selectedEnv) : undefined;

  return (
    <div className="deployment-panel">
      <div className="deployment-header">
        <h2>Deployment</h2>
        <button
          className="btn-primary"
          onClick={() => setShowNewEnvForm(true)}
        >
          + New Environment
        </button>
      </div>

      <div className="deployment-content">
        {/* Environment List */}
        <div className="environment-list">
          <h3>Environments</h3>
          {environments.map(env => (
            <div
              key={env.id}
              className={`environment-item ${selectedEnv === env.id ? 'selected' : ''}`}
              onClick={() => setSelectedEnv(env.id)}
            >
              <div className="env-info">
                <span className="env-name">{env.name}</span>
                <span className={`env-type ${env.type}`}>{env.type}</span>
              </div>
              {deploymentStatus.get(env.id) && (
                <span className={`env-status ${deploymentStatus.get(env.id)?.status}`}>
                  {deploymentStatus.get(env.id)?.status}
                </span>
              )}
              <button
                className="btn-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteEnvironment(env.id);
                }}
                title="Delete environment"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Environment Details */}
        {selectedEnvironment && (
          <div className="environment-details">
            <div className="details-header">
              <h3>{selectedEnvironment.name}</h3>
              {status && status.status === 'deployed' && status.liveUrl && (
                <a
                  href={status.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="live-url"
                >
                  🔗 {status.liveUrl}
                </a>
              )}
              <button
                className="btn-primary"
                onClick={handleDeploy}
                disabled={status?.status === 'deploying'}
              >
                {status?.status === 'deploying' ? 'Deploying...' : 'Deploy'}
              </button>
            </div>

            {/* Tabs */}
            <div className="details-tabs">
              <button
                className={activeTab === 'variables' ? 'active' : ''}
                onClick={() => setActiveTab('variables')}
              >
                Variables ({Object.keys(selectedEnvironment.variables).length})
              </button>
              <button
                className={activeTab === 'secrets' ? 'active' : ''}
                onClick={() => setActiveTab('secrets')}
              >
                Secrets ({Object.keys(selectedEnvironment.secrets).length})
              </button>
              <button
                className={activeTab === 'target' ? 'active' : ''}
                onClick={() => setActiveTab('target')}
              >
                Deployment Target
              </button>
              <button
                className={activeTab === 'monitoring' ? 'active' : ''}
                onClick={() => setActiveTab('monitoring')}
                disabled={status?.status !== 'deployed'}
              >
                Monitoring
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'variables' && (
                <div className="variables-tab">
                  <div className="add-variable-form">
                    <input
                      type="text"
                      placeholder="Key"
                      value={newVarKey}
                      onChange={(e) => setNewVarKey(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={newVarValue}
                      onChange={(e) => setNewVarValue(e.target.value)}
                    />
                    <button onClick={handleAddVariable}>Add</button>
                  </div>
                  <div className="variables-list">
                    {Object.entries(selectedEnvironment.variables).map(([key, value]) => (
                      <div key={key} className="variable-item">
                        <span className="var-key">{key}</span>
                        <span className="var-value">{value}</span>
                        <button
                          className="btn-icon"
                          onClick={() => handleRemoveVariable(key)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'secrets' && (
                <div className="secrets-tab">
                  <div className="add-secret-form">
                    <input
                      type="text"
                      placeholder="Key"
                      value={newVarKey}
                      onChange={(e) => setNewVarKey(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Value"
                      value={newVarValue}
                      onChange={(e) => setNewVarValue(e.target.value)}
                    />
                    <button onClick={handleAddSecret}>Add</button>
                  </div>
                  <div className="secrets-list">
                    {Object.entries(selectedEnvironment.secrets).map(([key, secretId]) => (
                      <div key={key} className="secret-item">
                        <span className="secret-key">{key}</span>
                        <span className="secret-value">••••••••</span>
                        <button
                          className="btn-icon"
                          onClick={() => handleRemoveSecret(key)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'target' && (
                <div className="target-tab">
                  <div className="target-selector">
                    <label>Deployment Target:</label>
                    <select
                      value={targetType}
                      onChange={(e) => setTargetType(e.target.value as any)}
                    >
                      <option value="vercel">Vercel</option>
                      <option value="railway">Railway</option>
                      <option value="docker">Docker</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  {targetType === 'vercel' && (
                    <div className="target-config">
                      <input
                        type="text"
                        placeholder="Project ID"
                        value={targetConfig.projectId || ''}
                        onChange={(e) => setTargetConfig({ ...targetConfig, projectId: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Team ID (optional)"
                        value={targetConfig.teamId || ''}
                        onChange={(e) => setTargetConfig({ ...targetConfig, teamId: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Framework (optional)"
                        value={targetConfig.framework || ''}
                        onChange={(e) => setTargetConfig({ ...targetConfig, framework: e.target.value })}
                      />
                    </div>
                  )}

                  {targetType === 'railway' && (
                    <div className="target-config">
                      <input
                        type="text"
                        placeholder="Project ID"
                        value={targetConfig.projectId || ''}
                        onChange={(e) => setTargetConfig({ ...targetConfig, projectId: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Service ID (optional)"
                        value={targetConfig.serviceId || ''}
                        onChange={(e) => setTargetConfig({ ...targetConfig, serviceId: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Region (optional)"
                        value={targetConfig.region || ''}
                        onChange={(e) => setTargetConfig({ ...targetConfig, region: e.target.value })}
                      />
                    </div>
                  )}

                  {targetType === 'docker' && (
                    <div className="target-config">
                      <input
                        type="text"
                        placeholder="Registry (e.g., docker.io)"
                        value={targetConfig.registry || ''}
                        onChange={(e) => setTargetConfig({ ...targetConfig, registry: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Image Name"
                        value={targetConfig.imageName || ''}
                        onChange={(e) => setTargetConfig({ ...targetConfig, imageName: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Tag (default: latest)"
                        value={targetConfig.tag || ''}
                        onChange={(e) => setTargetConfig({ ...targetConfig, tag: e.target.value })}
                      />
                    </div>
                  )}

                  <button className="btn-primary" onClick={handleSaveTargetConfig}>
                    Save Configuration
                  </button>
                </div>
              )}

              {activeTab === 'monitoring' && (
                <div className="monitoring-tab">
                  <div className="monitoring-header">
                    <h4>Service Monitoring</h4>
                    {isMonitoring ? (
                      <button className="btn-secondary" onClick={handleStopMonitoring}>
                        Stop Monitoring
                      </button>
                    ) : (
                      <button className="btn-primary" onClick={handleStartMonitoring}>
                        Start Monitoring
                      </button>
                    )}
                  </div>

                  {metrics && (
                    <div className="metrics-display">
                      <div className="metric-card">
                        <div className="metric-label">Uptime</div>
                        <div className="metric-value">{metrics.uptime.toFixed(2)}%</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-label">Avg Response Time</div>
                        <div className="metric-value">{metrics.avgResponseTime.toFixed(0)}ms</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-label">Error Rate</div>
                        <div className="metric-value">{metrics.errorRate.toFixed(2)}%</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-label">Total Requests</div>
                        <div className="metric-value">{metrics.totalRequests}</div>
                      </div>
                    </div>
                  )}

                  {metrics && metrics.errors.length > 0 && (
                    <div className="error-logs">
                      <h5>Recent Errors</h5>
                      <div className="error-list">
                        {metrics.errors.slice(-5).reverse().map((error, index) => (
                          <div key={index} className="error-item">
                            <span className="error-time">
                              {new Date(error.timestamp).toLocaleTimeString()}
                            </span>
                            <span className="error-message">{error.message}</span>
                            {error.statusCode && (
                              <span className="error-code">{error.statusCode}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!metrics && (
                    <div className="no-metrics">
                      <p>No monitoring data available. Start monitoring to see metrics.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Environment Modal */}
      {showNewEnvForm && (
        <div className="modal-overlay" onClick={() => setShowNewEnvForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Environment</h3>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={newEnvName}
                onChange={(e) => setNewEnvName(e.target.value)}
                placeholder="e.g., Production"
              />
            </div>
            <div className="form-group">
              <label>Type:</label>
              <select
                value={newEnvType}
                onChange={(e) => setNewEnvType(e.target.value as any)}
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowNewEnvForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateEnvironment}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
