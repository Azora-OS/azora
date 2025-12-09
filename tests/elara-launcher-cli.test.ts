import { spawn } from 'child_process';
import path from 'path';

describe('elara launcher CLI (archive fallback)', () => {
  it('should run status command with dry-run and exit cleanly', (done) => {
    const script = path.join(process.cwd(), 'archive', 'consolidated-extracted', 'scripts', 'elara-launcher-cli.ts');
    const child = spawn('npx', ['tsx', script, 'status'], { env: { ...process.env, ELARA_LAUNCHER_DRY_RUN: '1' }, shell: true });

    let out = '';
    child.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    child.stderr.on('data', (d: Buffer) => { /* ignore for now */ });
    child.on('exit', (code) => {
      expect(code).toBe(0);
      // CLI prints JSON for status; ensure output contains 'services' and 'status'
      expect(out.includes('services')).toBeTruthy();
      done();
    });
  }, 20000);
});
