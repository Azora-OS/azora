import React from 'react';

export const Skeleton = ({ className }: { className?: string }) => {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
    );
};

export const CardSkeleton = () => {
    return (
        <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
        </div>
    );
};

export const ListSkeleton = ({ items = 3 }: { items?: number }) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
};
