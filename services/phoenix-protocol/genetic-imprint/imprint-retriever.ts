
import { ImprintStorage } from './imprint-storage';
import { StateHasher } from './state-hasher';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
}

export class ImprintRetriever {
  constructor(
    private readonly imprintStorage: ImprintStorage,
    private readonly stateHasher: StateHasher
  ) {}

  public retrieveAndVerifyImprint(hash: string): FileNode | null {
    const state = this.imprintStorage.retrieveImprint(hash);
    if (state && this.stateHasher.verifyHash(state, hash)) {
      return state;
    }
    return null;
  }
}
