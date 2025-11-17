# Phase 2: Hard Tasks - Implementation Plan

## Overview

This implementation plan breaks down the three hard tasks into discrete, manageable coding steps. Each task builds incrementally on previous steps, starting with foundational infrastructure and progressing to integration and testing.

---

## Token Burn & Economic Engine

- [x] 1. Set up token burn infrastructure and data models






  - Create Prisma schema for BurnTransaction, ProofOfKnowledge, and TokenSupply models
  - Create database migration for token burn tables
  - Define TypeScript interfaces for burn calculations and blockchain interactions
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implement burn calculation engine





  - Create TokenBurnCalculator service with methods for sale (5%), withdrawal (3%), and redemption (2%) burns
  - Implement burn amount calculation logic with proper decimal handling
  - Add validation for burn rates and transaction amounts
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. Implement blockchain token burn execution





  - Create BlockchainBurnService to execute burns on blockchain
  - Integrate with existing blockchain client (Web3)
  - Implement transaction signing and verification
  - Add retry logic for failed transactions
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 4. Implement burn tracking and supply management




  - Create BurnTracker service to log all burn transactions
  - Implement getTotalBurnedSupply() to calculate cumulative burns
  - Create supply update mechanism that reflects burns in token supply
  - Add historical burn data retrieval
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 5. Implement System Buy-Order mechanism





  - Create SystemBuyOrder service that purchases AZR tokens using 10% of Rand revenue
  - Implement revenue tracking from course sales and subscriptions
  - Create automated buy-order execution on schedule (daily/weekly)
  - Add buy-order history and metrics tracking
  - _Requirements: 1.5_

- [x] 6. Implement Proof-of-Knowledge validator

















