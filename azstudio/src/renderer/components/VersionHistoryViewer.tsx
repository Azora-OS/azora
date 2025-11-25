/**
 * VersionHistoryViewer
 * 
 * UI component for viewing version history, comparing versions,
 * reverting to previous versions, and managing branches.
 */

import React, { useState, useEffect } from 'react';
import './VersionHistoryViewer.css';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface FileChange {
  fileId: string;
  filePath: string;
  operation: 'create' | 'modify' | 'delete' | 'rename' | 'move';
  oldContent?: string;
  newContent?: string;
  oldPath?: string;
  newPath?: string;
  diff?: string;
}

interface Version {
  id: string;
  workspaceId: string;
  branchId: string;
  parentVersionId?: string;
  timestamp: Date;
  user: User;
  message: string;
  changes: FileChange[];
  hash: string;
  tags?: string[];
}

interface Branch {
  id: string;
  name: string;
  workspaceId: string;
  headVersionId: string;
  createdAt: Date;
  createdBy: User;
  description?: string;
  isDefault: boolean;
}

interface VersionHistoryViewerProps {
  workspaceId: string;
  currentBranchId?: string;
  fileId?: string;
  onRevert?: (versionId: string) => void;
  onCompare?: (versionId1: string, versionId2: string) => void;
  onBranchSwitch?: (branchId: string) => void;
}

