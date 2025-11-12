interface Student {
  id: string;
  skills: string[];
  experience: number;
  completedProjects: number;
  rating: number;
}

interface Project {
  skills: string[];
  budget: number;
  deadline: Date;
}

interface Match {
  studentId: string;
  score: number;
}

export class SmartMatchingAlgorithm {
  matchStudentsToProject(project: Project, students: Student[]): Match[] {
    return students
      .map(student => ({
        studentId: student.id,
        score: this.calculateMatchScore(project, student)
      }))
      .filter(match => match.score > 0.5)
      .sort((a, b) => b.score - a.score);
  }

  private calculateMatchScore(project: Project, student: Student): number {
    const skillMatch = this.calculateSkillMatch(project.skills, student.skills);
    const experienceScore = Math.min(student.experience / 5, 1);
    const reputationScore = student.rating / 5;
    const projectHistoryScore = Math.min(student.completedProjects / 10, 1);
    
    return (
      skillMatch * 0.4 +
      experienceScore * 0.2 +
      reputationScore * 0.3 +
      projectHistoryScore * 0.1
    );
  }

  private calculateSkillMatch(required: string[], studentSkills: string[]): number {
    const matches = required.filter(skill => 
      studentSkills.some(s => s.toLowerCase() === skill.toLowerCase())
    );
    return required.length > 0 ? matches.length / required.length : 0;
  }
}
