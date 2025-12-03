import React, { useEffect, useState } from 'react';
import { CourseService, CourseProgress } from '../services/course-service';

interface ProgressTrackerProps {
    courseId: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ courseId }) => {
    const [progress, setProgress] = useState<CourseProgress | null>(null);
    const [loading, setLoading] = useState(true);

    const courseService = new CourseService();

    useEffect(() => {
        loadProgress();
    }, [courseId]);

    const loadProgress = async () => {
        setLoading(true);
        const data = await courseService.getCourseProgress(courseId);
        setProgress(data);
        setLoading(false);
    };

    if (loading) {
        return <div className="progress-tracker loading">Loading progress...</div>;
    }

    if (!progress) {
        return <div className="progress-tracker">No progress data available</div>;
    }

    const progressPercentage = progress.progress;
    const completedCount = progress.completedLessons.length;
    const totalCount = progress.totalLessons;

    return (
        <div className="progress-tracker">
            <h4>Your Progress</h4>

            <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progressPercentage}%` }}>
                    <span className="progress-text">{progressPercentage}%</span>
                </div>
            </div>

            <div className="progress-stats">
                <div className="stat">
                    <span className="stat-label">Completed Lessons:</span>
                    <span className="stat-value">{completedCount} / {totalCount}</span>
                </div>
                <div className="stat">
                    <span className="stat-label">Last Accessed:</span>
                    <span className="stat-value">{new Date(progress.lastAccessed).toLocaleDateString()}</span>
                </div>
            </div>

            <style jsx>{`
        .progress-tracker {
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
          margin: 20px 0;
        }

        .progress-tracker h4 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .progress-bar-container {
          width: 100%;
          height: 30px;
          background: #e0e0e0;
          border-radius: 15px;
          overflow: hidden;
          position: relative;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #45a049);
          transition: width 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress-text {
          color: white;
          font-weight: bold;
          font-size: 14px;
        }

        .progress-stats {
          margin-top: 15px;
          display: flex;
          gap: 30px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
        }

        .stat-value {
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }

        .loading {
          text-align: center;
          color: #666;
        }
      `}</style>
        </div>
    );
};