export const VersionHistoryViewer: React.FC<VersionHistoryViewerProps> = ({
  workspaceId,
  currentBranchId,
  fileId,
  onRevert,
  onCompare,
  onBranchSwitch
}) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'timeline' | 'tree' | 'list'>('timeline');
  const [filterBranch, setFilterBranch] = useState<string | null>(currentBranchId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadVersionHistory();
    loadBranches();
  }, [workspaceId, fileId, filterBranch]);

  const loadVersionHistory = async () => {
    setLoading(true);
    try {
      let result: any;
      
      if (fileId) {
        result = await window.electron.versionHistory.getFileHistory(workspaceId, fileId);
      } else if (filterBranch) {
        result = await window.electron.versionHistory.getBranchHistory(workspaceId, filterBranch);
      } else {
        result = await window.electron.versionHistory.getAllVersions(workspaceId);
      }

      if (result.success && result.versions) {
        // Convert timestamp strings to Date objects
        const loadedVersions = result.versions.map((v: any) => ({
          ...v,
          timestamp: new Date(v.timestamp)
        }));
        setVersions(loadedVersions);
      }
    } catch (error) {
      console.error('Failed to load version history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const result = await window.electron.versionHistory.getAllBranches(workspaceId);
      if (result.success && result.branches) {
        setBranches(result.branches.map((b: any) => ({
          ...b,
          createdAt: new Date(b.createdAt)
        })));
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  };

  const handleVersionSelect = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId));
    } else {
      if (selectedVersions.length >= 2) {
        setSelectedVersions([selectedVersions[1], versionId]);
      } else {
        setSelectedVersions([...selectedVersions, versionId]);
      }
    }
  };

  const handleRevert = async (versionId: string) => {
    if (window.confirm('Are you sure you want to revert to this version? This will create a new version with the reverted changes.')) {
      try {
        // Get current user info (in a real app, this would come from auth context)
        const user = {
          id: 'current-user',
          name: 'Current User',
          email: 'user@azstudio.local'
        };
        
        const result = await window.electron.versionHistory.revertToVersion(
          workspaceId,
          versionId,
          user,
          filterBranch || currentBranchId || 'main'
        );
        
        if (result.success) {
          await loadVersionHistory();
          onRevert?.(versionId);
        } else {
          alert('Failed to revert version: ' + result.error);
        }
      } catch (error) {
        console.error('Failed to revert version:', error);
        alert('Failed to revert version: ' + (error as Error).message);
      }
    }
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      onCompare?.(selectedVersions[0], selectedVersions[1]);
    }
  };

  const toggleVersionExpanded = (versionId: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedVersions(newExpanded);
  };

  const filteredVersions = versions.filter(version => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        version.message.toLowerCase().includes(query) ||
        version.user.name.toLowerCase().includes(query) ||
        version.hash.toLowerCase().includes(query) ||
        version.changes.some(c => c.filePath.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getOperationIcon = (operation: string): string => {
    switch (operation) {
      case 'create': return '➕';
      case 'modify': return '✏️';
      case 'delete': return '🗑️';
      case 'rename': return '📝';
      case 'move': return '📦';
      default: return '📄';
    }
  };

  const renderVersionTimeline = () => (
    <div className="version-timeline">
      {filteredVersions.map((version, index) => {
        const isSelected = selectedVersions.includes(version.id);
        const isExpanded = expandedVersions.has(version.id);
        const branch = branches.find(b => b.id === version.branchId);

        return (
          <div
            key={version.id}
            className={`version-item ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`}
          >
            <div className="version-timeline-line">
              <div className="version-dot" />
              {index < filteredVersions.length - 1 && <div className="version-connector" />}
            </div>
            
            <div className="version-content">
              <div className="version-header" onClick={() => handleVersionSelect(version.id)}>
                <div className="version-info">
                  <div className="version-user">
                    {version.user.avatar ? (
                      <img src={version.user.avatar} alt={version.user.name} className="user-avatar" />
                    ) : (
                      <div className="user-avatar-placeholder">
                        {version.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="user-name">{version.user.name}</span>
                  </div>
                  
                  <div className="version-meta">
                    <span className="version-time">{formatTimestamp(version.timestamp)}</span>
                    {branch && <span className="version-branch">{branch.name}</span>}
                    {version.tags && version.tags.map(tag => (
                      <span key={tag} className="version-tag">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="version-actions">
                  <button
                    className="btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVersionExpanded(version.id);
                    }}
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? '▼' : '▶'}
                  </button>
                  <button
                    className="btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRevert(version.id);
                    }}
                    title="Revert to this version"
                  >
                    ↶
                  </button>
                </div>
              </div>

              <div className="version-message">{version.message}</div>
              
              <div className="version-stats">
                <span className="stat">
                  {version.changes.length} file{version.changes.length !== 1 ? 's' : ''} changed
                </span>
                <span className="stat hash" title={version.hash}>
                  {version.hash.substring(0, 8)}
                </span>
              </div>

              {isExpanded && (
                <div className="version-changes">
                  <h4>Changes:</h4>
                  <ul className="changes-list">
                    {version.changes.map((change, idx) => (
                      <li key={idx} className={`change-item ${change.operation}`}>
                        <span className="change-icon">{getOperationIcon(change.operation)}</span>
                        <span className="change-path">{change.filePath}</span>
                        <span className="change-operation">{change.operation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderVersionTree = () => (
    <div className="version-tree">
      <div className="tree-info">Tree view coming soon - shows branching structure</div>
      {renderVersionTimeline()}
    </div>
  );

  const renderVersionList = () => (
    <div className="version-list">
      <table className="versions-table">
        <thead>
          <tr>
            <th>Select</th>
            <th>User</th>
            <th>Message</th>
            <th>Branch</th>
            <th>Time</th>
            <th>Changes</th>
            <th>Hash</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredVersions.map(version => {
            const isSelected = selectedVersions.includes(version.id);
            const branch = branches.find(b => b.id === version.branchId);

            return (
              <tr key={version.id} className={isSelected ? 'selected' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleVersionSelect(version.id)}
                  />
                </td>
                <td>
                  <div className="user-cell">
                    {version.user.avatar ? (
                      <img src={version.user.avatar} alt={version.user.name} className="user-avatar-small" />
                    ) : (
                      <div className="user-avatar-placeholder-small">
                        {version.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {version.user.name}
                  </div>
                </td>
                <td className="message-cell">{version.message}</td>
                <td>{branch?.name || 'Unknown'}</td>
                <td>{formatTimestamp(version.timestamp)}</td>
                <td>{version.changes.length}</td>
                <td className="hash-cell" title={version.hash}>
                  {version.hash.substring(0, 8)}
                </td>
                <td>
                  <button
                    className="btn-small"
                    onClick={() => handleRevert(version.id)}
                    title="Revert to this version"
                  >
                    Revert
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="version-history-viewer loading">
        <div className="loading-spinner">Loading version history...</div>
      </div>
    );
  }

  return (
    <div className="version-history-viewer">
      <div className="viewer-header">
        <h2>Version History</h2>
        
        <div className="viewer-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search versions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={filterBranch || ''}
            onChange={(e) => {
              const branchId = e.target.value || null;
              setFilterBranch(branchId);
              if (branchId && onBranchSwitch) {
                onBranchSwitch(branchId);
              }
            }}
            className="branch-filter"
          >
            <option value="">All branches</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name} {branch.isDefault ? '(default)' : ''}
              </option>
            ))}
          </select>

          <div className="view-mode-selector">
            <button
              className={`btn-view-mode ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewMode('timeline')}
              title="Timeline view"
            >
              📅
            </button>
            <button
              className={`btn-view-mode ${viewMode === 'tree' ? 'active' : ''}`}
              onClick={() => setViewMode('tree')}
              title="Tree view"
            >
              🌳
            </button>
            <button
              className={`btn-view-mode ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              📋
            </button>
          </div>
        </div>
      </div>

      {selectedVersions.length === 2 && (
        <div className="compare-banner">
          <span>2 versions selected</span>
          <button className="btn-compare" onClick={handleCompare}>
            Compare Versions
          </button>
          <button
            className="btn-clear"
            onClick={() => setSelectedVersions([])}
          >
            Clear Selection
          </button>
        </div>
      )}

      <div className="viewer-content">
        {viewMode === 'timeline' && renderVersionTimeline()}
        {viewMode === 'tree' && renderVersionTree()}
        {viewMode === 'list' && renderVersionList()}
      </div>

      {filteredVersions.length === 0 && (
        <div className="empty-state">
          <p>No version history found</p>
          {searchQuery && <p>Try adjusting your search query</p>}
        </div>
      )}
    </div>
  );
};
