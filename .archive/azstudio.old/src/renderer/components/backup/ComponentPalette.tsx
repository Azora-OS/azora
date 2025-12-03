import React from 'react';
import './ComponentPalette.css';

interface PaletteItem {
  id: string;
  type: 'service' | 'ui' | 'database' | 'api';
  label: string;
  icon: string;
  description: string;
}

const paletteItems: PaletteItem[] = [
  // Services
  { id: 'auth', type: 'service', label: 'Auth Service', icon: '🔐', description: 'Authentication & authorization' },
  { id: 'payment', type: 'service', label: 'Payment Service', icon: '💳', description: 'Payment processing' },
  { id: 'email', type: 'service', label: 'Email Service', icon: '📧', description: 'Email notifications' },
  { id: 'storage', type: 'service', label: 'Storage Service', icon: '📦', description: 'File storage' },
  
  // Databases
  { id: 'postgresql', type: 'database', label: 'PostgreSQL', icon: '🐘', description: 'Relational database' },
  { id: 'mongodb', type: 'database', label: 'MongoDB', icon: '🍃', description: 'Document database' },
  { id: 'redis', type: 'database', label: 'Redis', icon: '⚡', description: 'Cache & sessions' },
  
  // UI Components
  { id: 'page', type: 'ui', label: 'Page', icon: '📄', description: 'Full page component' },
  { id: 'component', type: 'ui', label: 'Component', icon: '🧩', description: 'Reusable UI component' },
  { id: 'layout', type: 'ui', label: 'Layout', icon: '📐', description: 'Page layout wrapper' },
  
  // API Endpoints
  { id: 'get', type: 'api', label: 'GET Endpoint', icon: '🔍', description: 'Fetch data' },
  { id: 'post', type: 'api', label: 'POST Endpoint', icon: '📝', description: 'Create data' },
  { id: 'put', type: 'api', label: 'PUT Endpoint', icon: '✏️', description: 'Update data' },
  { id: 'delete', type: 'api', label: 'DELETE Endpoint', icon: '🗑️', description: 'Delete data' },
];

interface ComponentPaletteProps {
  onItemSelect?: (item: PaletteItem) => void;
}

const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onItemSelect }) => {
  const groupedItems = {
    service: paletteItems.filter(item => item.type === 'service'),
    database: paletteItems.filter(item => item.type === 'database'),
    ui: paletteItems.filter(item => item.type === 'ui'),
    api: paletteItems.filter(item => item.type === 'api'),
  };

  const handleItemClick = (item: PaletteItem) => {
    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  return (
    <div className="component-palette">
      <div className="palette-header">
        <span>COMPONENTS</span>
      </div>
      
      <div className="palette-content">
        <div className="palette-section">
          <div className="palette-section-title">Services</div>
          {groupedItems.service.map(item => (
            <div
              key={item.id}
              className="palette-item"
              onClick={() => handleItemClick(item)}
              draggable
              title={item.description}
            >
              <span className="palette-item-icon">{item.icon}</span>
              <span className="palette-item-label">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="palette-section">
          <div className="palette-section-title">Databases</div>
          {groupedItems.database.map(item => (
            <div
              key={item.id}
              className="palette-item"
              onClick={() => handleItemClick(item)}
              draggable
              title={item.description}
            >
              <span className="palette-item-icon">{item.icon}</span>
              <span className="palette-item-label">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="palette-section">
          <div className="palette-section-title">UI Components</div>
          {groupedItems.ui.map(item => (
            <div
              key={item.id}
              className="palette-item"
              onClick={() => handleItemClick(item)}
              draggable
              title={item.description}
            >
              <span className="palette-item-icon">{item.icon}</span>
              <span className="palette-item-label">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="palette-section">
          <div className="palette-section-title">API Endpoints</div>
          {groupedItems.api.map(item => (
            <div
              key={item.id}
              className="palette-item"
              onClick={() => handleItemClick(item)}
              draggable
              title={item.description}
            >
              <span className="palette-item-icon">{item.icon}</span>
              <span className="palette-item-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComponentPalette;
