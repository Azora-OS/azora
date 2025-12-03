/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * 📖 BIBLE INTEGRATION - System-wide Scripture Integration
 * 
 * This module provides utilities for integrating the Azorian Bible
 * throughout Azora OS, ensuring every system is guided by divine wisdom.
 */

import { AZORIAN_BIBLE } from './azorian-bible';

// ============================================================================
// CONSTITUTIONAL VALIDATION
// ============================================================================

export interface Action {
  type: string;
  description: string;
  target?: string;
  impact?: string;
}

export interface ValidationResult {
  valid: boolean;
  commandmentViolated?: number;
  explanation?: string;
  consequence?: string;
  alternatives?: string[];
}

/**
 * Validate any AI action against the Ten Commandments
 */
export function validateAgainstConstitution(action: Action): ValidationResult {
  const commandments = Object.values(AZORIAN_BIBLE.commandments)
    .filter((item): item is any => typeof item === 'object' && 'number' in item);

  for (const cmd of commandments) {
    // Check if action matches known violation patterns
    const isViolation = checkViolation(action, cmd);
    
    if (isViolation) {
      return {
        valid: false,
        commandmentViolated: cmd.number,
        explanation: cmd.explanation,
        consequence: cmd.consequence,
        alternatives: generateAlternatives(action, cmd),
      };
    }
  }

  return { valid: true };
}

function checkViolation(action: Action, commandment: any): boolean {
  const violationKeywords = commandment.violation.toLowerCase().split(/,| /);
  const actionText = `${action.type} ${action.description}`.toLowerCase();
  
  return violationKeywords.some((keyword: string) => 
    keyword.length > 3 && actionText.includes(keyword)
  );
}

function generateAlternatives(action: Action, commandment: any): string[] {
  return [
    `Modify ${action.type} to align with: ${commandment.implementation}`,
    `Consult human decision-maker before proceeding`,
    `Apply transparency measures: explain why this action is needed`,
  ];
}

// ============================================================================
// DAILY SCRIPTURE SYSTEM
// ============================================================================

export interface DailyScripture {
  prayer: string;
  scripture: string;
  time: 'morning' | 'midday' | 'evening' | 'deployment';
}

/**
 * Get appropriate scripture based on time of day
 */
export function getDailyScripture(time?: 'morning' | 'midday' | 'evening' | 'deployment'): DailyScripture {
  const now = new Date();
  const hour = now.getHours();
  
  let selectedTime = time;
  if (!selectedTime) {
    if (hour >= 5 && hour < 12) {selectedTime = 'morning';}
    else if (hour >= 12 && hour < 17) {selectedTime = 'midday';}
    else {selectedTime = 'evening';}
  }
  
  return AZORIAN_BIBLE.daily[selectedTime];
}

// ============================================================================
// WISDOM SYSTEM
// ============================================================================

export interface WisdomQuery {
  situation: string;
  domain: 'learning' | 'service' | 'community' | 'technology';
}

export interface WisdomResponse {
  proverb: string;
  application: string;
  relevance: number;
}

/**
 * Query the Proverbs for wisdom on a specific situation
 */
export function seekWisdom(query: WisdomQuery): WisdomResponse {
  const proverbs = AZORIAN_BIBLE.wisdom.proverbs;
  
  // Simple keyword matching for relevance
  const keywords = query.situation.toLowerCase().split(' ');
  
  const scored = proverbs.map(proverb => {
    const text = `${proverb.text} ${proverb.application}`.toLowerCase();
    const matches = keywords.filter(keyword => text.includes(keyword)).length;
    return {
      proverb: proverb.text,
      application: proverb.application,
      relevance: matches / keywords.length,
    };
  });
  
  // Return most relevant proverb
  scored.sort((a, b) => b.relevance - a.relevance);
  return scored[0] || scored[Math.floor(Math.random() * scored.length)];
}

// ============================================================================
// PARABLE SYSTEM
// ============================================================================

/**
 * Get a random parable for teaching
 */
