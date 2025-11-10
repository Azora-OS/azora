/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

INFRASTRUCTURE MONITORING DASHBOARD
React component for monitoring infrastructure status
*/

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, Waves, Network, TreePine, Activity } from 'lucide-react';

interface InfrastructureStatus {
  tree: {
    roots: Array<{ id: string; name: string; health: string }>;
    branches: Array<{ id: string; name: string; health: string }>;
    networkHealth: string;
  };
  cdn: {
    totalNodes: number;
    healthyNodes: number;
    regions: string[];
  };
  rivers: {
    totalFlows: number;
    flowingFlows: number;
    totalThroughput: number;
  };
  mycelium: {
    nodes: Array<{ id: string; serviceName: string; health: string }>;
    networkHealth: string;
  };
}

export function InfrastructureDashboard() {
  const [status, setStatus] = useState<InfrastructureStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('/api/infrastructure/status');
        const data = await response.json();
        if (data.success) {
          setStatus(data.data);
        } else {
          setError(new Error(data.error || 'Failed to fetch status'));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch status'));
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="text-destructive p-4">
        Error: {error?.message || 'Failed to load infrastructure status'}
      </div>
    );
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'bg-success text-success-foreground';
      case 'degraded':
        return 'bg-warning text-warning-foreground';
      case 'down':
      case 'disconnected':
      case 'fragmented':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Infrastructure Status</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CDN Status */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">CDN Network</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Nodes</span>
              <span className="font-semibold">{status.cdn.totalNodes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Healthy</span>
              <Badge className={getHealthColor(status.cdn.healthyNodes === status.cdn.totalNodes ? 'healthy' : 'degraded')}>
                {status.cdn.healthyNodes}/{status.cdn.totalNodes}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Regions</span>
              <span className="font-semibold">{status.cdn.regions.length}</span>
            </div>
          </div>
        </Card>

        {/* River Flows */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Waves className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">River Flows</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Flows</span>
              <span className="font-semibold">{status.rivers.totalFlows}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Flowing</span>
              <Badge className={getHealthColor(status.rivers.flowingFlows === status.rivers.totalFlows ? 'healthy' : 'degraded')}>
                {status.rivers.flowingFlows}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Throughput</span>
              <span className="font-semibold">{status.rivers.totalThroughput}</span>
            </div>
          </div>
        </Card>

        {/* Mycelium Network */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Network className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">Mycelium Network</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nodes</span>
              <span className="font-semibold">{status.mycelium.nodes.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Health</span>
              <Badge className={getHealthColor(status.mycelium.networkHealth)}>
                {status.mycelium.networkHealth}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Healthy Nodes</span>
              <span className="font-semibold">
                {status.mycelium.nodes.filter(n => n.health === 'healthy').length}
              </span>
            </div>
          </div>
        </Card>

        {/* Tree Architecture */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TreePine className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">Tree Architecture</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Roots</span>
              <span className="font-semibold">{status.tree.roots.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Branches</span>
              <span className="font-semibold">{status.tree.branches.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Health</span>
              <Badge className={getHealthColor(status.tree.networkHealth)}>
                {status.tree.networkHealth}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roots */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Roots</h3>
          <div className="space-y-2">
            {status.tree.roots.map(root => (
              <div key={root.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded">
                <span className="font-medium">{root.name}</span>
                <Badge className={getHealthColor(root.health)}>
                  {root.health}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Branches */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Branches</h3>
          <div className="space-y-2">
            {status.tree.branches.map(branch => (
              <div key={branch.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded">
                <span className="font-medium">{branch.name}</span>
                <Badge className={getHealthColor(branch.health)}>
                  {branch.health}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default InfrastructureDashboard;
