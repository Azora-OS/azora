import React, { useState, useEffect } from 'react';
import './FileExplorer.css';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileItem[];
  isExpanded?: boolean;
}

interface FileExplorerProps {
  rootPath: string;
  onFileSelect: (filePath: string) => void;
  selectedFile?: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  rootPath,
  onFileSelect,
  selectedFile,
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDirectory(rootPath);
  }, [rootPath]);

  const loadDirectory = async (dirPath: string) => {
    setLoading(true);
    try {
      const result = await window.electronAPI.fs.readDir(dirPath);
      if (result.success && result.files) {
        const sortedFiles = result.files.sort((a, b) => {
          // Directories first, then alphabetically
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        });
        setFiles(sortedFiles);
      }
    } catch (error) {
      console.error('Failed to load directory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = async (file: FileItem) => {
    if (file.isDirectory) {
      // Toggle directory expansion
      const newFiles = [...files];
      const fileIndex = newFiles.findIndex(f => f.path === file.path);
      if (fileIndex !== -1) {
        newFiles[fileIndex].isExpanded = !newFiles[fileIndex].isExpanded;
        
        if (newFiles[fileIndex].isExpanded && !newFiles[fileIndex].children) {
          // Load children
          const result = await window.electronAPI.fs.readDir(file.path);
          if (result.success && result.files) {
            newFiles[fileIndex].children = result.files.sort((a, b) => {
              if (a.isDirectory && !b.isDirectory) return -1;
              if (!a.isDirectory && b.isDirectory) return 1;
              return a.name.localeCompare(b.name);
            });
          }
        }
        setFiles(newFiles);
      }
    } else {
      // Open file
      onFileSelect(file.path);
    }
  };

  const getFileIcon = (file: FileItem): string => {
    if (file.isDirectory) {
      return file.isExpanded ? '📂' : '📁';
    }
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return '📘';
      case 'js':
      case 'jsx':
        return '📙';
      case 'json':
        return '📋';
      case 'css':
      case 'scss':
        return '🎨';
      case 'html':
        return '🌐';
      case 'md':
        return '📝';
      default:
        return '📄';
    }
  };

  const renderFileTree = (items: FileItem[], depth: number = 0) => {
    return items.map((file) => (
      <div key={file.path}>
        <div
          className={`file-item ${selectedFile === file.path ? 'selected' : ''}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleFileClick(file)}
        >
          <span className="file-icon">{getFileIcon(file)}</span>
          <span className="file-name">{file.name}</span>
        </div>
        {file.isExpanded && file.children && (
          <div className="file-children">
            {renderFileTree(file.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="file-explorer">
        <div className="file-explorer-header">
          <span>EXPLORER</span>
        </div>
        <div className="file-explorer-content">
          <div style={{ padding: '16px', color: '#888' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <span>EXPLORER</span>
      </div>
      <div className="file-explorer-content">
        <div className="folder-section">
          <div className="folder-header">
            <span className="folder-icon">📁</span>
            <span className="folder-name">{rootPath.split(/[/\\]/).pop()}</span>
          </div>
          <div className="folder-content">
            {renderFileTree(files)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;
