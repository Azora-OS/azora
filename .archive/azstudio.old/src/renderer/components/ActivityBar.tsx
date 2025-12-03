import React from 'react';

interface ActivityBarProps {
  activePanel: 'explorer' | 'search' | 'git' | 'debug' | 'extensions' | 'database' | 'factory' | 'multiagent';
  onPanelChange: (panel: 'explorer' | 'search' | 'git' | 'debug' | 'extensions' | 'database' | 'factory' | 'multiagent') => void;
  onNewFile: () => void;
  onOpenProject: () => void;
}

const ActivityBar: React.FC<ActivityBarProps> = ({
  activePanel,
  onPanelChange,
  onNewFile,
  onOpenProject
}) => {
  return (
    <div className="activity-bar" style={{
      width: '48px',
      background: '#333333',
      display: 'flex',
      flexDirection: 'column',
      padding: '8px 0',
      alignItems: 'center'
    }}>
      {/* AzStudio Logo */}
      <div style={{
        width: '32px',
        height: '32px',
        background: '#007acc',
        borderRadius: '6px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px'
      }}>
        AZ
      </div>

      {/* Navigation Items */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button
          className={`activity-bar-item ${activePanel === 'explorer' ? 'active' : ''}`}
          onClick={() => onPanelChange('explorer')}
          style={{
            width: '32px',
            height: '32px',
            background: activePanel === 'explorer' ? '#007acc' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: activePanel === 'explorer' ? 'white' : '#cccccc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}
          title="File Explorer"
        >
          📁
        </button>

        <button
          className={`activity-bar-item ${activePanel === 'search' ? 'active' : ''}`}
          onClick={() => onPanelChange('search')}
          style={{
            width: '32px',
            height: '32px',
            background: activePanel === 'search' ? '#007acc' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: activePanel === 'search' ? 'white' : '#cccccc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}
          title="Search"
        >
          🔍
        </button>

        <button
          className={`activity-bar-item ${activePanel === 'git' ? 'active' : ''}`}
          onClick={() => onPanelChange('git')}
          style={{
            width: '32px',
            height: '32px',
            background: activePanel === 'git' ? '#007acc' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: activePanel === 'git' ? 'white' : '#cccccc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}
          title="Source Control"
        >
          🔀
        </button>

        <button
          className={`activity-bar-item ${activePanel === 'debug' ? 'active' : ''}`}
          onClick={() => onPanelChange('debug')}
          style={{
            width: '32px',
            height: '32px',
            background: activePanel === 'debug' ? '#007acc' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: activePanel === 'debug' ? 'white' : '#cccccc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}
          title="Debug"
        >
          🐛
        </button>

        <button
          className={`activity-bar-item ${activePanel === 'extensions' ? 'active' : ''}`}
          onClick={() => onPanelChange('extensions')}
          style={{
            width: '32px',
            height: '32px',
            background: activePanel === 'extensions' ? '#007acc' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: activePanel === 'extensions' ? 'white' : '#cccccc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}
          title="Extensions"
        >
          ⚙️
        </button>

        {/* Separator */}
        <div style={{
          height: '1px',
          background: '#3e3e3e',
          margin: '8px 4px',
          width: '24px'
        }} />

        {/* AzStudio Internal Tools */}
        <button
          className={`activity-bar-item ${activePanel === 'database' ? 'active' : ''}`}
          onClick={() => onPanelChange('database')}
          style={{
            width: '32px',
            height: '32px',
            background: activePanel === 'database' ? '#007acc' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: activePanel === 'database' ? 'white' : '#cccccc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}
          title="Database Designer"
        >
          🗄️
        </button>

        <button
          className={`activity-bar-item ${activePanel === 'factory' ? 'active' : ''}`}
          onClick={() => onPanelChange('factory')}
          style={{
            width: '32px',
            height: '32px',
            background: activePanel === 'factory' ? '#007acc' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: activePanel === 'factory' ? 'white' : '#cccccc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}
          title="Component Factory"
        >
          🏭
        </button>
      </div>

      {/* Action Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button
          onClick={onNewFile}
          style={{
            width: '32px',
            height: '32px',
            background: 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: '#cccccc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}
          title="New File"
        >
          📄
        </button>

        <button
          onClick={onOpenProject}
          style={{
            width: '32px',
            height: '32px',
            background: 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: '#cccccc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}
          title="Open Folder"
        >
          📂
        </button>

        {/* Multi-Agent Mode Button */}
        <button
          className={`activity-bar-item ${activePanel === 'multiagent' ? 'active' : ''}`}
          onClick={() => onPanelChange('multiagent')}
          style={{
            width: '32px',
            height: '32px',
            background: activePanel === 'multiagent' ? '#007acc' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: activePanel === 'multiagent' ? 'white' : '#cccccc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}
          title="Multi-Agent Mode"
        >
          🤖
        </button>
      </div>
    </div>
  );
};

export default ActivityBar;
