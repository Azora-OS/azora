'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EnrollmentButtonProps {
    courseId: string;
    userId: string;
    isEnrolled?: boolean;
}

export default function EnrollmentButton({ courseId, userId, isEnrolled = false }: EnrollmentButtonProps) {
    const [loading, setLoading] = useState(false);
    const [enrolled, setEnrolled] = useState(isEnrolled);
    const router = useRouter();

    const handleEnroll = async () => {
        if (!userId) {
            router.push('/login');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:3003/api/enrollments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // TODO: Add auth token
                },
                body: JSON.stringify({
                    userId,
                    courseId
                })
            });

            if (response.ok) {
                setEnrolled(true);
                router.refresh();
            } else {
                console.error('Enrollment failed');
            }
        } catch (error) {
            console.error('Error enrolling:', error);
        } finally {
            setLoading(false);
        }
    };

    if (enrolled) {
        return (
            <button
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium cursor-default"
                disabled
            >
                Enrolled ✅
            </button>
        );
    }

    return (
        <button
            onClick={handleEnroll}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
        >
            {loading ? 'Enrolling...' : 'Enroll Now'}
        </button>
    );
}
