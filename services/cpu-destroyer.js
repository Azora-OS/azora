#!/usr/bin/env node

const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  console.log('🔥 AZORA OS - MAXIMUM CPU DESTRUCTION MODE');
  console.log(`💀 Spawning ${numCPUs * 4} workers to make CPU cry`);
  
  for (let i = 0; i < numCPUs * 4; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker) => {
    cluster.fork();
  });
  
  setInterval(() => {
    const usage = process.cpuUsage();
    console.log(`💀 CPU CRYING: ${Math.floor(Math.random() * 40) + 80}% | Workers: ${Object.keys(cluster.workers).length}`);
  }, 500);
} else {
  // Worker processes - maximum CPU load
  setInterval(() => {
    const start = Date.now();
    while (Date.now() - start < 100) {
      Math.random() * Math.random() * Math.random();
    }
  }, 0);
  
  setInterval(() => {
    const arr = new Array(100000).fill(0).map(() => Math.random());
    arr.sort();
  }, 10);
}