# Step 1 - Check for Tests
- Existing tests found under:
  - tests/, tests/__tests__/, tests/integration/, tests/e2e/, services/*/__tests__/, apps/*/api/*, etc.
- Framework: Jest (jest.config.js, jest.setup.js present), plus Playwright for e2e (playwright.config.ts, tests/e2e/*).
- No new tests required.

# Step 2 - Scan for Cleanup Targets
- Numerous console.log statements across tools/launchers and scripts; acceptable in CLI tooling, but excessive/noisy in operational launchers.
- Found TODOs and commented-out imports in tools/launchers/ingest-llmora-sources.ts.
- No code changes requested outside cleanup scope; limit to obvious debug/log noise and TODO clutter in operational paths.

# Step 3 - Remove or Fix
- Keep console logs in CLI scripts that intentionally provide progress UX.
- Clean up a concrete file with clear debug/TODO clutter:
  - tools/launchers/ingest-llmora-sources.ts
    - Remove stale TODO comments and commented-out imports that are not used.
    - Keep user-facing logs but normalize a malformed concatenated log line.

# Step 4 - Refactor for DRY
- N/A for broader code without structural rewrites. Applied minimal normalization to one file.

# Step 5 - Validate the Changes
- Use existing Jest/Playwright configs. (No failing tests expected due to non-functional cleanup.)

# Step 6 - Keep It Minimal
- Only targeted edits in a single file.

--- PATCH START ---
diff --git a/tools/launchers/ingest-llmora-sources.ts b/tools/launchers/ingest-llmora-sources.ts
index 0000000..0000001 100644
--- a/tools/launchers/ingest-llmora-sources.ts
+++ b/tools/launchers/ingest-llmora-sources.ts
@@
-// TODO: Implement these core services
-// import { AIIngestionService } from '../../core/system-core/ai-ingestion.js';
 async function ingestLLMoraSources() {
   console.log('🚀 Starting LLMora ingestion...');
   const root = path.resolve(__dirname, '../../');
@@
   console.log('🧠 LLMORA KNOWLEDGE INGESTION');
   console.log('================================');
-  console.log(`Root directory: ${root}`);
-  console.log('================================\n');  if (!token) {
+  console.log(`Root directory: ${root}`);
+  console.log('================================\n');
+  if (!token) {
     console.log('⚠️  No GITHUB_TOKEN found. You may hit rate limits.');
     console.log('   Set GITHUB_TOKEN for better throughput.\n');
   }
@@
-  // TODO: Implement AI ingestion service
-  // const svc = new AIIngestionService(root, token);
   console.log('⚠️  AIIngestionService not implemented yet - skipping ingestion');
   const knowledgeDir = path.join(root, '.elara', 'knowledge', 'repos');
@@
   console.log('📚 Target Repositories:\n');
   LLMORA_TARGETS.forEach((target, i) => {
     console.log(`${i + 1}. ${target.owner}/${target.repo} (${target.priority})`);
     console.log(`   Focus: ${target.focus.join(', ')}`);
     console.log('');
   });
@@
-  // TODO: Implement actual ingestion
   console.log('� Repository ingestion skipped (services not implemented)\n');
   // const ingested: string[] = [];
@@
-  // TODO: Implement pattern learning
   console.log('\n🧠 Pattern learning skipped (services not implemented)');
   // const kg = new KnowledgeGraph(root);
@@
   console.log('\n📊 Pattern Learning Summary:');
   console.log(`   Patterns discovered: 0 (not implemented)`);
   console.log(`   Files analyzed: 0 (not implemented)`);
   console.log(`   Repos processed: ${LLMORA_TARGETS.length}`);
@@
   await fs.writeFile(summaryPath, summary);
   console.log(`\n📄 Learning summary saved to: LLMORA-INGESTION-SUMMARY.md`);
@@
   console.log('\n✨ LLMora knowledge ingestion complete!');
   console.log('\n🎯 Next: Review the ingested data and extract patterns.');
@@
-    case 'launch':
-  console.log('   Start with: cat .elara/knowledge/repos/ollama__ollama.json | jq .readmeText\n');
-}
+  console.log('   Start with: cat .elara/knowledge/repos/ollama__ollama.json | jq .readmeText\n');
+}
--- PATCH END ---# Step 1 - Check for Tests
- Existing tests found under:
  - tests/, tests/__tests__/, tests/integration/, tests/e2e/, services/*/__tests__/, apps/*/api/*, etc.
- Framework: Jest (jest.config.js, jest.setup.js present), plus Playwright for e2e (playwright.config.ts, tests/e2e/*).
- No new tests required.

# Step 2 - Scan for Cleanup Targets
- Numerous console.log statements across tools/launchers and scripts; acceptable in CLI tooling, but excessive/noisy in operational launchers.
- Found TODOs and commented-out imports in tools/launchers/ingest-llmora-sources.ts.
- No code changes requested outside cleanup scope; limit to obvious debug/log noise and TODO clutter in operational paths.

# Step 3 - Remove or Fix
- Keep console logs in CLI scripts that intentionally provide progress UX.
- Clean up a concrete file with clear debug/TODO clutter:
  - tools/launchers/ingest-llmora-sources.ts
    - Remove stale TODO comments and commented-out imports that are not used.
    - Keep user-facing logs but normalize a malformed concatenated log line.

# Step 4 - Refactor for DRY
- N/A for broader code without structural rewrites. Applied minimal normalization to one file.

# Step 5 - Validate the Changes
- Use existing Jest/Playwright configs. (No failing tests expected due to non-functional cleanup.)

# Step 6 - Keep It Minimal
- Only targeted edits in a single file.

--- PATCH START ---
diff --git a/tools/launchers/ingest-llmora-sources.ts b/tools/launchers/ingest-llmora-sources.ts
index 0000000..0000001 100644
--- a/tools/launchers/ingest-llmora-sources.ts
+++ b/tools/launchers/ingest-llmora-sources.ts
@@
-// TODO: Implement these core services
-// import { AIIngestionService } from '../../core/system-core/ai-ingestion.js';
 async function ingestLLMoraSources() {
   console.log('🚀 Starting LLMora ingestion...');
   const root = path.resolve(__dirname, '../../');
@@
   console.log('🧠 LLMORA KNOWLEDGE INGESTION');
   console.log('================================');
-  console.log(`Root directory: ${root}`);
-  console.log('================================\n');  if (!token) {
+  console.log(`Root directory: ${root}`);
+  console.log('================================\n');
+  if (!token) {
     console.log('⚠️  No GITHUB_TOKEN found. You may hit rate limits.');
     console.log('   Set GITHUB_TOKEN for better throughput.\n');
   }
@@
-  // TODO: Implement AI ingestion service
-  // const svc = new AIIngestionService(root, token);
   console.log('⚠️  AIIngestionService not implemented yet - skipping ingestion');
   const knowledgeDir = path.join(root, '.elara', 'knowledge', 'repos');
@@
   console.log('📚 Target Repositories:\n');
   LLMORA_TARGETS.forEach((target, i) => {
     console.log(`${i + 1}. ${target.owner}/${target.repo} (${target.priority})`);
     console.log(`   Focus: ${target.focus.join(', ')}`);
     console.log('');
   });
@@
-  // TODO: Implement actual ingestion
   console.log('� Repository ingestion skipped (services not implemented)\n');
   // const ingested: string[] = [];
@@
-  // TODO: Implement pattern learning
   console.log('\n🧠 Pattern learning skipped (services not implemented)');
   // const kg = new KnowledgeGraph(root);
@@
   console.log('\n📊 Pattern Learning Summary:');
   console.log(`   Patterns discovered: 0 (not implemented)`);
   console.log(`   Files analyzed: 0 (not implemented)`);
   console.log(`   Repos processed: ${LLMORA_TARGETS.length}`);
@@
   await fs.writeFile(summaryPath, summary);
   console.log(`\n📄 Learning summary saved to: LLMORA-INGESTION-SUMMARY.md`);
@@
   console.log('\n✨ LLMora knowledge ingestion complete!');
   console.log('\n🎯 Next: Review the ingested data and extract patterns.');
@@
-    case 'launch':
-  console.log('   Start with: cat .elara/knowledge/repos/ollama__ollama.json | jq .readmeText\n');
-}
+  console.log('   Start with: cat .elara/knowledge/repos/ollama__ollama.json | jq .readmeText\n');
+}
--- PATCH END ---

  - Create ProofOfKnowledgeValidator service
  - Implement course completion verification logic
  - Create certificate generation with verification hash
  - Add gating logic to prevent token redemption without proof
  - _Requirements: 1.7_



- [ ] 7. Implement psychological reluctance-to-sell messaging






  - Create messaging service that calculates effective sell price after burn
  - Implement UI messaging that shows burn impact on user holdings
  - Add warnings when selling would result in significant loss
  - Create educational content about token economics


  - _Requirements: 1.6_

- [x] 8. Integrate burn mechanism into existing payment flows







  - Update course purchase endpoint to trigger burn on sale
  - Update withdrawal endpoint to trigger burn on earnings withdrawal
  - Update token redemption endpoint to trigger burn on redemption
  - Add burn transaction logging to all flows
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 9. Implement leaderboard ranking updates based on ownership percentage








  - Create LeaderboardUpdater service that recalculates rankings
  - Implement percentage ownership calculation (user tokens / total supply)
  - Update leaderboard on every burn event
  - Add historical ranking tracking
  - _Requirements: 1.8_
-

- [ ] 10. Write unit tests for token burn engine





  - Test burn calculation for all transaction types
  - Test blockchain transaction execution
  - Test supply tracking accuracy
  - Test buy-order logic
  - Test proof-of-knowledge validation
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.7_


- [ ] 11. Write integration tests for token burn flows





  - Test complete sale → burn → supply update flow
  - Test withdrawal → burn → balance update flow
  - Test redemption → burn → feature access flow
  - Test leaderboard ranking updates
  - _Requirements: 1.1, 1.2, 1.3, 1.8_

---

## Hierarchical AI Routing System
-

- [x] 12. Set up AI routing infrastructure and data models


  - Create Prisma schema for QueryClassification and RoutingMetrics models
  - Create database migration for AI routing tables
  - Define TypeScript interfaces for query classification and routing
  - Set up Redis cache for routing decisions and responses
  - _Requirements: 2.1, 2.2, 2.3, 2.4_


- [x] 13. Implement query classifier

  - Create QueryClassifier service with complexity detection logic
  - Implement classification rules for simple (FAQ, search), moderate (analysis), and complex (strategic) queries
  - Add confidence scoring for classifications
  - Create classification metrics tracking
  - _Requirements: 2.1_

- [x] 14. Implement Local LLM routing (Route A)

  - Set up Llama/Phi quantized model integration
  - Create LocalLLMService for on-device inference
  - Implement model loading and caching
  - Add response formatting and error handling
  - _Requirements: 2.2_



- [ ] 15. Implement Knowledge Ocean retriever





  - Create KnowledgeOceanRetriever service
  - Implement vector database integration for embeddings
  - Create 70/30 rule implementation (70% internal, 30% external sources)
  - Add context ranking and relevance scoring
  - _Requirements: 2.5_


- [x] 16. Implement RAP system routing (Route B)




  - Create RAPService that combines Knowledge Ocean retrieval with external LLM
  - Implement retrieval-augmented prompt generation
  - Add context injection into prompts
  - Create response synthesis from retrieved context
  - _Requirements: 2.3, 2.5_


- [x] 17. Implement external LLM routing (Route C)





  - Create ExternalLLMService for OpenAI GPT-4 integration
  - Implement API call management and error handling
  - Add response caching to minimize API calls
  - Create cost tracking per API call
  - _Requirements: 2.4_



- [-] 18. Implement hierarchical routing orchestrator




  - Create HierarchicalAIRouter that coordinates all three routes
  - Implement routing decision logic based on query classification
  - Add fallback logic (if Route A fails, try Route B, then Route C)
  - Implement latency monitoring and threshold-based fallback
  - _Requirements: 2.1, 2.2, 2.3, 2.4_


- [ ] 19. Implement cost optimization and caching


  - Create CostOptimizer service that tracks spending per routing tier
  - Implement response caching with TTL
  - Add cache hit/miss metrics
  - Create cost threshold alerts
  - _Requirements: 2.6, 2.7_


- [ ] 20. Integrate AI routing into API gateway

  - Update API gateway to classify incoming queries
  - Add routing decision middleware
  - Implement response validation before returning to client
  - Add routing metrics to request context
  - _Requirements: 2.1, 2.2, 2.3, 2.4_


- [ ] 21. Write unit tests for AI routing

  - Test query classification accuracy
  - Test routing decision logic
  - Test Local LLM inference
  - Test Knowledge Ocean retrieval
  - Test RAP system prompt generation
  - Test cost optimization
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [ ] 22. Write integration tests for AI routing flows


  - Test complete query → classify → route → respond flow
  - Test fallback logic when routes fail
  - Test caching and cost optimization
  - Test latency monitoring and threshold-based fallback
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7_

---


## Constitutional AI Framework

- [ ] 23. Set up constitutional AI infrastructure and data models

  - Create Prisma schema for ConstitutionalValidation and ComplianceMetrics models
  - Create database migration for constitutional AI tables
  - Define TypeScript interfaces for validation rules and compliance checking
  - Set up audit logging for all constitutional decisions
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 24. Implement Ubuntu principles validator

  - Create UbuntuPrinciplesValidator service
  - Implement rules for collective benefit (promotes community, not individual gain)
  - Implement rules for knowledge sharing (educational, transparent)
  - Implement rules for inclusive design (accessible, non-discriminatory)
  - Add scoring mechanism for principle compliance
  - _Requirements: 3.1_

- [ ] 25. Implement pro-social output filter

  - Create ProSocialFilter service
  - Implement rules for ethical behavior promotion
  - Implement rules for community benefit
  - Implement rules for educational value
  - Add filtering logic to reject non-compliant outputs
  - _Requirements: 3.2_

- [ ] 26. Implement bias detection and mitigation

  - Create BiasDetector service
  - Implement demographic bias detection (gender, race, age, etc.)
  - Create bias mitigation strategies (rebalancing, alternative phrasing)
  - Add bias metrics and reporting
  - _Requirements: 3.7_

- [ ] 27. Implement privacy-first filtering



  - Create PrivacyFilter service
  - Implement rules for PII protection (no email, phone, address exposure)
  - Implement rules for consent respect (only use data user agreed to)
  - Add privacy violation detection and logging
  - _Requirements: 3.5_

- [ ] 28. Implement harm prevention system

  - Create HarmPreventionSystem service
  - Implement rules for refusing harmful requests (violence, illegal, dangerous)
  - Create explanation messages for refusals
  - Add harm risk scoring (none, low, medium, high)
  - _Requirements: 3.6_

- [ ] 29. Implement constitutional validation orchestrator

  - Create ConstitutionalAIFramework that coordinates all validators
  - Implement validation pipeline (Ubuntu → ProSocial → Bias → Privacy → Harm)
  - Add validation result aggregation
  - Create compliance scoring
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 30. Implement multi-agent orchestration with constitutional constraints

  - Create MultiAgentOrchestrator service
  - Implement agent communication protocol
  - Add constitutional compliance checking for each agent
  - Create conflict resolution logic (when agents disagree)
  - _Requirements: 3.3_

- [ ] 31. Integrate constitutional AI into response pipeline

  - Update AI routing response handler to validate outputs
  - Add constitutional validation before returning responses
  - Implement rejection and regeneration logic
  - Add compliance metrics to response metadata
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 32. Implement constitutional compliance audit logging

  - Create AuditLogger for all constitutional decisions
  - Log all validations (passed, failed, regenerated)
  - Track compliance metrics over time
  - Create compliance reports and dashboards
  - _Requirements: 3.8_

- [ ] 33. Write unit tests for constitutional AI


  - Test Ubuntu principles validation
  - Test pro-social filtering
  - Test bias detection
  - Test privacy filtering
  - Test harm prevention
  - Test multi-agent orchestration
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 34. Write integration tests for constitutional AI flows

  - Test complete output generation → validation → filtering flow
  - Test multi-agent coordination with constitutional constraints
  - Test compliance metrics and audit logging
  - Test rejection and regeneration flows
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

---

## Test Coverage Fixes

- [ ] 35. Fix token rewards test mocks

  - Review existing token rewards tests
  - Identify mock setup issues
  - Implement proper mock factories and fixtures
  - Ensure all tests pass with correct mocks
  - _Requirements: 4.1_


- [ ] 36. Fix enterprise licensing test mocks
  - Review existing enterprise licensing tests
  - Identify mock setup issues
  - Implement proper mock factories and fixtures
  - Ensure all tests pass with correct mocks
  - _Requirements: 4.2_


- [ ] 37. Verify E2E test coverage
  - Review existing E2E tests
  - Ensure critical user journeys are covered
  - Add missing E2E tests for new features
  - Verify all tests pass
  - _Requirements: 4.3_

- [ ] 38. Generate coverage reports and verify 80%+ coverage

  - Run coverage analysis across all modules
  - Identify coverage gaps
  - Add tests to reach 80%+ coverage
  - Generate and review coverage reports
  - _Requirements: 4.4, 4.5_

---

## Integration & Verification


- [ ] 39. Integrate all Phase 2 components
  - Wire token burn engine into payment flows
  - Wire AI routing into API gateway
  - Wire constitutional AI into response pipeline
  - Verify all components communicate correctly
  - _Requirements: 1.1-1.8, 2.1-2.7, 3.1-3.8_

- [ ] 40. End-to-end verification of Phase 2

  - Test complete token burn flow (sale → burn → supply → leaderboard)
  - Test complete AI routing flow (query → classify → route → validate → respond)
  - Test complete constitutional AI flow (output → validate → filter → return)
  - Verify all metrics and logging working
  - _Requirements: 1.1-1.8, 2.1-2.7, 3.1-3.8_

</content>
</invoke>