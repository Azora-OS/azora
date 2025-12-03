import React from 'react';

interface GitPanelProps {
    currentBranch?: string;
}

const GitPanel: React.FC<GitPanelProps> = ({ currentBranch = 'main' }) => {
  const handleCommit = (path: string) => {
    console.log('Committing:', path);
  };

  return (
    <div className="git-panel">
      <div className="git-header">
        <h2>Source Control</h2>
        <span className="branch-name">Branch: {currentBranch}</span>
      </div>
      <div className="git-changes">
        <p>No changes detected.</p>
      </div>
      <div className="git-actions">
        <button onClick={() => handleCommit('.')}>Sync</button>
      </div>
    </div>
  );
};

export default GitPanel;
