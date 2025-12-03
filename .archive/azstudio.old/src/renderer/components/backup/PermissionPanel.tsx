/**
 * PermissionPanel - Permission management UI component
 * 
 * Provides UI for managing file system permissions, network allowlist,
 * auto-grant patterns, and viewing permission audit logs.
 */

import React, { useState, useEffect } from 'react';
import './PermissionPanel.css';

interface PermissionPanelProps {
  projectPath?: string; // Reserved for future use
}

interface PermissionGrant {
  type: string;
  resource: string;
  granted: boolean;
  timestamp: Date;
  expiresAt?: Date;
  permanent: boolean;
}

interface AllowlistEntry {
  domain: string;
  allowed: boolean;
  addedAt: Date;
  reason?: string;
}

interface AuditEntry {
  timestamp: Date;
  type: string;
  resource: string;
  granted: boolean;
  reason?: string;
}

export const PermissionPanel: React.FC<PermissionPanelProps> = ({ projectPath }) => {
  const [activeTab, setActiveTab] = useState<'grants' | 'network' | 'patterns' | 'audit'>('grants');
  const [grants, setGrants] = useState<PermissionGrant[]>([]);
  const [networkAllowlist, setNetworkAllowlist] = useState<AllowlistEntry[]>([]);
  const [autoGrantPatterns, setAutoGrantPatterns] = useState<string[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add domain form
  const [newDomain, setNewDomain] = useState('');
  const [newDomainReason, setNewDomainReason] = useState('');
  
  // Add pattern form
  const [newPattern, setNewPattern] = useState('');
  
  // Filter states
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadGrants(),
      loadNetworkAllowlist(),
      loadAutoGrantPatterns(),
      loadAuditLog(),
    ]);
  };

  const loadGrants = async () => {
    try {
      setIsLoading(true);
      const result = await window.electronAPI.permissions.getGrants();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load grants');
      }
      
      const grantsList = (result.grants || []).map((g: any) => ({
        ...g,
        timestamp: new Date(g.timestamp),
        expiresAt: g.expiresAt ? new Date(g.expiresAt) : undefined,
      }));
      
      setGrants(grantsList);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load permission grants');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNetworkAllowlist = async () => {
    try {
      setIsLoading(true);
      const result = await window.electronAPI.permissions.getNetworkAllowlist();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load network allowlist');
      }
      
      const allowlist = (result.allowlist || []).map((e: any) => ({
        ...e,
        addedAt: new Date(e.addedAt),
      }));
      
      setNetworkAllowlist(allowlist);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load network allowlist');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAutoGrantPatterns = async () => {
    try {
      setIsLoading(true);
      const result = await window.electronAPI.permissions.getAutoGrantPatterns();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load auto-grant patterns');
      }
      
      setAutoGrantPatterns(result.patterns || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load auto-grant patterns');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuditLog = async () => {
    try {
      setIsLoading(true);
      const result = await window.electronAPI.permissions.getAuditLog();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load audit log');
      }
      
      const log = (result.auditLog || []).map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp),
      }));
      
      setAuditLog(log);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit log');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokePermission = async (type: string, resource: string) => {
    try {
      const result = await window.electronAPI.permissions.revoke(type, resource);
      if (!result.success) {
        throw new Error(result.error || 'Failed to revoke permission');
      }
      
      await loadGrants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke permission');
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDomain.trim()) {
      setError('Domain cannot be empty');
      return;
    }
    
    try {
      const result = await window.electronAPI.permissions.addToNetworkAllowlist(
        newDomain.trim(),
        true,
        newDomainReason.trim() || undefined
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to add domain');
      }
      
      setNewDomain('');
      setNewDomainReason('');
      await loadNetworkAllowlist();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add domain');
    }
  };

  const handleRemoveDomain = async (domain: string) => {
    try {
      const result = await window.electronAPI.permissions.removeFromNetworkAllowlist(domain);
      if (!result.success) {
        throw new Error(result.error || 'Failed to remove domain');
      }
      
      await loadNetworkAllowlist();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove domain');
    }
  };

  const handleBlockDomain = async (domain: string) => {
    try {
      const result = await window.electronAPI.permissions.addToNetworkAllowlist(
        domain,
        false,
        'Blocked by user'
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to block domain');
      }
      
      await loadNetworkAllowlist();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to block domain');
    }
  };

  const handleUnblockDomain = async (domain: string) => {
    try {
      const result = await window.electronAPI.permissions.addToNetworkAllowlist(
        domain,
        true,
        'Unblocked by user'
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to unblock domain');
      }
      
      await loadNetworkAllowlist();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unblock domain');
    }
  };

  const handleAddPattern = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPattern.trim()) {
      setError('Pattern cannot be empty');
      return;
    }
    
    try {
      const result = await window.electronAPI.permissions.addAutoGrantPattern(newPattern.trim());
      if (!result.success) {
        throw new Error(result.error || 'Failed to add pattern');
      }
      
      setNewPattern('');
      await loadAutoGrantPatterns();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add pattern');
    }
  };

  const handleRemovePattern = async (pattern: string) => {
    try {
      const result = await window.electronAPI.permissions.removeAutoGrantPattern(pattern);
      if (!result.success) {
        throw new Error(result.error || 'Failed to remove pattern');
      }
      
      await loadAutoGrantPatterns();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove pattern');
    }
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleString();
  };

  const formatPermissionType = (type: string): string => {
    return type.split(':').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' - ');
  };

  const getFilteredGrants = (): PermissionGrant[] => {
    let filtered = grants;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(g => g.type === filterType);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(g => 
        g.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getFilteredAuditLog = (): AuditEntry[] => {
    if (!searchQuery) {
      return auditLog;
    }
    
    return auditLog.filter(e =>
      e.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderGrantsTab = () => {
    const filteredGrants = getFilteredGrants();
    const permissionTypes = Array.from(new Set(grants.map(g => g.type)));
    
    return (
      <div className="permission-tab-content">
        <div className="permission-filters">
          <div className="filter-group">
            <label>Filter by Type:</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              {permissionTypes.map(type => (
                <option key={type} value={type}>{formatPermissionType(type)}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="permission-list">
          {filteredGrants.length === 0 ? (
            <div className="empty-state">
              <p>No permission grants found</p>
            </div>
          ) : (
            filteredGrants.map((grant, index) => (
              <div key={index} className="permission-item">
                <div className="permission-header">
                  <span className="permission-type">{formatPermissionType(grant.type)}</span>
                  <span className={`permission-status ${grant.permanent ? 'permanent' : 'temporary'}`}>
                    {grant.permanent ? 'Permanent' : 'Temporary'}
                  </span>
                </div>
                
                <div className="permission-resource">{grant.resource}</div>
                
                <div className="permission-meta">
                  <span>Granted: {formatTimestamp(grant.timestamp)}</span>
                  {grant.expiresAt && (
                    <span>Expires: {formatTimestamp(grant.expiresAt)}</span>
                  )}
                </div>
                
                <button
                  className="btn-revoke"
                  onClick={() => handleRevokePermission(grant.type, grant.resource)}
                >
                  Revoke
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderNetworkTab = () => {
    return (
      <div className="permission-tab-content">
        <form className="add-domain-form" onSubmit={handleAddDomain}>
          <h3>Add Domain to Allowlist</h3>
          <div className="form-group">
            <label>Domain:</label>
            <input
              type="text"
              placeholder="example.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Reason (optional):</label>
            <input
              type="text"
              placeholder="Why is this domain needed?"
              value={newDomainReason}
              onChange={(e) => setNewDomainReason(e.target.value)}
            />
          </div>
          
          <button type="submit" className="btn-primary">Add Domain</button>
        </form>
        
        <div className="network-allowlist">
          <h3>Network Allowlist</h3>
          {networkAllowlist.length === 0 ? (
            <div className="empty-state">
              <p>No domains in allowlist</p>
            </div>
          ) : (
            networkAllowlist.map((entry, index) => (
              <div key={index} className={`allowlist-item ${entry.allowed ? 'allowed' : 'blocked'}`}>
                <div className="allowlist-header">
                  <span className="domain-name">{entry.domain}</span>
                  <span className={`domain-status ${entry.allowed ? 'allowed' : 'blocked'}`}>
                    {entry.allowed ? 'Allowed' : 'Blocked'}
                  </span>
                </div>
                
                {entry.reason && (
                  <div className="domain-reason">{entry.reason}</div>
                )}
                
                <div className="domain-meta">
                  Added: {formatTimestamp(entry.addedAt)}
                </div>
                
                <div className="domain-actions">
                  {entry.allowed ? (
                    <button
                      className="btn-block"
                      onClick={() => handleBlockDomain(entry.domain)}
                    >
                      Block
                    </button>
                  ) : (
                    <button
                      className="btn-unblock"
                      onClick={() => handleUnblockDomain(entry.domain)}
                    >
                      Unblock
                    </button>
                  )}
                  
                  <button
                    className="btn-remove"
                    onClick={() => handleRemoveDomain(entry.domain)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderPatternsTab = () => {
    return (
      <div className="permission-tab-content">
        <form className="add-pattern-form" onSubmit={handleAddPattern}>
          <h3>Add Auto-Grant Pattern</h3>
          <div className="form-group">
            <label>Pattern:</label>
            <input
              type="text"
              placeholder="/path/to/directory/**"
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
            />
            <small>Use ** for recursive matching, * for single-level matching</small>
          </div>
          
          <button type="submit" className="btn-primary">Add Pattern</button>
        </form>
        
        <div className="pattern-list">
          <h3>Auto-Grant Patterns</h3>
          <p className="pattern-description">
            File system operations matching these patterns will be automatically granted without prompts.
          </p>
          
          {autoGrantPatterns.length === 0 ? (
            <div className="empty-state">
              <p>No auto-grant patterns configured</p>
            </div>
          ) : (
            autoGrantPatterns.map((pattern, index) => (
              <div key={index} className="pattern-item">
                <code className="pattern-code">{pattern}</code>
                <button
                  className="btn-remove"
                  onClick={() => handleRemovePattern(pattern)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderAuditTab = () => {
    const filteredLog = getFilteredAuditLog();
    
    return (
      <div className="permission-tab-content">
        <div className="audit-filters">
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search audit log..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="audit-log">
          {filteredLog.length === 0 ? (
            <div className="empty-state">
              <p>No audit entries found</p>
            </div>
          ) : (
            filteredLog.map((entry, index) => (
              <div key={index} className={`audit-item ${entry.granted ? 'granted' : 'denied'}`}>
                <div className="audit-header">
                  <span className="audit-timestamp">{formatTimestamp(entry.timestamp)}</span>
                  <span className={`audit-status ${entry.granted ? 'granted' : 'denied'}`}>
                    {entry.granted ? 'Granted' : 'Denied'}
                  </span>
                </div>
                
                <div className="audit-type">{formatPermissionType(entry.type)}</div>
                <div className="audit-resource">{entry.resource}</div>
                
                {entry.reason && (
                  <div className="audit-reason">{entry.reason}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="permission-panel">
      <div className="permission-header">
        <h2>Permission Management</h2>
        <button className="btn-refresh" onClick={loadAllData} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      {error && (
        <div className="permission-error">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
          <button className="btn-dismiss" onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      <div className="permission-tabs">
        <button
          className={`tab-button ${activeTab === 'grants' ? 'active' : ''}`}
          onClick={() => setActiveTab('grants')}
        >
          Permission Grants
        </button>
        
        <button
          className={`tab-button ${activeTab === 'network' ? 'active' : ''}`}
          onClick={() => setActiveTab('network')}
        >
          Network Allowlist
        </button>
        
        <button
          className={`tab-button ${activeTab === 'patterns' ? 'active' : ''}`}
          onClick={() => setActiveTab('patterns')}
        >
          Auto-Grant Patterns
        </button>
        
        <button
          className={`tab-button ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          Audit Log
        </button>
      </div>
      
      <div className="permission-content">
        {activeTab === 'grants' && renderGrantsTab()}
        {activeTab === 'network' && renderNetworkTab()}
        {activeTab === 'patterns' && renderPatternsTab()}
        {activeTab === 'audit' && renderAuditTab()}
      </div>
    </div>
  );
};
