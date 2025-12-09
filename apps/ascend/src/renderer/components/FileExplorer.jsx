import React, { useState, useEffect } from 'react';
import './FileExplorer.css';

const FileExplorer = ({ onFileSelect, selectedFile }) => {
  const [fileTree, setFileTree] = useState([]);
  const [currentFolder, setCurrentFolder] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initial load - empty state or load last opened folder
  }, []);

  const handleOpenFolder = async () => {
    try {
      const result = await window.electronAPI.fs.openFolder();
      if (!result.canceled && result.path) {
        setCurrentFolder(result.path);
        loadDirectory(result.path);
      }
    } catch (error) {
      console.error('Failed to open folder:', error);
    }
  };

  const loadDirectory = async (path) => {
    setIsLoading(true);
    try {
      const result = await window.electronAPI.fs.readDir(path);
      if (result.success && result.entries) {
        setFileTree(result.entries.map(entry => ({ ...entry, expanded: false })));
      }
    } catch (error) {
      console.error(`Failed to load directory ${path}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = async (item) => {
    if (item.type === 'directory') {
      // Toggle expansion
      const newExpanded = !item.expanded;
      
      // If expanding and no children loaded, load them
      if (newExpanded && (!item.children || item.children.length === 0)) {
        try {
          const result = await window.electronAPI.fs.readDir(item.path);
          if (result.success && result.entries) {
            setFileTree(prev => updateTreeChildren(prev, item.path, result.entries || [], newExpanded));
            return; // updateTreeChildren handles the expansion too
          }
        } catch (error) {
          console.error(`Failed to load subdirectory ${item.path}:`, error);
        }
      }
      
      setFileTree(prev => updateTreeExpansion(prev, item.path, newExpanded));
    } else {
      // Select file
      onFileSelect(item.path);
    }
  };

  const updateTreeExpansion = (tree, path, expanded) => {
    return tree.map(item => {
      if (item.path === path) {
        return { ...item, expanded };
      }
      if (item.children) {
        return { ...item, children: updateTreeExpansion(item.children, path, expanded) };
      }
      return item;
    });
  };

  const updateTreeChildren = (tree, path, children, expanded) => {
    return tree.map(item => {
      if (item.path === path) {
        return { ...item, children, expanded };
      }
      if (item.children) {
        return { ...item, children: updateTreeChildren(item.children, path, children, expanded) };
      }
      return item;
    });
  };

  const renderFileTree = (items, level = 0) => {
    return items.map(item => (
      <div key={item.path}>
        <div
          className={`file-item ${item.type} ${selectedFile === item.path ? 'selected' : ''}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={(e) => {
            e.stopPropagation();
            handleItemClick(item);
          }}
        >
          <div className="file-icon">
            {item.type === 'directory' ? (
              item.expanded ? '📂' : '📁'
            ) : (
              getFileIcon(item.name)
            )}
          </div>
          <span className="file-name">{item.name}</span>
        </div>
        {item.type === 'directory' && item.expanded && item.children && (
          <div className="file-children">
            {renderFileTree(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return '🟦';
      case 'js':
      case 'jsx':
        return '🟨';
      case 'json':
        return '📄';
      case 'md':
        return '📝';
      case 'css':
        return '🎨';
      case 'html':
        return '🌐';
      default:
        return '📄';
    }
  };

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <h3>Explorer</h3>
        <button className="open-folder-btn" onClick={handleOpenFolder}>
          📁 Open Folder
        </button>
      </div>

      <div className="file-tree">
        {fileTree.length > 0 ? (
          renderFileTree(fileTree)
        ) : (
          <div className="no-workspace">
            <div className="no-workspace-icon">📂</div>
            <p>No folder opened</p>
            <button className="open-folder-btn" onClick={handleOpenFolder}>
              Open Folder
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
