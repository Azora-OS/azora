/*
 * jest test for elara-master-launcher
 */

import { elaraMasterLauncher } from '../genome/elara-master-launcher';

describe('elaraMasterLauncher', () => {
  beforeEach(() => {
    process.env.ELARA_LAUNCHER_DRY_RUN = '1';
  });

  afterEach(() => {
    delete process.env.ELARA_LAUNCHER_DRY_RUN;
  });

  it('should report system status and simulate launch/stop in dry run mode', async () => {
    const initial = elaraMasterLauncher.getSystemStatus();
    expect(initial).toBeDefined();

    await elaraMasterLauncher.launchAllServices();
    const started = elaraMasterLauncher.getSystemStatus();
    expect(started.services.length).toBeGreaterThan(0);
    for (const svc of started.services) {
      expect(svc.status === 'running' || svc.status === 'starting').toBeTruthy();
    }

    await elaraMasterLauncher.stopAllServices();
    const stopped = elaraMasterLauncher.getSystemStatus();
    for (const svc of stopped.services) {
      expect(svc.status === 'stopped').toBeTruthy();
    }
  });
});
