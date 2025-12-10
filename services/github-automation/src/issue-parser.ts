/**
 * Issue Parser
 * Parses GitHub issues and extracts metadata for routing
 */

export interface ParsedIssue {
  id: number;
  title: string;
  body: string;
  author: string;
  labels: string[];
  suggestedAgent: 'sankofa' | 'themba' | 'jabari' | 'nia' | 'imani';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedComplexity: 'simple' | 'moderate' | 'complex' | 'expert';
  requiredSkills: string[];
}

export class IssueParser {
  /**
   * Parse a GitHub issue and extract metadata
   */
  parse(issue: Record<string, unknown>): ParsedIssue {
    const body = (issue.body as string) || '';
    const labels = ((issue.labels as Array<Record<string, string>>) || [])
      .map((l) => l.name || '');

    return {
      id: (issue.number as number) || 0,
      title: (issue.title as string) || '',
      body,
      author: ((issue.user as Record<string, string>)?.login as string) || '',
      labels,
      suggestedAgent: this.chooseBestAgent(body, labels),
      priority: this.assessPriority(labels, body),
      estimatedComplexity: this.assessComplexity(body),
      requiredSkills: this.extractSkills(labels, body)
    };
  }

  /**
   * Choose the best agent for this issue
   */
  private chooseBestAgent(
    body: string,
    labels: string[]
  ): 'sankofa' | 'themba' | 'jabari' | 'nia' | 'imani' {
    const lowerBody = body.toLowerCase();

    // Sankofa (Knowledge/History)
    if (
      labels.includes('documentation') ||
      labels.includes('research') ||
      lowerBody.includes('pattern') ||
      lowerBody.includes('history')
    ) {
      return 'sankofa';
    }

    // Themba (Trust/Ethics)
    if (
      labels.includes('security') ||
      labels.includes('ethics') ||
      lowerBody.includes('safe') ||
      lowerBody.includes('audit')
    ) {
      return 'themba';
    }

    // Jabari (Courage/Action)
    if (
      labels.includes('bug') ||
      labels.includes('feature') ||
      lowerBody.includes('build') ||
      lowerBody.includes('fix')
    ) {
      return 'jabari';
    }

    // Nia (Purpose/Vision)
    if (
      labels.includes('epic') ||
      labels.includes('planning') ||
      lowerBody.includes('vision') ||
      lowerBody.includes('strategy')
    ) {
      return 'nia';
    }

    // Default: Imani (Resilience)
    return 'imani';
  }

  /**
   * Assess issue priority
   */
  private assessPriority(labels: string[], body: string): 'low' | 'medium' | 'high' | 'critical' {
    if (labels.includes('critical') || labels.includes('security')) return 'critical';
    if (labels.includes('high') || labels.includes('urgent')) return 'high';
    if (labels.includes('medium')) return 'medium';
    return 'low';
  }

  /**
   * Estimate issue complexity
   */
  private assessComplexity(body: string): 'simple' | 'moderate' | 'complex' | 'expert' {
    const wordCount = body.split(/\s+/).length;
    const codeBlockCount = (body.match(/```/g) || []).length;

    if (wordCount > 500 && codeBlockCount > 2) return 'expert';
    if (wordCount > 300 && codeBlockCount > 1) return 'complex';
    if (wordCount > 150) return 'moderate';
    return 'simple';
  }

  /**
   * Extract required skills from labels and body
   */
  private extractSkills(labels: string[], body: string): string[] {
    const skills = new Set<string>();

    // From labels
    for (const label of labels) {
      if (label.includes('typescript') || label.includes('ts')) skills.add('TypeScript');
      if (label.includes('react')) skills.add('React');
      if (label.includes('sql') || label.includes('database')) skills.add('SQL');
      if (label.includes('devops') || label.includes('docker')) skills.add('DevOps');
      if (label.includes('ai') || label.includes('ml')) skills.add('AI/ML');
    }

    // From body keywords
    const keywords: Record<string, string> = {
      'typescript|ts': 'TypeScript',
      'react|jsx': 'React',
      'sql|postgres|mysql': 'SQL',
      'docker|kubernetes': 'DevOps',
      'python|ml': 'AI/ML'
    };

    for (const [pattern, skill] of Object.entries(keywords)) {
      if (new RegExp(pattern).test(body.toLowerCase())) {
        skills.add(skill);
      }
    }

    return Array.from(skills);
  }
}
