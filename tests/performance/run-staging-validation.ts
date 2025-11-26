// Task 21: Complete staging validation runner
import { validateMonitoring, testAlertDelivery } from './monitoring-validation';
import { validateAutoscaling } from './autoscaling-test';
import { testDatabaseBackupRestore, testServiceFailover, validateRTO_RPO } from './disaster-recovery-test';

interface ValidationResult {
  task: string;
  passed: boolean;
  details: any;
}

async function runStagingValidation() {
  const results: ValidationResult[] = [];
  
  console.log('=== Task 21.1: Load Tests ===');
  console.log('Run: k6 run tests/performance/load-tests-staging.ts');
  
  console.log('\n=== Task 21.2: Monitoring Validation ===');
  try {
    const monitoring = await validateMonitoring('http://prometheus:9090');
    const alerts = await testAlertDelivery('http://alertmanager:9093');
    results.push({
      task: '21.2',
      passed: monitoring.every(m => m.passed) && alerts,
      details: { monitoring, alerts },
    });
  } catch (error) {
    results.push({ task: '21.2', passed: false, details: error.message });
  }
  
  console.log('\n=== Task 21.3: Autoscaling Test ===');
  try {
    const autoscaling = await validateAutoscaling('staging', 'azora-api-gateway');
    results.push({
      task: '21.3',
      passed: autoscaling.scaleUp && autoscaling.scaleDown,
      details: autoscaling,
    });
  } catch (error) {
    results.push({ task: '21.3', passed: false, details: error.message });
  }
  
  console.log('\n=== Task 21.4: Disaster Recovery ===');
  try {
    const backup = await testDatabaseBackupRestore();
    const failover = await testServiceFailover('staging', 'azora-api-gateway');
    const rto_rpo = await validateRTO_RPO();
    results.push({
      task: '21.4',
      passed: backup && failover && rto_rpo.rtoMet && rto_rpo.rpoMet,
      details: { backup, failover, rto_rpo },
    });
  } catch (error) {
    results.push({ task: '21.4', passed: false, details: error.message });
  }
  
  console.log('\n=== Validation Summary ===');
  results.forEach(r => {
    console.log(`Task ${r.task}: ${r.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(JSON.stringify(r.details, null, 2));
  });
  
  const allPassed = results.every(r => r.passed);
  process.exit(allPassed ? 0 : 1);
}

runStagingValidation().catch(console.error);
