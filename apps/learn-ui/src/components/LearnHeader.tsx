import { ServiceLogo, ElaraAvatar, colors } from '@azora/branding'
import { BookOpen, GraduationCap, Award, TrendingUp } from 'lucide-react'

export function LearnHeader() {
  return (
    <header className="border-b bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <ServiceLogo service="education" size={40} animated />
          <div>
            <h1 className="text-lg font-bold">Azora Learn</h1>
            <p className="text-sm text-muted-foreground">Advanced Learning Management</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20">
            <Award className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium">Level 12</span>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="/courses" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <BookOpen className="h-4 w-4" />
            Courses
          </a>
          <a href="/degrees" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <GraduationCap className="h-4 w-4" />
            Degrees
          </a>
          <a href="/progress" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
            <TrendingUp className="h-4 w-4" />
            Progress
          </a>
        </nav>
        
        <ElaraAvatar variant="core" mood="learning" size={32} />
      </div>
    </header>
  )
}