/**
 * RemoteManager - Remote repository management UI
 * 
 * Provides UI for managing remote repositories, pushing, pulling,
 * and creating pull requests on GitHub/GitLab.
 */

import React, { useState, useEffect } from 'react';
import './RemoteManager.css';

interface RemoteManagerProps {
  projectPath: string;
}

interface RemoteInfo {
  name: string;
  url: string;
}

interface Credentials {
  username: string;
  password: string; // Personal access token
}

export const RemoteManager: React.FC<RemoteManagerProps> = ({ projectPath }) => {
  const [remotes, setRemotes] = useState<RemoteInfo[]>([]);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPushDialog, setShowPushDialog] = useState(false);
  const [showPullDialog, setShowPullDialog] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  
  const [remoteName, setRemoteName] = useState('origin');
  const [remoteUrl, setRemoteUrl] = useState('');
  const [credentials, setCredentials] = useState<Credentials>({ username: '', password: '' });
  const [rememberCredentials, setRememberCredentials] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'push' | 'pull' | null>(null);

  useEffect(() => {
    loadRemotes();
    loadCurrentBranch();
  }, [projectPath]);

  const loadRemotes = async () => {
    try {
      const result = await window.electronAPI.git.listRemotes(projectPath);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load remotes');
      }
      setRemotes(result.remotes || []);
    } catch (err) {
      console.error('Failed to load remotes:', err);
    }
  };

  const loadCurrentBranch = async () => {
    try {
      const result = await window.electronAPI.git.getCurrentBranch(projectPath);
      if (result.success && result.branch) {
        setCurrentBranch(result.branch);
      }
    } catch (err) {
      console.error('Failed to load current branch:', err);
    }
  };

  const handleAddRemote = async () => {
    if (!remoteName.trim() || !remoteUrl.trim()) {
      setError('Remote name and URL are required');
      return;
    }

    try {
      setIsLoading(true);
      const result = await window.electronAPI.git.addRemote(projectPath, remoteName, remoteUrl);

      if (!result.success) {
        throw new Error(result.error || 'Failed to add remote');
      }

      setSuccess(`Remote '${remoteName}' added successfully`);
      setRemoteName('origin');
      setRemoteUrl('');
      setShowAddDialog(false);
      await loadRemotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add remote');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRemote = async (name: string) => {
    if (!confirm(`Are you sure you want to remove remote '${name}'?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const result = await window.electronAPI.git.deleteRemote(projectPath, name);

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete remote');
      }

      setSuccess(`Remote '${name}' removed successfully`);
      await loadRemotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete remote');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePush = async (remote: string = 'origin') => {
    // Check if credentials are needed
    const remoteInfo = remotes.find(r => r.name === remote);
    if (remoteInfo && remoteInfo.url.startsWith('https://') && !credentials.password) {
      setPendingAction('push');
      setShowCredentialsDialog(true);
      return;
    }

    try {
      setIsLoading(true);
      const creds = credentials.password ? credentials : undefined;
      const result = await window.electronAPI.git.push(projectPath, remote, currentBranch, creds);

      if (!result.success) {
        throw new Error(result.error || 'Failed to push');
      }

      setSuccess(`Successfully pushed to '${remote}/${currentBranch}'`);
      setShowPushDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to push to remote');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePull = async (remote: string = 'origin') => {
    // Check if credentials are needed
    const remoteInfo = remotes.find(r => r.name === remote);
    if (remoteInfo && remoteInfo.url.startsWith('https://') && !credentials.password) {
      setPendingAction('pull');
      setShowCredentialsDialog(true);
      return;
    }

    try {
      setIsLoading(true);
      const creds = credentials.password ? credentials : undefined;
      const result = await window.electronAPI.git.pull(projectPath, remote, currentBranch, creds);

      if (!result.success) {
        throw new Error(result.error || 'Failed to pull');
      }

      setSuccess(`Successfully pulled from '${remote}/${currentBranch}'`);
      setShowPullDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pull from remote');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetch = async (remote: string = 'origin') => {
    try {
      setIsLoading(true);
      const creds = credentials.password ? credentials : undefined;
      const result = await window.electronAPI.git.fetch(projectPath, remote, creds);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch');
      }

      setSuccess(`Successfully fetched from '${remote}'`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch from remote');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSubmit = async () => {
    if (!credentials.username || !credentials.password) {
      setError('Username and token are required');
      return;
    }

    setShowCredentialsDialog(false);

    // Execute pending action
    if (pendingAction === 'push') {
      await handlePush();
    } else if (pendingAction === 'pull') {
      await handlePull();
    }

    setPendingAction(null);

    // Clear credentials if not remembered
    if (!rememberCredentials) {
      setCredentials({ username: '', password: '' });
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="remote-manager">
      <div className="remote-manager-header">
        <h2>Remote Repositories</h2>
        <button
          className="remote-btn remote-btn-primary"
          onClick={() => setShowAddDialog(true)}
          disabled={isLoading}
        >
          + Add Remote
        </button>
      </div>

      {error && (
        <div className="remote-message remote-error">
          {error}
          <button onClick={clearMessages}>×</button>
        </div>
      )}

      {success && (
        <div className="remote-message remote-success">
          {success}
          <button onClick={clearMessages}>×</button>
        </div>
      )}

      <div className="remote-current-branch">
        <span className="remote-label">Current Branch:</span>
        <span className="remote-branch-name">{currentBranch}</span>
      </div>

      <div className="remote-list">
        {remotes.length === 0 ? (
          <div className="remote-empty">
            <p>No remote repositories configured</p>
            <button
              className="remote-btn remote-btn-primary"
              onClick={() => setShowAddDialog(true)}
            >
              Add Your First Remote
            </button>
          </div>
        ) : (
          remotes.map((remote) => (
            <div key={remote.name} className="remote-item">
              <div className="remote-item-info">
                <div className="remote-item-name">{remote.name}</div>
                <div className="remote-item-url">{remote.url}</div>
              </div>
              <div className="remote-item-actions">
                <button
                  className="remote-item-btn"
                  onClick={() => handleFetch(remote.name)}
                  disabled={isLoading}
                  title="Fetch"
                >
                  ↓ Fetch
                </button>
                <button
                  className="remote-item-btn"
                  onClick={() => {
                    setRemoteName(remote.name);
                    setShowPullDialog(true);
                  }}
                  disabled={isLoading}
                  title="Pull"
                >
                  ⇣ Pull
                </button>
                <button
                  className="remote-item-btn"
                  onClick={() => {
                    setRemoteName(remote.name);
                    setShowPushDialog(true);
                  }}
                  disabled={isLoading}
                  title="Push"
                >
                  ⇡ Push
                </button>
                <button
                  className="remote-item-btn remote-item-btn-danger"
                  onClick={() => handleDeleteRemote(remote.name)}
                  disabled={isLoading}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Remote Dialog */}
      {showAddDialog && (
        <div className="remote-dialog-overlay" onClick={() => setShowAddDialog(false)}>
          <div className="remote-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="remote-dialog-header">
              <h3>Add Remote Repository</h3>
              <button onClick={() => setShowAddDialog(false)}>×</button>
            </div>
            <div className="remote-dialog-content">
              <label>
                Remote Name:
                <input
                  type="text"
                  value={remoteName}
                  onChange={(e) => setRemoteName(e.target.value)}
                  placeholder="origin"
                  autoFocus
                />
              </label>
              <label>
                Remote URL:
                <input
                  type="text"
                  value={remoteUrl}
                  onChange={(e) => setRemoteUrl(e.target.value)}
                  placeholder="https://github.com/username/repo.git"
                />
              </label>
              <p className="remote-dialog-hint">
                Use HTTPS URLs for easier authentication with personal access tokens.
              </p>
            </div>
            <div className="remote-dialog-actions">
              <button
                className="remote-btn remote-btn-secondary"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </button>
              <button
                className="remote-btn remote-btn-primary"
                onClick={handleAddRemote}
                disabled={!remoteName.trim() || !remoteUrl.trim() || isLoading}
              >
                Add Remote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Push Dialog */}
      {showPushDialog && (
        <div className="remote-dialog-overlay" onClick={() => setShowPushDialog(false)}>
          <div className="remote-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="remote-dialog-header">
              <h3>Push to Remote</h3>
              <button onClick={() => setShowPushDialog(false)}>×</button>
            </div>
            <div className="remote-dialog-content">
              <p className="remote-dialog-info">
                Push <strong>{currentBranch}</strong> to <strong>{remoteName}</strong>
              </p>
              <p className="remote-dialog-warning">
                ⚠️ Make sure you have committed all changes before pushing.
              </p>
            </div>
            <div className="remote-dialog-actions">
              <button
                className="remote-btn remote-btn-secondary"
                onClick={() => setShowPushDialog(false)}
              >
                Cancel
              </button>
              <button
                className="remote-btn remote-btn-primary"
                onClick={() => handlePush(remoteName)}
                disabled={isLoading}
              >
                Push
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pull Dialog */}
      {showPullDialog && (
        <div className="remote-dialog-overlay" onClick={() => setShowPullDialog(false)}>
          <div className="remote-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="remote-dialog-header">
              <h3>Pull from Remote</h3>
              <button onClick={() => setShowPullDialog(false)}>×</button>
            </div>
            <div className="remote-dialog-content">
              <p className="remote-dialog-info">
                Pull <strong>{remoteName}/{currentBranch}</strong> into <strong>{currentBranch}</strong>
              </p>
              <p className="remote-dialog-warning">
                ⚠️ Make sure you have committed all local changes to avoid conflicts.
              </p>
            </div>
            <div className="remote-dialog-actions">
              <button
                className="remote-btn remote-btn-secondary"
                onClick={() => setShowPullDialog(false)}
              >
                Cancel
              </button>
              <button
                className="remote-btn remote-btn-primary"
                onClick={() => handlePull(remoteName)}
                disabled={isLoading}
              >
                Pull
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Dialog */}
      {showCredentialsDialog && (
        <div className="remote-dialog-overlay">
          <div className="remote-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="remote-dialog-header">
              <h3>Authentication Required</h3>
            </div>
            <div className="remote-dialog-content">
              <p className="remote-dialog-info">
                Enter your credentials to access the remote repository.
              </p>
              <label>
                Username:
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  placeholder="your-username"
                  autoFocus
                />
              </label>
              <label>
                Personal Access Token:
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="ghp_xxxxxxxxxxxx"
                />
              </label>
              <label className="remote-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberCredentials}
                  onChange={(e) => setRememberCredentials(e.target.checked)}
                />
                Remember credentials for this session
              </label>
              <p className="remote-dialog-hint">
                Generate a personal access token from your Git provider's settings.
              </p>
            </div>
            <div className="remote-dialog-actions">
              <button
                className="remote-btn remote-btn-secondary"
                onClick={() => {
                  setShowCredentialsDialog(false);
                  setPendingAction(null);
                }}
              >
                Cancel
              </button>
              <button
                className="remote-btn remote-btn-primary"
                onClick={handleCredentialsSubmit}
                disabled={!credentials.username || !credentials.password}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