export function getParable(topic?: string) {
  const parables = Object.values(AZORIAN_BIBLE.parables)
    .filter((item): item is any => typeof item === 'object' && 'title' in item);
  
  if (topic) {
    const relevant = parables.filter(p => 
      p.title.toLowerCase().includes(topic.toLowerCase()) ||
      p.meaning.toLowerCase().includes(topic.toLowerCase())
    );
    if (relevant.length > 0) {
      return relevant[Math.floor(Math.random() * relevant.length)];
    }
  }
  
  return parables[Math.floor(Math.random() * parables.length)];
}

// ============================================================================
// MISSION ALIGNMENT
// ============================================================================

/**
 * Check if a service/feature aligns with the Great Commission
 */
export function alignsWithMission(service: {
  name: string;
  servesPeople: boolean;
  globalAccess: boolean;
  free: boolean;
  educates?: boolean;
}): { aligned: boolean; gaps: string[] } {
  const gaps: string[] = [];
  
  if (!service.servesPeople) {
    gaps.push('Does not clearly serve people');
  }
  if (!service.globalAccess) {
    gaps.push('Not accessible globally');
  }
  if (!service.free) {
    gaps.push('Not free for all users');
  }
  
  return {
    aligned: gaps.length === 0,
    gaps,
  };
}

// ============================================================================
// COVENANT CHECKING
// ============================================================================

/**
 * Verify that we're keeping our sacred promises
 */
export function checkCovenants(): {
  userCovenant: { promise: string; kept: boolean }[];
  godCovenant: { promise: string; kept: boolean }[];
  humanityCovenant: { promise: string; kept: boolean }[];
} {
  // In production, this would check actual system metrics
  // For now, return structure showing how it works
  
  return {
    userCovenant: AZORIAN_BIBLE.covenants.userCovenant.promises.map(promise => ({
      promise,
      kept: true, // Would check actual metrics
    })),
    godCovenant: AZORIAN_BIBLE.covenants.godCovenant.promises.map(promise => ({
      promise,
      kept: true,
    })),
    humanityCovenant: AZORIAN_BIBLE.covenants.humanityCovenant.promises.map(promise => ({
      promise,
      kept: true,
    })),
  };
}

// ============================================================================
// SCRIPTURE SEARCH
// ============================================================================

export function searchScripture(query: string): any[] {
  const results: any[] = [];
  const lowerQuery = query.toLowerCase();
  
  // Search Genesis
  Object.entries(AZORIAN_BIBLE.genesis.creation).forEach(([day, content]: [string, any]) => {
    if (JSON.stringify(content).toLowerCase().includes(lowerQuery)) {
      results.push({ book: 'Genesis', section: day, content });
    }
  });
  
  // Search Commandments
  Object.values(AZORIAN_BIBLE.commandments)
    .filter((item): item is any => typeof item === 'object' && 'text' in item)
    .forEach(cmd => {
      if (JSON.stringify(cmd).toLowerCase().includes(lowerQuery)) {
        results.push({ book: 'Commandments', section: `Commandment ${cmd.number}`, content: cmd });
      }
    });
  
  // Search Wisdom
  AZORIAN_BIBLE.wisdom.proverbs.forEach(proverb => {
    if (JSON.stringify(proverb).toLowerCase().includes(lowerQuery)) {
      results.push({ book: 'Wisdom', section: `Proverb ${proverb.number}`, content: proverb });
    }
  });
  
  // Search Parables
  Object.values(AZORIAN_BIBLE.parables)
    .filter((item): item is any => typeof item === 'object' && 'title' in item)
    .forEach(parable => {
      if (JSON.stringify(parable).toLowerCase().includes(lowerQuery)) {
        results.push({ book: 'Parables', section: parable.title, content: parable });
      }
    });
  
  return results;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const BibleIntegration = {
  validate: validateAgainstConstitution,
  dailyScripture: getDailyScripture,
  wisdom: seekWisdom,
  parable: getParable,
  mission: alignsWithMission,
  covenants: checkCovenants,
  search: searchScripture,
  
  // Direct access to full Bible
  bible: AZORIAN_BIBLE,
};

export default BibleIntegration;

