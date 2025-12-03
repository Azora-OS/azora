import React from 'react';

interface PermissionPanelProps {
    projectPath: string;
}

const PermissionPanel: React.FC<PermissionPanelProps> = ({ projectPath }) => {
  return (
    <div className="permission-panel">
      <h3>Permissions for {projectPath}</h3>
      <div className="permission-list">
        <p>No explicit permissions configured.</p>
      </div>
    </div>
  );
};

export default PermissionPanel;
