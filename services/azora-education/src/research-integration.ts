import axios from 'axios';

export class ResearchIntegration {
  private researchCenterUrl = process.env.RESEARCH_CENTER_URL || 'http://localhost:3023';

  async syncCurriculum() {
    const { data } = await axios.get(`${this.researchCenterUrl}/api/curriculum-recommendations`);
    return data.recommendations;
  }

  async getEmergingTrends() {
    const { data } = await axios.get(`${this.researchCenterUrl}/api/trends`);
    return data.trends;
  }

  async updateCourseContent(courseId: string) {
    const trends = await this.getEmergingTrends();
    const recommendations = await this.syncCurriculum();
    
    return {
      courseId,
      updatedTopics: this.mergeWithTrends(trends),
      newMaterials: this.generateFromResearch(recommendations),
      lastSync: new Date()
    };
  }

  private mergeWithTrends(trends: any[]) {
    return trends.map(t => ({ topic: t.name, relevance: t.score }));
  }

  private generateFromResearch(recommendations: any[]) {
    return recommendations.map(r => ({ title: r.title, content: r.summary }));
  }

  async submitStudentResearch(studentId: string, research: any) {
    const { data } = await axios.post(`${this.researchCenterUrl}/api/projects`, {
      title: research.title,
      author: studentId,
      abstract: research.abstract,
      type: 'student'
    });
    return data.project;
  }
}
