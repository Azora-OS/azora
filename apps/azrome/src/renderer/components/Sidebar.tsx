import React from 'react';

interface SidebarProps {
    activeTool: string;
    onSelectTool: (tool: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelectTool }) => {
    const tools = [
        { id: 'explorer', icon: '📁', label: 'Explorer' },
        { id: 'search', icon: '🔍', label: 'Search' },
        { id: 'git', icon: '🌱', label: 'Source Control' },
        { id: 'debug', icon: '🐞', label: 'Run & Debug' },
        { id: 'extensions', icon: '🧩', label: 'Extensions' },
        { id: 'learning', icon: '🎓', label: 'Learning Mode' },
        { id: 'clone', icon: '🚀', label: 'Clone & Build' },
    ];

    return (
        <aside className="azrome-sidebar">
            <div className="sidebar-tools">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        className={`sidebar-tool ${activeTool === tool.id ? 'active' : ''}`}
                        onClick={() => onSelectTool(tool.id)}
                        title={tool.label}
                    >
                        <span className="tool-icon">{tool.icon}</span>
                    </button>
                ))}
            </div>
            <div className="sidebar-bottom">
                <button className="sidebar-tool" title="Settings">⚙️</button>
                <button className="sidebar-tool" title="Account">👤</button>
            </div>
        </aside>
    );
};
