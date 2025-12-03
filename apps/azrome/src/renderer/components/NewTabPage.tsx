import React from 'react';

interface NewTabPageProps {
    onNavigate: (url: string) => void;
}

export const NewTabPage: React.FC<NewTabPageProps> = ({ onNavigate }) => {
    const recentProjects = [
        { name: 'Azora Sapiens', path: 'apps/azora-sapiens', lastEdited: '2 mins ago' },
        { name: 'Azora BuildSpaces', path: 'apps/azora-buildspaces', lastEdited: '1 hour ago' },
        { name: 'Azora UI', path: 'apps/azora-ui', lastEdited: '3 hours ago' },
    ];

    const quickLinks = [
        { name: 'Azora World', url: 'https://azora.world', icon: '🌍' },
        { name: 'Documentation', url: 'https://docs.azora.world', icon: '📚' },
        { name: 'GitHub', url: 'https://github.com/azora', icon: '🐙' },
        { name: 'Localhost:3000', url: 'http://localhost:3000', icon: '💻' },
    ];

    return (
        <div className="new-tab-page">
            <div className="ntp-header">
                <h1>Azrome</h1>
                <p className="ntp-subtitle">The Azora-Native Browser</p>
            </div>

            <div className="ntp-search">
                <input
                    type="text"
                    placeholder="Search or enter website name"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onNavigate((e.target as HTMLInputElement).value);
                        }
                    }}
                />
            </div>

            <div className="ntp-section">
                <h2>Quick Access</h2>
                <div className="quick-links-grid">
                    {quickLinks.map((link) => (
                        <button
                            key={link.name}
                            className="quick-link-card"
                            onClick={() => onNavigate(link.url)}
                        >
                            <span className="link-icon">{link.icon}</span>
                            <span className="link-name">{link.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="ntp-section">
                <h2>Recent Projects</h2>
                <div className="projects-list">
                    {recentProjects.map((project) => (
                        <div key={project.name} className="project-item">
                            <div className="project-icon">📦</div>
                            <div className="project-info">
                                <div className="project-name">{project.name}</div>
                                <div className="project-path">{project.path}</div>
                            </div>
                            <div className="project-meta">{project.lastEdited}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
