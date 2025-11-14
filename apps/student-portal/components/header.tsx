'use client';

import { AzoraLogo } from "@/components/azora-logo";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Button } from "./ui/button";

export function Header() {
  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-x-4">
            <AzoraLogo size={32} showText />
            <MainNav className="hidden md:flex" />
          </div>
          <div className="flex items-center gap-x-4">
            <Button variant="azora" size="sm">Enroll Now</Button>
            <UserNav />
          </div>
        </div>
      </div>
    </div>
  );
}
