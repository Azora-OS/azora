import React, { useState, useEffect } from 'react';
import './VerificationPanel.css';

const VerificationPanel = ({ onIssueSelect }) => {
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Mock verification issues - in real implementation, this would come from the orchestrator
    const mockIssues = [
      {
        id: '1',
        type: 'error',
        message: 'Constitutional violation: Code contains insecure practices',
        file: '/src/main/main.ts',
        line: 42,
        column: 15,
        rule: 'security.no-insecure-practices',
        timestamp: Date.now() - 5000
      },
      {
        id: '2',
        type: 'warning',
        message: 'Code complexity exceeds threshold (maintainability concern)',
        file: '/src/renderer/App.tsx',
        line: 128,
        column: 1,
        rule: 'maintainability.complexity',
        timestamp: Date.now() - 3000
      },
      {
        id: '3',
        type: 'info',
        message: 'Consider using TypeScript strict mode for better type safety',
        file: '/tsconfig.json',
        rule: 'typescript.strict-mode',
        timestamp: Date.now() - 1000
      }
    ];

    setIssues(mockIssues);
  }, []);

  const getFilteredIssues = () => {
    if (filter === 'all') return issues;
    return issues.filter(issue => issue.type === filter);
  };

  const getIssueCounts = () => {
    const counts = { error: 0, warning: 0, info: 0 };
    issues.forEach(issue => {
      counts[issue.type]++;
    });
    return counts;
  };

  const handleRunVerification = async () => {
    setIsRunning(true);

    try {
      // TODO: Call orchestrator verification API
      if (window.electronAPI?.orchestrator?.planTask) {
        const result = await window.electronAPI.orchestrator.planTask(
          'Run constitutional verification on current codebase',
          { files: ['src/**/*'], rules: ['security', 'maintainability', 'typescript'] }
        );

        if (result.success) {
          // In a real implementation, we'd get verification results
          console.log('Verification planned:', result.plan);
        }
      }
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleIssueClick = (issue) => {
    if (onIssueSelect) {
      onIssueSelect(issue);
    }
    // TODO: Navigate to file location in editor
  };

  const getIssueIcon = (type) => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  };

  const counts = getIssueCounts();
  const filteredIssues = getFilteredIssues();

  return (
    <div className="verification-panel">
      <div className="panel-header">
        <h3>Constitutional Checks</h3>
        <div className="panel-actions">
          <button
            className="run-verification-btn"
            onClick={handleRunVerification}
            disabled={isRunning}
          >
            {isRunning ? '🔄 Running...' : '🔍 Run Checks'}
          </button>
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({issues.length})
        </button>
        <button
          className={`filter-tab error ${filter === 'error' ? 'active' : ''}`}
          onClick={() => setFilter('error')}
        >
          Errors ({counts.error})
        </button>
        <button
          className={`filter-tab warning ${filter === 'warning' ? 'active' : ''}`}
          onClick={() => setFilter('warning')}
        >
          Warnings ({counts.warning})
        </button>
        <button
          className={`filter-tab info ${filter === 'info' ? 'active' : ''}`}
          onClick={() => setFilter('info')}
        >
          Info ({counts.info})
        </button>
      </div>

      <div className="issues-list">
        {filteredIssues.length === 0 ? (
          <div className="no-issues">
            <div className="no-issues-icon">✅</div>
            <p>No issues found</p>
            <small>Constitutional checks passed</small>
          </div>
        ) : (
          filteredIssues.map(issue => (
            <div
              key={issue.id}
              className={`issue-item ${issue.type}`}
              onClick={() => handleIssueClick(issue)}
            >
              <div className="issue-icon">
                {getIssueIcon(issue.type)}
              </div>
              <div className="issue-content">
                <div className="issue-message">{issue.message}</div>
                <div className="issue-location">
                  {issue.file}
                  {issue.line && `:${issue.line}`}
                  {issue.column && `:${issue.column}`}
                </div>
                {issue.rule && (
                  <div className="issue-rule">Rule: {issue.rule}</div>
                )}
              </div>
              <div className="issue-timestamp">
                {new Date(issue.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VerificationPanel;
