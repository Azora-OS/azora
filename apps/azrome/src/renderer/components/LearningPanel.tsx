import React from 'react';

export const LearningPanel: React.FC = () => {
    const tutorials = [
        { id: 1, title: 'Intro to Azrome', duration: '5 min', level: 'Beginner' },
        { id: 2, title: 'Building your first App', duration: '15 min', level: 'Intermediate' },
        { id: 3, title: 'AI-Powered Coding', duration: '10 min', level: 'Advanced' },
    ];

    return (
        <div className="sidebar-panel learning-panel">
            <h3>🎓 Learning Mode</h3>
            <div className="tutorial-list">
                {tutorials.map((t) => (
                    <div key={t.id} className="tutorial-card">
                        <div className="tutorial-title">{t.title}</div>
                        <div className="tutorial-meta">
                            <span>{t.duration}</span> • <span>{t.level}</span>
                        </div>
                        <button className="start-btn">Start</button>
                    </div>
                ))}
            </div>
        </div>
    );
};
