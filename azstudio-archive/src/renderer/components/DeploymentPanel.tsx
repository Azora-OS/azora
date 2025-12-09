import React, { useState, useEffect } from 'react';
import './DeploymentPanel.css';

interface EnvironmentConfig {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production';
}

export const DeploymentPanel: React.FC = () => {
  const [environments, setEnvironments] = useState<EnvironmentConfig[]>([]);

  useEffect(() => {
    // Mock load for now to satisfy build
    setEnvironments([
        { id: '1', name: 'Dev', type: 'development' }
    ]);
  }, []);

  return (
    <div className="deployment-panel">
      <div className="deployment-header">
        <h2>Deployment</h2>
      </div>
      <div className="deployment-content">
        <div className="environment-list">
          <h3>Environments</h3>
          {environments.map(env => (
            <div key={env.id} className="environment-item">
              <span className="env-name">{env.name}</span>
              <span className={`env-type ${env.type}`}>{env.type}</span>
            </div>
          ))}
        </div>
        <div className="environment-details">
            <p>Select an environment to view details.</p>
        </div>
      </div>
    </div>
  );
};

export default DeploymentPanel;
