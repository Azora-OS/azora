import React, { useState } from 'react';

interface StatusBarProps {
  projectPath: string;
  openTabsCount: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ projectPath, openTabsCount }) => {
  const projectName = projectPath ? projectPath.split('\\').pop() : 'No Folder';
  const gitBranch = 'main'; // Would come from Git integration
  const [errors, setErrors] = useState(0); // Dynamic state for errors
  const [warnings, setWarnings] = useState(0); // Dynamic state for warnings

  return (
    <div className="status-bar">
      <div className="status-bar-item">
        📁 {projectName}
      </div>
      
      <div className="status-bar-item separator">|</div>
      
      <div className="status-bar-item">
        🔀 {gitBranch}
      </div>
      
      <div className="status-bar-item separator">|</div>
      
      {errors > 0 && (
        <div className="status-bar-item" style={{ color: '#f14c4c' }}>
          ❌ {errors} {errors === 1 ? 'error' : 'errors'}
        </div>
      )}
      
      {warnings > 0 && (
        <div className="status-bar-item" style={{ color: '#ffcc02' }}>
          ⚠️ {warnings} {warnings === 1 ? 'warning' : 'warnings'}
        </div>
      )}
      
      {openTabsCount > 0 && (
        <>
          <div className="status-bar-item separator">|</div>
          <div className="status-bar-item">
            📄 {openTabsCount} {openTabsCount === 1 ? 'tab' : 'tabs'} open
          </div>
        </>
      )}
      
      <div className="status-bar-item separator">|</div>
      
      <div className="status-bar-item">
        🤖 AI Ready
      </div>
      
      <div className="status-bar-item separator">|</div>
      
      <div className="status-bar-item">
        ⚡ AzStudio v0.1.0
      </div>
    </div>
  );
};

export default StatusBar;
