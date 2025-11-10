/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

AZORA UI - UPDATED WITH LAYER 7 HOOKS
Uses real data from @azora/shared-design hooks
*/

import { useWalletBalance, useStudentProgress, useHealthCheck } from '@azora/shared-design/hooks';

export default function AzoraUIPage() {
  // Get user ID from auth context (would come from auth system)
  const userId = 'user-123'; // TODO: Get from auth context

  // Use real data hooks from Layer 7
  const { data: wallet, loading: walletLoading, error: walletError } = useWalletBalance(userId);
  const { data: progress, loading: progressLoading, error: progressError } = useStudentProgress(userId);
  const { data: health, loading: healthLoading, error: healthError } = useHealthCheck();

  return (
    <div className="azora-ui-container">
      <h1>Azora OS Dashboard</h1>
      
      {/* Wallet Display */}
      <section className="wallet-section">
        <h2>Wallet</h2>
        {walletLoading ? (
          <div>Loading wallet...</div>
        ) : walletError ? (
          <div className="error">Error loading wallet: {walletError.message}</div>
        ) : wallet ? (
          <div>
            <p>Balance: {wallet.balance} {wallet.currency}</p>
            <p>Change (24h): {wallet.change > 0 ? '+' : ''}{wallet.change} ({wallet.changePercent.toFixed(2)}%)</p>
          </div>
        ) : null}
      </section>

      {/* Progress Display */}
      <section className="progress-section">
        <h2>Learning Progress</h2>
        {progressLoading ? (
          <div>Loading progress...</div>
        ) : progressError ? (
          <div className="error">Error loading progress: {progressError.message}</div>
        ) : progress ? (
          <div>
            <p>Total Courses: {progress.totalCourses}</p>
            <p>Completed: {progress.completedCourses}</p>
            <p>In Progress: {progress.inProgressCourses}</p>
            <p>Average Progress: {progress.averageProgress.toFixed(1)}%</p>
            <div>
              <h3>Recent Activity</h3>
              <ul>
                {progress.recentActivity.map((activity, idx) => (
                  <li key={idx}>
                    {activity.courseTitle}: {activity.progress}% - {activity.lastActivity.toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </section>

      {/* Health Status */}
      <section className="health-section">
        <h2>System Health</h2>
        {healthLoading ? (
          <div>Loading health status...</div>
        ) : healthError ? (
          <div className="error">Error loading health: {healthError.message}</div>
        ) : health ? (
          <div>
            <p>Status: <span className={health.status}>{health.status}</span></p>
            <div>
              <h3>Services</h3>
              <ul>
                {health.services.map((service, idx) => (
                  <li key={idx}>
                    {service.name}: {service.status} {service.latency ? `(${service.latency}ms)` : ''}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
