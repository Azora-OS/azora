import { EventEmitter } from 'events';

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  skills: string[];
  deadline: Date;
  clientId: string;
  status: 'open' | 'matched' | 'active' | 'completed';
  revenueGenerated: number;
}

interface Student {
  id: string;
  skills: string[];
  experience: number;
  completedProjects: number;
  rating: number;
}

export class RevenueProjectEngine extends EventEmitter {
  private projects: Map<string, Project> = new Map();
  private readonly PLATFORM_FEE = 0.10;

  createProject(data: Omit<Project, 'id' | 'status' | 'revenueGenerated'>): Project {
    const project: Project = {
      ...data,
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'open',
      revenueGenerated: 0
    };
    
    this.projects.set(project.id, project);
    this.emit('project:created', project);
    return project;
  }

  matchProject(projectId: string, studentId: string): boolean {
    const project = this.projects.get(projectId);
    if (!project || project.status !== 'open') return false;
    
    project.status = 'matched';
    this.emit('project:matched', { projectId, studentId });
    return true;
  }

  completeProject(projectId: string, revenue: number): { studentEarnings: number; platformFee: number } {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');
    
    project.status = 'completed';
    project.revenueGenerated = revenue;
    
    const platformFee = revenue * this.PLATFORM_FEE;
    const studentEarnings = revenue - platformFee;
    
    this.emit('project:completed', { projectId, revenue, studentEarnings, platformFee });
    return { studentEarnings, platformFee };
  }

  getOpenProjects(): Project[] {
    return Array.from(this.projects.values()).filter(p => p.status === 'open');
  }

  getTotalRevenue(): number {
    return Array.from(this.projects.values())
      .reduce((sum, p) => sum + p.revenueGenerated, 0);
  }
}
