import React, { useState, useEffect } from 'react';

interface SidebarProps {
  activePanel: 'explorer' | 'search' | 'git' | 'debug' | 'extensions';
  projectPath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activePanel, projectPath }) => {
  const [files, setFiles] = useState<Array<{ name: string; path: string; type: 'file' | 'folder'; children?: any[] }>>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (projectPath) {
      loadFiles();
    }
  }, [projectPath]);

  const loadFiles = async () => {
    if (!window.electronAPI?.fs?.readDir) return;
    
    try {
      const result = await window.electronAPI.fs.readDir(projectPath);
      if (result.success) {
        setFiles(result.files || []);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (items: any[], level: number = 0) => {
    return items.map((item, index) => {
      const isExpanded = expandedFolders.has(item.path);
      const paddingLeft = level * 16;

      return (
        <div key={item.path || index}>
          <div
            className={`file-tree-item ${item.type}`}
            style={{ paddingLeft: `${paddingLeft}px` }}
            onClick={() => item.type === 'folder' && toggleFolder(item.path)}
          >
            <span className="file-tree-icon">
              {item.type === 'folder' ? (isExpanded ? '📂' : '📁') : getFileIcon(item.name)}
            </span>
            <span>{item.name}</span>
          </div>
          {item.type === 'folder' && isExpanded && item.children && (
            <div>
              {renderFileTree(item.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      'js': '🟨',
      'jsx': '🟨',
      'ts': '🔷',
      'tsx': '🔷',
      'css': '🎨',
      'scss': '🎨',
      'html': '🌐',
      'json': '📋',
  const renderContent = () => {
    switch (activePanel) {
      case 'database':
        return <DatabaseDesigner />;
      case 'factory':
        return <ComponentFactory />;
      case 'explorer':
        return (
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#007acc' }}>📁 File Explorer</h3>
            {projectPath ? (
              <div style={{ color: '#cccccc' }}>
                <div style={{ marginBottom: '8px', fontSize: '12px', color: '#8c8c8c' }}>
                  {projectPath}
                </div>
                <div style={{ paddingLeft: '16px' }}>
                  <div style={{ padding: '4px 0', cursor: 'pointer' }}>📂 src</div>
                  <div style={{ paddingLeft: '16px' }}>
                    <div style={{ padding: '4px 0', cursor: 'pointer' }}>📂 renderer</div>
                    <div style={{ paddingLeft: '16px' }}>
                      <div style={{ padding: '4px 0', cursor: 'pointer' }}>📄 App.tsx</div>
                      <div style={{ padding: '4px 0', cursor: 'pointer' }}>📄 index.tsx</div>
                      <div style={{ padding: '4px 0', cursor: 'pointer' }}>📂 components</div>
                    </div>
                    <div style={{ padding: '4px 0', cursor: 'pointer' }}>📂 main</div>
                  </div>
                  <div style={{ padding: '4px 0', cursor: 'pointer' }}>📄 package.json</div>
                  <div style={{ padding: '4px 0', cursor: 'pointer' }}>📄 README.md</div>
                </div>
              </div>
            ) : (
              <div style={{ color: '#8c8c8c', textAlign: 'center', padding: '40px 0' }}>
                <div>No folder open</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>Click "Open Folder" to start</div>
              </div>
            )}
          </div>
        );
      case 'search':
        return (
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#007acc' }}>🔍 Search</h3>
            <input
              type="text"
              placeholder="Search files..."
              style={{
                width: '100%',
                padding: '8px',
                background: '#2d2d2d',
                border: '1px solid #3e3e3e',
                color: '#cccccc',
                borderRadius: '4px',
                marginBottom: '16px'
              }}
            />
            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
              Enter search term to find files
            </div>
          </div>
        );
      case 'git':
        return (
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#007acc' }}>🔀 Source Control</h3>
            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
              Git integration coming soon
            </div>
          </div>
        );
      case 'debug':
        return (
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#007acc' }}>🐛 Debug</h3>
            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
              Debug tools coming soon
            </div>
          </div>
        );
      case 'extensions':
        return (
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#007acc' }}>⚙️ Extensions</h3>
            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
              Extension marketplace coming soon
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="sidebar" style={{
      width: '300px',
      background: '#252526',
      borderRight: '1px solid #3e3e3e',
      overflow: 'auto'
    }}>
      {renderContent()}
    </div>
  );
};

export default Sidebar;
