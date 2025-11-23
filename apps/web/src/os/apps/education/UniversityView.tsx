import React from 'react';
import { CourseCatalog } from '@/components/education/CourseCatalog';


interface UniversityViewProps {
    onCourseSelect?: (courseId: string) => void;
}

export const UniversityView: React.FC<UniversityViewProps> = ({ onCourseSelect }) => {
    // In a real app, we might pass specific university data to CourseCatalog
    // For now, we use the CourseCatalog as the main university interface
    return (
        <div className="h-full">
            <CourseCatalog onCourseSelect={onCourseSelect || (() => { })} />
        </div>
    );
};

