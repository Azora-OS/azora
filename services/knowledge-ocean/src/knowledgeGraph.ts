import { logger } from './logger';
import { KnowledgeNode } from './types';

interface GraphEdge {
  from: string;
  to: string;
  type: 'references' | 'imports' | 'extends' | 'implements' | 'calls';
  weight: number;
}

interface GraphNode extends KnowledgeNode {
  edges: GraphEdge[];
  version: number;
  previousVersions: string[];
}

export class KnowledgeGraph {
  private nodes = new Map<string, GraphNode>();
  private edges: GraphEdge[] = [];

  addNode(node: KnowledgeNode): void {
    const existing = this.nodes.get(node.id);
    const graphNode: GraphNode = {
      ...node,
      edges: existing?.edges ?? [],
      version: (existing?.version ?? 0) + 1,
      previousVersions: existing ? [...existing.previousVersions, `${node.id}@v${existing.version}`] : []
    };
    this.nodes.set(node.id, graphNode);
    logger.info({ nodeId: node.id, version: graphNode.version }, 'Node added to graph');
  }

  addEdge(edge: GraphEdge): void {
    const node = this.nodes.get(edge.from);
    if (node) {
      node.edges.push(edge);
      this.edges.push(edge);
    }
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getRelated(nodeId: string, maxDepth = 2): GraphNode[] {
    const visited = new Set<string>();
    const result: GraphNode[] = [];
    
    const traverse = (id: string, depth: number) => {
      if (depth > maxDepth || visited.has(id)) return;
      visited.add(id);
      
      const node = this.nodes.get(id);
      if (node) {
        result.push(node);
        for (const edge of node.edges) {
          traverse(edge.to, depth + 1);
        }
      }
    };

    traverse(nodeId, 0);
    return result;
  }

  findByType(type: string): GraphNode[] {
    return Array.from(this.nodes.values()).filter(n => n.type === type);
  }

  getVersionHistory(nodeId: string): string[] {
    const node = this.nodes.get(nodeId);
    return node?.previousVersions ?? [];
  }

  analyzeConnections(nodeId: string): { incoming: number; outgoing: number; types: Record<string, number> } {
    const node = this.nodes.get(nodeId);
    if (!node) return { incoming: 0, outgoing: 0, types: {} };

    const outgoing = node.edges.length;
    const incoming = this.edges.filter(e => e.to === nodeId).length;
    const types: Record<string, number> = {};

    for (const edge of node.edges) {
      types[edge.type] = (types[edge.type] ?? 0) + 1;
    }

    return { incoming, outgoing, types };
  }
}
