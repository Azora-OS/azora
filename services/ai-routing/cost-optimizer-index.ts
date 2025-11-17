/**
 * Cost Optimizer Index
 * Exports all cost optimization modules for easy integration
 */

export { CostOptimizer, TierCostConfig, CostMetrics, UserSpendingMetrics } from './cost-optimizer';
export { TierSelector, SelectionCriteria, TierSelectionResult, TierProfile } from './tier-selector';
export {
  CostAlertManager,
  AlertThreshold,
  AlertEvent,
  NotificationChannel,
  NotificationConfig
} from './cost-alerts';

/**
 * Cost Optimizer System
 * Provides complete cost management for AI routing
 *
 * Usage:
 * ```typescript
 * import { CostOptimizer, TierSelector, CostAlertManager } from './cost-optimizer-index';
 *
 * const costOptimizer = new CostOptimizer(prisma);
 * const tierSelector = new TierSelector(costOptimizer);
 * const alertManager = new CostAlertManager(prisma);
 *
 * // Calculate cost for a query
 * const cost = await costOptimizer.calculateCost(RoutingTier.RAP_SYSTEM, 100, 200);
 *
 * // Select optimal tier
 * const selection = await tierSelector.selectTier({
 *   complexity: QueryComplexity.MODERATE,
 *   userBudget: 1.0,
 *   prioritizeCost: true
 * });
 *
 * // Set up alerts
 * await alertManager.setAlertThreshold({
 *   userId: 'user-123',
 *   monthlyBudget: 100,
 *   warningThreshold: 0.75,
 *   criticalThreshold: 0.90,
 *   dailyLimit: 10
 * });
 * ```
 */
