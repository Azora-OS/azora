import React from 'react';
import DatabaseDesigner from './DatabaseDesigner';
import ComponentFactory from './ComponentFactory';

interface SidebarProps {
  activePanel: 'explorer' | 'search' | 'git' | 'debug' | 'extensions' | 'database' | 'factory' | 'multiagent';
  projectPath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activePanel, projectPath }) => {
  const renderContent = () => {
    switch (activePanel) {
      case 'database':
        return <DatabaseDesigner />;
      case 'factory':
        return <ComponentFactory />;
      case 'multiagent':
        return (
          <div style={{ padding: '16px', color: '#cccccc' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#007acc' }}>🤖 Multi-Agent Mode</h3>
            <div style={{ 
              padding: '16px', 
              background: '#2d2d2d', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#cccccc' }}>
                Multi-Agent Mode
              </h4>
              <p style={{ margin: '0 0 16px 0', color: '#8c8c8c', fontSize: '12px' }}>
                Click the "🤖 Multi-Agent" button in the title bar to activate collaborative AI development.
              </p>
              <div style={{ 
                padding: '12px', 
                background: '#007acc20', 
                border: '1px solid #007acc',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#007acc'
              }}>
                <strong>Features:</strong><br/>
                • Real-time collaboration with AI agents<br/>
                • Task decomposition and assignment<br/>
                • Conflict resolution system<br/>
                • Live progress monitoring<br/>
                • Direct agent communication
              </div>
            </div>
          </div>
        );
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
