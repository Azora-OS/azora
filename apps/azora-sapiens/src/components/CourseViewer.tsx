import React, { useState } from 'react';
import { AITutorChat } from './AITutorChat';

interface Course {
    id: string;
    title: string;
    modules: {
        id: string;
        title: string;
        content: string;
    }[];
}

export const CourseViewer: React.FC = () => {
    const [activeModule, setActiveModule] = useState(0);
    const [showTutor, setShowTutor] = useState(false);

    // Mock Course Data
    const course: Course = {
        id: 'c1',
        title: 'Introduction to Self-Sovereign Identity',
        modules: [
            {
                id: 'm1',
                title: 'What is SSI?',
                content: 'Self-Sovereign Identity (SSI) is a model for managing digital identities in which individuals have sole ownership and control over their ability to create, control, and present their credentials.'
            },
            {
                id: 'm2',
                title: 'Verifiable Credentials',
                content: 'Verifiable Credentials (VCs) are the digital equivalent of physical credentials like a driver\'s license or diploma. They are cryptographically signed and tamper-evident.'
            }
        ]
    };

    const currentModule = course.modules[activeModule];

    return (
        <div className="course-viewer">
            <div className="main-content">
                <header className="course-header">
                    <h1>{course.title}</h1>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${((activeModule + 1) / course.modules.length) * 100}%` }}
                        />
                    </div>
                </header>

                <div className="module-content">
                    <h2>{currentModule.title}</h2>
                    <p>{currentModule.content}</p>
                </div>

                <div className="navigation">
                    <button
                        disabled={activeModule === 0}
                        onClick={() => setActiveModule(m => m - 1)}
                    >
                        Previous
                    </button>
                    <button
                        disabled={activeModule === course.modules.length - 1}
                        onClick={() => setActiveModule(m => m + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>

            <div className={`tutor-panel ${showTutor ? 'open' : ''}`}>
                <button
                    className="toggle-tutor"
                    onClick={() => setShowTutor(!showTutor)}
                >
                    {showTutor ? 'Close Tutor' : 'Ask AI Tutor'}
                </button>

                {showTutor && (
                    <div className="tutor-container">
                        <AITutorChat
                            courseId={course.id}
                            courseName={course.title}
                            currentTopic={currentModule.title}
                        />
                    </div>
                )}
            </div>

            <style jsx>{`
        .course-viewer {
          display: flex;
          height: 100vh;
          background: #f7fafc;
          font-family: 'Inter', sans-serif;
        }

        .main-content {
          flex: 1;
          padding: 40px;
          overflow-y: auto;
        }

        .course-header h1 {
          color: #2d3748;
          margin-bottom: 20px;
        }

        .progress-bar {
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          margin-bottom: 40px;
        }

        .progress-fill {
          height: 100%;
          background: #667eea;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .module-content {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          margin-bottom: 30px;
          line-height: 1.6;
          color: #4a5568;
        }

        .navigation {
          display: flex;
          justify-content: space-between;
        }

        button {
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          background: #cbd5e0;
          color: #4a5568;
          cursor: pointer;
          font-weight: 600;
        }

        button:not(:disabled) {
          background: #667eea;
          color: white;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tutor-panel {
          width: 350px;
          background: white;
          border-left: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          position: fixed;
          right: 0;
          top: 0;
          bottom: 0;
          transform: translateX(100%);
          transition: transform 0.3s ease;
          box-shadow: -2px 0 10px rgba(0,0,0,0.05);
        }

        .tutor-panel.open {
          transform: translateX(0);
        }

        .toggle-tutor {
          position: absolute;
          left: -120px;
          top: 20px;
          background: #805ad5;
          color: white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .tutor-container {
          flex: 1;
          height: 100%;
        }
      `}</style>
        </div>
    );
};
