/**
 * Azora Supreme Organism - Entry Point
 * Starts the integration bridge and connects all services
 */

import express from 'express';
import { AzoraIntegrationBridge } from './integration-bridge';

const app = express();
app.use(express.json());

// Initialize the organism
const organism = new AzoraIntegrationBridge({
  healthCheckInterval: 30000, // 30 seconds
  autoHealing: true,
  resourceFlowEnabled: true,
});

// API Endpoints

app.get('/health', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/organism/status', (req, res) => {
  const status = organism.getOrganismStatus();
  res.json(status);
});

app.get('/api/services', (req, res) => {
  const services = organism.getAllServices();
  res.json(services);
});

app.get('/api/services/:serviceId', (req, res) => {
  const service = organism.getServiceStatus(req.params.serviceId);
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }
  res.json(service);
});

app.get('/api/resource-flows', (req, res) => {
  const flows = organism.getResourceFlows();
  res.json(flows);
});

app.get('/api/healing-actions', (req, res) => {
  const actions = organism.getHealingActions();
  res.json(actions);
});

app.post('/api/organism/start', async (req, res) => {
  await organism.start();
  res.json({ message: 'Organism started' });
});

app.post('/api/organism/stop', async (req, res) => {
  await organism.stop();
  res.json({ message: 'Organism stopped' });
});

// Event listeners
organism.on('organism-started', () => {
  console.log('🌟 ORGANISM IS ALIVE!');
});

organism.on('organism-degraded', (data) => {
  console.log(`⚠️ Organism health degraded: ${data.health}%`);
});

organism.on('resource-flow', (flow) => {
  console.log(`💰 Resource flow: ${flow.from} → ${flow.to} (${flow.amount} ${flow.resourceType})`);
});

organism.on('healing-completed', (action) => {
  console.log(`✅ Healing completed: ${action.healer} healed ${action.patient}`);
});

organism.on('healing-failed', (action) => {
  console.log(`❌ Healing failed: ${action.healer} → ${action.patient}`);
});

organism.on('rule-triggered', (rule) => {
  console.log(`⚡ Rule triggered: ${rule.name}`);
});

// Start server
const PORT = process.env.PORT || 3100;

app.listen(PORT, async () => {
  console.log(`🌟 Azora Supreme Organism running on port ${PORT}`);
  console.log('');
  console.log('🫀 Heart (Mint) - Ready to pump value');
  console.log('🧠 Brain (Education) - Ready to create knowledge');
  console.log('💪 Muscles (Forge/Careers) - Ready to do work');
  console.log('🛡️ Immune (Aegis) - Ready to protect');
  console.log('🔗 Nerves (Nexus) - Ready to communicate');
  console.log('');
  
  // Auto-start organism
  await organism.start();
});

export default organism;
