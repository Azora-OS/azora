/**
 * GitPanel - Git integration UI component
 * 
 * Provides UI for Git operations including staging, committing,
 * viewing history, and managing branches.
 */

import React, { useState, useEffect } from 'react';
import './GitPanel.css';

interface GitPanelProps {
  projectPath: string;
}

interface FileStatus {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'untracked' | 'staged';
  diff?: string;
}

interface CommitInfo {
  oid: string;
  message: string;
  author: string;
  date: Date;
}

interface BranchInfo {
  name: string;
  current: boolean;
  commit: string;
}

export const GitPanel: React.FC<GitPanelProps> = ({ projectPath }) => {
  const [activeTab, setActiveTab] = useState<'changes' | 'history' | 'branches'>('changes');
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [commitMessage, setCommitMessage] = useState('');
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileDiff, setFileDiff] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Git status
  useEffect(() => {
    loadStatus();
    loadBranches();
  }, [projectPath]);

  const loadStatus = async () => {
    try {
      setIsLoading(true);
      const result = await window.electronAPI.git.status(projectPath);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load status');
      }
      const status = result.status;
      
      const fileList: FileStatus[] = [
        ...status.modified.map(path => ({ path, status: 'modified' as const })),
        ...status.added.map(path => ({ path, status: 'added' as const })),
        ...status.deleted.map(path => ({ path, status: 'deleted' as const })),
        ...status.untracked.map(path => ({ path, status: 'untracked' as const })),
        ...status.staged.map(path => ({ path, status: 'staged' as const })),
      ];
      
      setFiles(fileList);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Git status');
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const result = await window.electronAPI.git.log(projectPath, 50);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load history');
      }
      const log = result.commits || [];
      
      const commitList: CommitInfo[] = log.map(commit => ({
        oid: commit.oid,
        message: commit.message,
        author: commit.author.name,
        date: new Date(commit.author.timestamp * 1000),
      }));
      
      setCommits(commitList);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load commit history');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const result = await window.electronAPI.git.listBranches(projectPath);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load branches');
      }
      const branchList = result.branches || [];
      setBranches(branchList);
      
      const current = branchList.find(b => b.current);
      if (current) {
        setCurrentBranch(current.name);
      }
    } catch (err) {
      console.error('Failed to load branches:', err);
    }
  };

  const handleFileSelect = (filepath: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filepath)) {
      newSelected.delete(filepath);
    } else {
      newSelected.add(filepath);
    }
    setSelectedFiles(newSelected);
  };

  const handleFileClick = async (filepath: string) => {
    setSelectedFile(filepath);
    try {
      const result = await window.electronAPI.git.getDiff(projectPath, filepath);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load diff');
      }
      const diff = result.diff || '';
      setFileDiff(diff);
    } catch (err) {
      console.error('Failed to load diff:', err);
      setFileDiff('Failed to load diff');
    }
  };

  const handleStage = async () => {
    if (selectedFiles.size === 0) return;
    
    try {
      setIsLoading(true);
      const result = await window.electronAPI.git.add(projectPath, Array.from(selectedFiles));
      if (!result.success) {
        throw new Error(result.error || 'Failed to stage files');
      }
      setSelectedFiles(new Set());
      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stage files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnstage = async () => {
    if (selectedFiles.size === 0) return;
    
    try {
      setIsLoading(true);
      const result = await window.electronAPI.git.remove(projectPath, Array.from(selectedFiles));
      if (!result.success) {
        throw new Error(result.error || 'Failed to unstage files');
      }
      setSelectedFiles(new Set());
      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unstage files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      setError('Commit message is required');
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await window.electronAPI.git.commit(projectPath, commitMessage);
      if (!result.success) {
        throw new Error(result.error || 'Failed to commit');
      }
      setCommitMessage('');
      await loadStatus();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to commit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadStatus();
    if (activeTab === 'history') {
      loadHistory();
    } else if (activeTab === 'branches') {
      loadBranches();
    }
  };

  const renderChangesTab = () => {
    const unstagedFiles = files.filter(f => f.status !== 'staged');
    const stagedFiles = files.filter(f => f.status === 'staged');

    return (
      <div className="git-changes">
        <div className="git-section">
          <div className="git-section-header">
            <h3>Staged Changes ({stagedFiles.length})</h3>
            {stagedFiles.length > 0 && (
              <button 
                className="git-action-btn"
                onClick={handleUnstage}
                disabled={selectedFiles.size === 0 || isLoading}
              >
                Unstage
              </button>
            )}
          </div>
          <div className="git-file-list">
            {stagedFiles.length === 0 ? (
              <div className="git-empty">No staged changes</div>
            ) : (
              stagedFiles.map(file => (
                <div
                  key={file.path}
                  className={`git-file-item ${selectedFile === file.path ? 'selected' : ''}`}
                  onClick={() => handleFileClick(file.path)}
                >
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.path)}
                    onChange={() => handleFileSelect(file.path)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className={`git-status-icon status-${file.status}`}>
                    {file.status === 'modified' && 'M'}
                    {file.status === 'added' && 'A'}
                    {file.status === 'deleted' && 'D'}
                    {file.status === 'staged' && 'S'}
                  </span>
                  <span className="git-file-path">{file.path}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="git-section">
          <div className="git-section-header">
            <h3>Changes ({unstagedFiles.length})</h3>
            {unstagedFiles.length > 0 && (
              <button 
                className="git-action-btn"
                onClick={handleStage}
                disabled={selectedFiles.size === 0 || isLoading}
              >
                Stage
              </button>
            )}
          </div>
          <div className="git-file-list">
            {unstagedFiles.length === 0 ? (
              <div className="git-empty">No changes</div>
            ) : (
              unstagedFiles.map(file => (
                <div
                  key={file.path}
                  className={`git-file-item ${selectedFile === file.path ? 'selected' : ''}`}
                  onClick={() => handleFileClick(file.path)}
                >
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.path)}
                    onChange={() => handleFileSelect(file.path)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className={`git-status-icon status-${file.status}`}>
                    {file.status === 'modified' && 'M'}
                    {file.status === 'added' && 'A'}
                    {file.status === 'deleted' && 'D'}
                    {file.status === 'untracked' && 'U'}
                  </span>
                  <span className="git-file-path">{file.path}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {stagedFiles.length > 0 && (
          <div className="git-commit-section">
            <textarea
              className="git-commit-message"
              placeholder="Commit message..."
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              rows={3}
            />
            <button
              className="git-commit-btn"
              onClick={handleCommit}
              disabled={!commitMessage.trim() || isLoading}
            >
              Commit
            </button>
          </div>
        )}

        {selectedFile && fileDiff && (
          <div className="git-diff-panel">
            <div className="git-diff-header">
              <h4>{selectedFile}</h4>
              <button onClick={() => setSelectedFile(null)}>×</button>
            </div>
            <pre className="git-diff-content">{fileDiff}</pre>
          </div>
        )}
      </div>
    );
  };

  const renderHistoryTab = () => {
    if (commits.length === 0 && !isLoading) {
      loadHistory();
    }

    return (
      <div className="git-history">
        <div className="git-commit-list">
          {commits.length === 0 ? (
            <div className="git-empty">No commits yet</div>
          ) : (
            commits.map(commit => (
              <div key={commit.oid} className="git-commit-item">
                <div className="git-commit-header">
                  <span className="git-commit-message">{commit.message}</span>
                  <span className="git-commit-sha">{commit.oid.substring(0, 7)}</span>
                </div>
                <div className="git-commit-meta">
                  <span className="git-commit-author">{commit.author}</span>
                  <span className="git-commit-date">
                    {commit.date.toLocaleDateString()} {commit.date.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderBranchesTab = () => {
    return (
      <div className="git-branches">
        <div className="git-current-branch">
          <h3>Current Branch</h3>
          <div className="git-branch-name">{currentBranch}</div>
        </div>
        <div className="git-branch-list">
          <h3>All Branches</h3>
          {branches.map(branch => (
            <div
              key={branch.name}
              className={`git-branch-item ${branch.current ? 'current' : ''}`}
            >
              <span className="git-branch-icon">
                {branch.current ? '●' : '○'}
              </span>
              <span className="git-branch-name">{branch.name}</span>
              <span className="git-branch-commit">{branch.commit.substring(0, 7)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="git-panel">
      <div className="git-header">
        <h2>Git</h2>
        <button className="git-refresh-btn" onClick={handleRefresh} disabled={isLoading}>
          ↻
        </button>
      </div>

      {error && (
        <div className="git-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="git-tabs">
        <button
          className={`git-tab ${activeTab === 'changes' ? 'active' : ''}`}
          onClick={() => setActiveTab('changes')}
        >
          Changes
        </button>
        <button
          className={`git-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button
          className={`git-tab ${activeTab === 'branches' ? 'active' : ''}`}
          onClick={() => setActiveTab('branches')}
        >
          Branches
        </button>
      </div>

      <div className="git-content">
        {isLoading && <div className="git-loading">Loading...</div>}
        {activeTab === 'changes' && renderChangesTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'branches' && renderBranchesTab()}
      </div>
    </div>
  );
};
