import React from 'react';
import './EditorTabs.css';

export interface EditorTab {
  path: string;
  name: string;
  isDirty: boolean;
  language: string;
}

interface EditorTabsProps {
  tabs: EditorTab[];
  activeTab: string | null;
  onTabSelect: (path: string) => void;
  onTabClose: (path: string) => void;
}

const EditorTabs: React.FC<EditorTabsProps> = ({
  tabs,
  activeTab,
  onTabSelect,
  onTabClose,
}) => {
  const getFileIcon = (language: string): string => {
    switch (language) {
      case 'typescript':
      case 'typescriptreact':
        return '📘';
      case 'javascript':
      case 'javascriptreact':
        return '📙';
      case 'json':
        return '📋';
      case 'css':
      case 'scss':
        return '🎨';
      case 'html':
        return '🌐';
      case 'markdown':
        return '📝';
      default:
        return '📄';
    }
  };

  const handleTabClick = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onTabSelect(path);
  };

  const handleCloseClick = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onTabClose(path);
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="editor-tabs">
      {tabs.map((tab) => (
        <div
          key={tab.path}
          className={`editor-tab ${activeTab === tab.path ? 'active' : ''}`}
          onClick={(e) => handleTabClick(tab.path, e)}
        >
          <span className="tab-icon">{getFileIcon(tab.language)}</span>
          <span className="tab-name">
            {tab.name}
            {tab.isDirty && <span className="tab-dirty">●</span>}
          </span>
          <button
            className="tab-close"
            onClick={(e) => handleCloseClick(tab.path, e)}
            title="Close"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default EditorTabs;
