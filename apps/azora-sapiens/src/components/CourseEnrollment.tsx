import React, { useState } from 'react';
import { CourseService, Course } from '../services/course-service';

interface CourseEnrollmentProps {
    course: Course;
    onEnrollmentSuccess?: () => void;
}

export const CourseEnrollment: React.FC<CourseEnrollmentProps> = ({ course, onEnrollmentSuccess }) => {
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [enrollmentStatus, setEnrollmentStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const courseService = new CourseService();

    const handleEnroll = async () => {
        setIsEnrolling(true);
        setEnrollmentStatus('idle');

        try {
            const result = await courseService.enrollInCourse(course.id, 'azr');

            if (result.success) {
                setEnrollmentStatus('success');
                setMessage('Successfully enrolled! You can now access the course.');
                if (onEnrollmentSuccess) {
                    onEnrollmentSuccess();
                }
            } else {
                setEnrollmentStatus('error');
                setMessage(result.message || 'Enrollment failed. Please try again.');
            }
        } catch (error) {
            setEnrollmentStatus('error');
            setMessage('An error occurred. Please try again later.');
        } finally {
            setIsEnrolling(false);
        }
    };

    return (
        <div className="course-enrollment">
            <div className="course-info">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-meta">
                    <span>Instructor: {course.instructor}</span>
                    <span>Duration: {course.duration}</span>
                    <span>Price: {course.price} AZR</span>
                </div>
            </div>

            <button
                onClick={handleEnroll}
                disabled={isEnrolling}
                className={`enroll-button ${isEnrolling ? 'loading' : ''}`}
            >
                {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>

            {enrollmentStatus === 'success' && (
                <div className="alert alert-success">
                    {message}
                </div>
            )}

            {enrollmentStatus === 'error' && (
                <div className="alert alert-error">
                    {message}
                </div>
            )}

            <style jsx>{`
        .course-enrollment {
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          margin: 20px 0;
        }

        .course-info h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .course-meta {
          display: flex;
          gap: 20px;
          margin-top: 10px;
          font-size: 14px;
          color: #666;
        }

        .enroll-button {
          margin-top: 20px;
          padding: 12px 24px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          transition: background 0.3s;
        }

        .enroll-button:hover:not(:disabled) {
          background: #45a049;
        }

        .enroll-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .enroll-button.loading {
          opacity: 0.7;
        }

        .alert {
          margin-top: 15px;
          padding: 12px;
          border-radius: 4px;
        }

        .alert-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .alert-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
      `}</style>
        </div>
    );
};
