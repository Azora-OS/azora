
import { Sequencer } from './dna-sequencing/sequencer';
import { Validator } from './dna-sequencing/validator';
import { MutationDetector } from './dna-sequencing/mutation-detector';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
}

export class DnaSequencingModule {
  private readonly sequencer: Sequencer;
  private readonly validator: Validator;
  private readonly mutationDetector: MutationDetector;

  constructor(basePath: string) {
    this.sequencer = new Sequencer(basePath);
    this.validator = new Validator(basePath);
    this.mutationDetector = new MutationDetector(basePath);
  }

  public sequence(node: FileNode): void {
    this.sequencer.sequence(node);
  }

  public validate(expectedHash: string): boolean {
    return this.validator.validate(expectedHash);
  }

  public detectMutations(originalHash: string): any | null {
    return this.mutationDetector.detectMutations(originalHash);
  }
}
