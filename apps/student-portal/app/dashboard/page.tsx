'use client';

import { useCourses } from '@/hooks/use-courses';
import { useWallet } from '@/hooks/use-wallet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { wallet, isLoading: walletLoading } = useWallet();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Balance</h2>
          {walletLoading ? (
            <Skeleton className="h-12 w-32" />
          ) : (
            <p className="text-3xl font-bold">{wallet?.balance || 0} AZR</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">My Courses</h2>
          {coursesLoading ? (
            <Skeleton className="h-12 w-32" />
          ) : (
            <p className="text-3xl font-bold">{courses?.length || 0}</p>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Available Courses</h2>
        {coursesLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-3">
            {courses?.map((course: any) => (
              <div key={course.id} className="flex justify-between items-center p-4 border rounded">
                <div>
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                </div>
                <Button>Enroll</Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
