/**
 * BranchManager - Branch and merge management UI
 * 
 * Provides UI for creating, switching, deleting branches,
 * and handling merge operations with conflict resolution.
 */

import React, { useState, useEffect } from 'react';
import './BranchManager.css';

interface BranchManagerProps {
  projectPath: string;
  onBranchChange?: (branchName: string) => void;
}

interface BranchInfo {
  name: string;
  current: boolean;
  commit: string;
}

export const BranchManager: React.FC<BranchManagerProps> = ({ projectPath, onBranchChange }) => {
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [newBranchName, setNewBranchName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [mergeBranch, setMergeBranch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadBranches();
  }, [projectPath]);

  const loadBranches = async () => {
    try {
      setIsLoading(true);
      const result = await window.electronAPI.git.listBranches(projectPath);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load branches');
      }

      const branchList = result.branches || [];
      setBranches(branchList);

      const current = branchList.find((b: BranchInfo) => b.current);
      if (current) {
        setCurrentBranch(current.name);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load branches');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) {
      setError('Branch name is required');
      return;
    }

    // Validate branch name
    if (!/^[a-zA-Z0-9/_-]+$/.test(newBranchName)) {
      setError('Invalid branch name. Use only letters, numbers, /, -, and _');
      return;
    }

    try {
      setIsLoading(true);
      const result = await window.electronAPI.git.createBranch(
        projectPath,
        newBranchName,
        true // checkout the new branch
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to create branch');
      }

      setSuccess(`Branch '${newBranchName}' created and checked out`);
      setNewBranchName('');
      setShowCreateDialog(false);
      await loadBranches();

      if (onBranchChange) {
        onBranchChange(newBranchName);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create branch');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckoutBranch = async (branchName: string) => {
    if (branchName === currentBranch) return;

    try {
      setIsLoading(true);
      const result = await window.electronAPI.git.checkoutBranch(projectPath, branchName);

      if (!result.success) {
        throw new Error(result.error || 'Failed to checkout branch');
      }

      setSuccess(`Switched to branch '${branchName}'`);
      setCurrentBranch(branchName);
      await loadBranches();

      if (onBranchChange) {
        onBranchChange(branchName);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to checkout branch');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBranch = async (branchName: string) => {
    if (branchName === currentBranch) {
      setError('Cannot delete the current branch');
      return;
    }

    if (!confirm(`Are you sure you want to delete branch '${branchName}'?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const result = await window.electronAPI.git.deleteBranch(projectPath, branchName);

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete branch');
      }

      setSuccess(`Branch '${branchName}' deleted`);
      await loadBranches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete branch');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMerge = async () => {
    if (!mergeBranch) {
      setError('Please select a branch to merge');
      return;
    }

    if (mergeBranch === currentBranch) {
      setError('Cannot merge a branch into itself');
      return;
    }

    try {
      setIsLoading(true);
      const result = await window.electronAPI.git.merge(projectPath, mergeBranch);

      if (!result.success) {
        throw new Error(result.error || 'Failed to merge branch');
      }

      setSuccess(`Successfully merged '${mergeBranch}' into '${currentBranch}'`);
      setShowMergeDialog(false);
      setMergeBranch('');
      await loadBranches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Merge failed. Please resolve conflicts manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="branch-manager">
      <div className="branch-manager-header">
        <h2>Branch Management</h2>
        <div className="branch-actions">
          <button
            className="branch-btn branch-btn-primary"
            onClick={() => setShowCreateDialog(true)}
            disabled={isLoading}
          >
            + New Branch
          </button>
          <button
            className="branch-btn branch-btn-secondary"
            onClick={() => setShowMergeDialog(true)}
            disabled={isLoading || branches.length < 2}
          >
            Merge
          </button>
          <button
            className="branch-btn branch-btn-secondary"
            onClick={loadBranches}
            disabled={isLoading}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="branch-message branch-error">
          {error}
          <button onClick={clearMessages}>×</button>
        </div>
      )}

      {success && (
        <div className="branch-message branch-success">
          {success}
          <button onClick={clearMessages}>×</button>
        </div>
      )}

      <div className="branch-current">
        <div className="branch-current-label">Current Branch:</div>
        <div className="branch-current-name">{currentBranch}</div>
      </div>

      <div className="branch-list">
        <h3>All Branches</h3>
        {isLoading ? (
          <div className="branch-loading">Loading branches...</div>
        ) : branches.length === 0 ? (
          <div className="branch-empty">No branches found</div>
        ) : (
          branches.map((branch) => (
            <div
              key={branch.name}
              className={`branch-item ${branch.current ? 'current' : ''}`}
            >
              <div className="branch-item-info">
                <span className="branch-item-icon">
                  {branch.current ? '●' : '○'}
                </span>
                <span className="branch-item-name">{branch.name}</span>
                <span className="branch-item-commit">{branch.commit.substring(0, 7)}</span>
              </div>
              <div className="branch-item-actions">
                {!branch.current && (
                  <>
                    <button
                      className="branch-item-btn"
                      onClick={() => handleCheckoutBranch(branch.name)}
                      disabled={isLoading}
                      title="Checkout branch"
                    >
                      ↻
                    </button>
                    <button
                      className="branch-item-btn branch-item-btn-danger"
                      onClick={() => handleDeleteBranch(branch.name)}
                      disabled={isLoading}
                      title="Delete branch"
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Branch Dialog */}
      {showCreateDialog && (
        <div className="branch-dialog-overlay" onClick={() => setShowCreateDialog(false)}>
          <div className="branch-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="branch-dialog-header">
              <h3>Create New Branch</h3>
              <button onClick={() => setShowCreateDialog(false)}>×</button>
            </div>
            <div className="branch-dialog-content">
              <label>
                Branch Name:
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="feature/my-feature"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateBranch();
                    }
                  }}
                />
              </label>
              <p className="branch-dialog-hint">
                Branch will be created from: <strong>{currentBranch}</strong>
              </p>
            </div>
            <div className="branch-dialog-actions">
              <button
                className="branch-btn branch-btn-secondary"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </button>
              <button
                className="branch-btn branch-btn-primary"
                onClick={handleCreateBranch}
                disabled={!newBranchName.trim() || isLoading}
              >
                Create & Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Dialog */}
      {showMergeDialog && (
        <div className="branch-dialog-overlay" onClick={() => setShowMergeDialog(false)}>
          <div className="branch-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="branch-dialog-header">
              <h3>Merge Branch</h3>
              <button onClick={() => setShowMergeDialog(false)}>×</button>
            </div>
            <div className="branch-dialog-content">
              <p className="branch-dialog-hint">
                Merge into: <strong>{currentBranch}</strong>
              </p>
              <label>
                Select branch to merge:
                <select
                  value={mergeBranch}
                  onChange={(e) => setMergeBranch(e.target.value)}
                  autoFocus
                >
                  <option value="">-- Select a branch --</option>
                  {branches
                    .filter((b) => b.name !== currentBranch)
                    .map((branch) => (
                      <option key={branch.name} value={branch.name}>
                        {branch.name}
                      </option>
                    ))}
                </select>
              </label>
              <p className="branch-dialog-warning">
                ⚠️ Make sure you have committed all changes before merging.
              </p>
            </div>
            <div className="branch-dialog-actions">
              <button
                className="branch-btn branch-btn-secondary"
                onClick={() => setShowMergeDialog(false)}
              >
                Cancel
              </button>
              <button
                className="branch-btn branch-btn-primary"
                onClick={handleMerge}
                disabled={!mergeBranch || isLoading}
              >
                Merge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
