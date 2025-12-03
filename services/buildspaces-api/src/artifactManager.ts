import { EventBus } from '../../../packages/shared/event-bus/src/index';

interface Artifact {
  id: string;
  jobId: string;
  name: string;
  path: string;
  size: number;
  createdAt: string;
}

export class ArtifactManager {
  private artifacts = new Map<string, Artifact>();
  private bus: EventBus;

  constructor(bus?: EventBus) {
    this.bus = bus ?? new EventBus();
  }

  async store(jobId: string, name: string, path: string, size: number): Promise<string> {
    const id = `${jobId}-${name}`;
    const artifact: Artifact = {
      id,
      jobId,
      name,
      path,
      size,
      createdAt: new Date().toISOString()
    };
    
    this.artifacts.set(id, artifact);
    await this.bus.publish('artifact.stored', artifact);
    
    return id;
  }

  get(id: string): Artifact | undefined {
    return this.artifacts.get(id);
  }

  listByJob(jobId: string): Artifact[] {
    return Array.from(this.artifacts.values()).filter(a => a.jobId === jobId);
  }

  async deploy(artifactId: string, target: string): Promise<void> {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact) throw new Error('Artifact not found');
    
    await this.bus.publish('artifact.deploy', { artifactId, target, artifact });
  }
}
