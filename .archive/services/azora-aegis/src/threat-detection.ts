import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ThreatEvent {
  ip: string;
  userId?: string;
  type: 'BRUTE_FORCE' | 'SQL_INJECTION' | 'XSS' | 'DDOS' | 'SUSPICIOUS_ACTIVITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: any;
}

const THREAT_THRESHOLDS = {
  BRUTE_FORCE: 5,
  RATE_LIMIT: 100,
  SUSPICIOUS_PATTERNS: 3,
};

const ipAttempts = new Map<string, number>();
const blockedIPs = new Set<string>();

export async function detectThreat(event: ThreatEvent): Promise<boolean> {
  const { ip, type, severity } = event;

  // Check if IP is already blocked
  if (blockedIPs.has(ip)) {
    return true;
  }

  // Track attempts
  const attempts = (ipAttempts.get(ip) || 0) + 1;
  ipAttempts.set(ip, attempts);

  // Auto-block on threshold
  if (attempts >= THREAT_THRESHOLDS.BRUTE_FORCE) {
    blockedIPs.add(ip);
    await logThreat({ ...event, blocked: true });
    return true;
  }

  // Log threat
  await logThreat(event);

  return severity === 'CRITICAL' || severity === 'HIGH';
}

async function logThreat(event: ThreatEvent & { blocked?: boolean }) {
  console.log(`[THREAT] ${event.type} from ${event.ip} - ${event.severity}`, event.blocked ? '[BLOCKED]' : '');
}

export function isIPBlocked(ip: string): boolean {
  return blockedIPs.has(ip);
}

export function unblockIP(ip: string): void {
  blockedIPs.delete(ip);
  ipAttempts.delete(ip);
}

export function getBlockedIPs(): string[] {
  return Array.from(blockedIPs);
}
