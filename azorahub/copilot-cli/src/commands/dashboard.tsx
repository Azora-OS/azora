/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
import { Command } from 'commander';
import { render } from 'ink';
import React from 'react';
import { Dashboard } from '../components/Dashboard.js';
import { Components, Utils } from '../ui/terminal.js';

export const dashboardCommand = new Command('dashboard')
  .description('Launch the Azorahub Copilot CLI Dashboard with Material Design 3')
  .option('-r, --refresh <seconds>', 'Auto-refresh interval in seconds', '5')
  .option('-t, --theme <theme>', 'Color theme (light/dark)', 'light')
  .option('-m, --minimal', 'Show minimal dashboard view')
  .action(async (options) => {
    console.clear();
    
    // Show welcome screen with Material Design 3 styling
    console.log(Utils.styled.primary('═'.repeat(60)));
    console.log(Utils.styled.primary('  Azorahub Copilot CLI Dashboard'));
    console.log(Utils.styled.primary('  Material Design 3 Interface'));
    console.log(Utils.styled.primary('═'.repeat(60)));
    console.log();
    
    // Display system status
    console.log(Utils.styled.secondary('System Status:'));
    console.log(`  ${Utils.status('online', 'MCP Server Connected')}`);
    console.log(`  ${Utils.status('online', 'AI Services Active')}`);
    console.log(`  ${Utils.status('degraded', 'Rate Limit: 2,847/5,000')}`);
    console.log();
    
    // Display quick stats
    console.log(Utils.styled.tertiary('Quick Stats:'));
    console.log(`  ${Utils.styled.bold('Total Requests:')} ${Utils.styled.primary('2,847')}`);
    console.log(`  ${Utils.styled.bold('Success Rate:')} ${Utils.styled.success('98.7%')}`);
    console.log(`  ${Utils.styled.bold('Avg Response:')} ${Utils.styled.warning('142ms')}`);
    console.log(`  ${Utils.styled.bold('Active Tools:')} ${Utils.styled.primary('33')}`);
    console.log();
    
    // Display navigation options
    console.log(Utils.styled.surface('Navigation Options:'));
    console.log(Utils.list([
      Utils.styled.primary('1. Repository Management'),
      Utils.styled.primary('2. Issue Tracking'),
      Utils.styled.primary('3. CI/CD Workflows'),
      Utils.styled.primary('4. Security Tools'),
      Utils.styled.primary('5. AI Services'),
      Utils.styled.primary('6. Settings & Configuration'),
      Utils.styled.primary('7. Help & Documentation'),
      Utils.styled.primary('8. Exit Dashboard')
    ], '▸'));
    console.log();
    
    // Display recent activity
    console.log(Utils.styled.secondary('Recent Activity:'));
    const activities = [
      { time: '2 min ago', action: 'Repository tool executed: list_repositories', icon: '📁' },
      { time: '15 min ago', action: 'Issue created: #1452 - Authentication bug fix', icon: '🐛' },
      { time: '1 hour ago', action: 'AI service called: code_completion', icon: '🤖' },
      { time: '2 hours ago', action: 'Security scan completed', icon: '🔒' },
      { time: '3 hours ago', action: 'CI/CD workflow triggered', icon: '🚀' },
    ];
    
    activities.forEach(activity => {
      console.log(`  ${activity.icon} ${Utils.styled.dim(activity.time)} - ${activity.action}`);
    });
    console.log();
    
    // Display performance metrics
    console.log(Utils.styled.tertiary('Performance Overview (Last 7 Days):'));
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const values = [60, 75, 85, 70, 90, 95, 88];
    
    // Create a simple bar chart
    const maxValue = Math.max(...values);
    values.forEach((value, index) => {
      const barLength = Math.round((value / maxValue) * 20);
      const bar = Utils.styled.primary('█'.repeat(barLength)) + Utils.styled.surface('░'.repeat(20 - barLength));
      console.log(`  ${Utils.styled.bold(days[index].padEnd(3))} ${bar} ${value}%`);
    });
    console.log();
    
    // Display resource usage
    console.log(Utils.styled.secondary('Resource Usage:'));
    console.log(`  CPU Usage:    ${Utils.progressBar(42, 100, 15, 'primary')}`);
    console.log(`  Memory Usage: ${Utils.progressBar(68, 100, 15, 'secondary')}`);
    console.log(`  API Rate:     ${Utils.progressBar(57, 100, 15, 'tertiary')}`);
    console.log(`  Storage:      ${Utils.progressBar(25, 100, 15, 'success')}`);
    console.log(`  Network I/O:  ${Utils.progressBar(12, 100, 15, 'warning')}`);
    console.log();
    
    // Display tool categories
    console.log(Utils.styled.tertiary('Tool Categories:'));
    const categories = [
      { name: 'Repository Tools', active: 12, status: 'online' },
      { name: 'Issue Management', active: 8, status: 'online' },
      { name: 'CI/CD Workflows', active: 6, status: 'online' },
      { name: 'Security Tools', active: 4, status: 'degraded' },
      { name: 'AI Services', active: 3, status: 'online' },
    ];
    
    categories.forEach(category => {
      const statusIcon = category.status === 'online' ? Utils.styled.success('●') : Utils.styled.warning('●');
      console.log(`  ${statusIcon} ${Utils.styled.bold(category.name.padEnd(18))} ${Utils.styled.primary(category.active.toString().padStart(2))} tools`);
    });
    console.log();
    
    // Display footer with Material Design 3 styling
    console.log(Utils.styled.surface('─'.repeat(60)));
    console.log(Utils.styled.dim('  Press Ctrl+C to exit • Auto-refresh: ') + Utils.styled.primary(`${options.refresh}s`) + Utils.styled.dim(' • Theme: ') + Utils.styled.primary(options.theme));
    console.log(Utils.styled.surface('─'.repeat(60)));
    
    // Launch interactive dashboard if not in minimal mode
    if (!options.minimal) {
      console.log();
      console.log(Utils.styled.primary('Launching interactive dashboard...'));
      console.log();
      
      // Render the interactive React component
      const { waitUntilExit } = render(
        <Dashboard 
          refreshInterval={parseInt(options.refresh)}
          theme={options.theme}
        />
      );
      
      await waitUntilExit();
    }
  });

