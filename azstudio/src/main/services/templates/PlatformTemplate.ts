import { FileChange } from '../ChangesetManager';

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: 'education' | 'marketplace' | 'saas' | 'ecommerce' | 'community';
  features: string[];
  version: string;
}

export interface PlatformTemplate {
  getMetadata(): TemplateMetadata;
  generate(config: any): FileChange[];
}
