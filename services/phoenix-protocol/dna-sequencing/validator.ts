
import { StateCapturer } from '../genetic-imprint/state-capturer';
import { StateHasher } from '../genetic-imprint/state-hasher';

export class Validator {
  private readonly stateCapturer: StateCapturer;
  private readonly stateHasher: StateHasher;

  constructor(private readonly basePath: string) {
    this.stateCapturer = new StateCapturer(basePath);
    this.stateHasher = new StateHasher();
  }

  public validate(expectedHash: string): boolean {
    const capturedState = this.stateCapturer.captureState();
    return this.stateHasher.verifyHash(capturedState, expectedHash);
  }
}
