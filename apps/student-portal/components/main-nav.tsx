'use client';

import Link from "next/link";
import { cn } from "@/lib/utils";

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/courses"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Courses
      </Link>
      <Link
        href="/tutor"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        AI Tutor
      </Link>
      <Link
        href="/dashboard"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Dashboard
      </Link>
    </nav>
  );
}
