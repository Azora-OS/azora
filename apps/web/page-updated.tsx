/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

WEB APP - UPDATED WITH LAYER 7 HOOKS
Uses real data from @azora/shared-design hooks
*/

'use client';

import { useWalletBalance, useStudentProgress, useHealthCheck } from '@azora/shared-design/hooks';
import { useEffect, useState } from 'react';

export default function WebPage() {
  // Get user ID from auth (would come from auth context in production)
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Get userId from auth context/session
    // For now, check localStorage or session
    const storedUserId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    setUserId(storedUserId);
  }, []);

  // Use real data hooks from Layer 7
  const { data: wallet, loading: walletLoading, error: walletError } = useWalletBalance(userId);
  const { data: progress, loading: progressLoading, error: progressError } = useStudentProgress(userId);
  const { data: health, loading: healthLoading, error: healthError } = useHealthCheck();

  if (!userId) {
    return (
      <div className="container">
        <h1>Azora OS</h1>
        <p>Please log in to view your dashboard</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>Azora OS Dashboard</h1>
        <p>Real Data | No Mocks | Constitutional Compliance</p>
      </header>

      <main>
        {/* Wallet Card */}
        <section className="card wallet-card">
          <h2>Wallet</h2>
          {walletLoading ? (
            <div className="loading">Loading wallet data...</div>
          ) : walletError ? (
            <div className="error">
              <p>Error loading wallet</p>
              <p className="error-detail">{walletError.message}</p>
            </div>
          ) : wallet ? (
            <div className="wallet-content">
              <div className="balance">
                <span className="amount">{wallet.balance.toFixed(2)}</span>
                <span className="currency">{wallet.currency}</span>
              </div>
              <div className="change">
                <span className={wallet.change >= 0 ? 'positive' : 'negative'}>
                  {wallet.change >= 0 ? '+' : ''}{wallet.change.toFixed(2)} ({wallet.changePercent.toFixed(2)}%)
                </span>
                <span className="label">24h change</span>
              </div>
            </div>
          ) : (
            <div className="no-data">No wallet data available</div>
          )}
        </section>

        {/* Progress Card */}
        <section className="card progress-card">
          <h2>Learning Progress</h2>
          {progressLoading ? (
            <div className="loading">Loading progress data...</div>
          ) : progressError ? (
            <div className="error">
              <p>Error loading progress</p>
              <p className="error-detail">{progressError.message}</p>
            </div>
          ) : progress ? (
            <div className="progress-content">
              <div className="stats">
                <div className="stat">
                  <span className="value">{progress.totalCourses}</span>
                  <span className="label">Total Courses</span>
                </div>
                <div className="stat">
                  <span className="value">{progress.completedCourses}</span>
                  <span className="label">Completed</span>
                </div>
                <div className="stat">
                  <span className="value">{progress.inProgressCourses}</span>
                  <span className="label">In Progress</span>
                </div>
                <div className="stat">
                  <span className="value">{progress.averageProgress.toFixed(1)}%</span>
                  <span className="label">Avg Progress</span>
                </div>
              </div>
              
              {progress.recentActivity.length > 0 && (
                <div className="recent-activity">
                  <h3>Recent Activity</h3>
                  <ul>
                    {progress.recentActivity.map((activity, idx) => (
                      <li key={idx}>
                        <span className="course">{activity.courseTitle}</span>
                        <span className="progress">{activity.progress}%</span>
                        <span className="date">{new Date(activity.lastActivity).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="no-data">No progress data available</div>
          )}
        </section>

        {/* Health Status Card */}
        <section className="card health-card">
          <h2>System Health</h2>
          {healthLoading ? (
            <div className="loading">Loading health status...</div>
          ) : healthError ? (
            <div className="error">
              <p>Error loading health status</p>
              <p className="error-detail">{healthError.message}</p>
            </div>
          ) : health ? (
            <div className="health-content">
              <div className={`status-badge ${health.status}`}>
                {health.status.toUpperCase()}
              </div>
              
              <div className="services">
                <h3>Services</h3>
                <ul>
                  {health.services.map((service, idx) => (
                    <li key={idx} className={`service ${service.status}`}>
                      <span className="name">{service.name}</span>
                      <span className="status">{service.status}</span>
                      {service.latency !== undefined && (
                        <span className="latency">{service.latency}ms</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="timestamp">
                Last updated: {new Date(health.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ) : (
            <div className="no-data">No health data available</div>
          )}
        </section>
      </main>

      <footer>
        <p>Azora OS - Constitutional AI Operating System</p>
        <p>Article XVI: No Mock Protocol - ENFORCED</p>
      </footer>
    </div>
  );
}
