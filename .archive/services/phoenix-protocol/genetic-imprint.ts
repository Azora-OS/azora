
import { StateCapturer } from './genetic-imprint/state-capturer';
import { StateHasher } from './genetic-imprint/state-hasher';
import { ImprintStorage } from './genetic-imprint/imprint-storage';
import { ImprintRetriever } from './genetic-imprint/imprint-retriever';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
}

export class GeneticImprintModule {
  private readonly stateCapturer: StateCapturer;
  private readonly stateHasher: StateHasher;
  private readonly imprintStorage: ImprintStorage;
  private readonly imprintRetriever: ImprintRetriever;

  constructor(basePath: string, storagePath: string) {
    this.stateCapturer = new StateCapturer(basePath);
    this.stateHasher = new StateHasher();
    this.imprintStorage = new ImprintStorage(storagePath);
    this.imprintRetriever = new ImprintRetriever(this.imprintStorage, this.stateHasher);
  }

  public captureAndStoreImprint(): string {
    const state = this.stateCapturer.captureState();
    const hash = this.stateHasher.hashState(state);
    this.imprintStorage.storeImprint(hash, state);
    return hash;
  }

  public retrieveAndVerifyImprint(hash: string): FileNode | null {
    return this.imprintRetriever.retrieveAndVerifyImprint(hash);
  }
}