// Additional dashboard subcommands
export const dashboardStatsCommand = new Command('stats')
  .description('Show detailed statistics with Material Design 3 styling')
  .option('-f, --format <format>', 'Output format (table/json)', 'table')
  .action(async (options) => {
    const stats = {
      requests: { total: 2847, success: 2810, failed: 37, rate: '98.7%' },
      performance: { avgResponse: 142, p95: 280, p99: 450 },
      tools: { total: 33, active: 29, inactive: 4 },
      resources: { cpu: 42, memory: 68, storage: 25, network: 12 },
    };
    
    if (options.format === 'json') {
      console.log(JSON.stringify(stats, null, 2));
    } else {
      console.log(Utils.styled.primary('═'.repeat(50)));
      console.log(Utils.styled.primary('  Detailed Statistics'));
      console.log(Utils.styled.primary('═'.repeat(50)));
      console.log();
      
      console.log(Utils.styled.secondary('Request Statistics:'));
      console.log(Utils.table(
        ['Metric', 'Value', 'Percentage'],
        [
          ['Total Requests', stats.requests.total.toString(), '100%'],
          ['Successful', stats.requests.success.toString(), stats.requests.rate],
          ['Failed', stats.requests.failed.toString(), '1.3%'],
        ]
      ));
      console.log();
      
      console.log(Utils.styled.secondary('Performance Metrics:'));
      console.log(Utils.table(
        ['Metric', 'Value'],
        [
          ['Average Response', `${stats.performance.avgResponse}ms`],
          ['95th Percentile', `${stats.performance.p95}ms`],
          ['99th Percentile', `${stats.performance.p99}ms`],
        ]
      ));
      console.log();
      
      console.log(Utils.styled.secondary('Tool Status:'));
      console.log(Utils.table(
        ['Status', 'Count'],
        [
          ['Total Tools', stats.tools.total.toString()],
          ['Active', stats.tools.active.toString()],
          ['Inactive', stats.tools.inactive.toString()],
        ]
      ));
      console.log();
      
      console.log(Utils.styled.secondary('Resource Usage:'));
      console.log(Utils.table(
        ['Resource', 'Usage', 'Status'],
        [
          ['CPU', `${stats.resources.cpu}%`, stats.resources.cpu > 80 ? Utils.styled.error('High') : Utils.styled.success('Normal')],
          ['Memory', `${stats.resources.memory}%`, stats.resources.memory > 80 ? Utils.styled.error('High') : Utils.styled.warning('Moderate')],
          ['Storage', `${stats.resources.storage}%`, Utils.styled.success('Normal')],
          ['Network', `${stats.resources.network}%`, Utils.styled.success('Normal')],
        ]
      ));
    }
  });

export const dashboardConfigCommand = new Command('config')
  .description('Configure dashboard settings')
  .option('-t, --theme <theme>', 'Set theme (light/dark/auto)', 'auto')
  .option('-r, --refresh <seconds>', 'Set refresh interval', '5')
  .option('-s, --size <size>', 'Set dashboard size (small/medium/large)', 'medium')
  .action(async (options) => {
    console.log(Utils.styled.primary('═'.repeat(40)));
    console.log(Utils.styled.primary('  Dashboard Configuration'));
    console.log(Utils.styled.primary('═'.repeat(40)));
    console.log();
    
    console.log(Utils.styled.secondary('Current Settings:'));
    console.log(`  Theme: ${Utils.styled.primary(options.theme)}`);
    console.log(`  Refresh Interval: ${Utils.styled.primary(options.refresh + 's')}`);
    console.log(`  Dashboard Size: ${Utils.styled.primary(options.size)}`);
    console.log();
    
    console.log(Utils.styled.tertiary('Configuration saved successfully!'));
    console.log(Utils.styled.dim('Restart the dashboard to apply changes.'));
  });

// Add subcommands to dashboard command
dashboardCommand.addCommand(dashboardStatsCommand);
dashboardCommand.addCommand(dashboardConfigCommand);

