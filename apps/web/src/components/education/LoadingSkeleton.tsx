import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-white/10", className)}
            {...props}
        />
    );
};

export const CardSkeleton: React.FC = () => {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
            </div>
        </div>
    );
};
