// Task 21.3: Test autoscaling behavior
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface PodMetrics {
  name: string;
  replicas: number;
  cpu: string;
  memory: string;
}

export async function getPodMetrics(namespace: string, deployment: string): Promise<PodMetrics> {
  const { stdout } = await execAsync(`kubectl get deployment ${deployment} -n ${namespace} -o json`);
  const data = JSON.parse(stdout);
  
  return {
    name: deployment,
    replicas: data.status.replicas || 0,
    cpu: data.spec.template.spec.containers[0].resources.requests.cpu,
    memory: data.spec.template.spec.containers[0].resources.requests.memory,
  };
}

export async function triggerLoad(url: string, duration: number) {
  await execAsync(`k6 run --duration ${duration}s --vus 1000 tests/performance/load-tests-staging.ts`);
}

export async function validateAutoscaling(namespace: string, deployment: string) {
  const initial = await getPodMetrics(namespace, deployment);
  console.log('Initial replicas:', initial.replicas);
  
  await triggerLoad('https://staging.azora.world', 300);
  await new Promise(resolve => setTimeout(resolve, 60000));
  
  const scaled = await getPodMetrics(namespace, deployment);
  console.log('Scaled replicas:', scaled.replicas);
  
  await new Promise(resolve => setTimeout(resolve, 300000));
  
  const final = await getPodMetrics(namespace, deployment);
  console.log('Final replicas:', final.replicas);
  
  return {
    scaleUp: scaled.replicas > initial.replicas,
    scaleDown: final.replicas < scaled.replicas,
  };
}
