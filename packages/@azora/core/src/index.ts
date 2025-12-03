/**
 * @azora/core
 * Core System - Sankofa Engine & Ubuntu Protocol
 * 
 * "Ngiyakwazi ngoba sikwazi" - I can because we can
 */

export const AZORA_CORE = {
  name: 'Azora OS',
  version: '3.0.0',
  philosophy: 'Ubuntu: I can because we can',
  motto: 'Ngiyakwazi ngoba sikwazi',
  engine: 'Sankofa',
} as const;

export const UBUNTU_PRINCIPLES = {
  interconnectedness: 'No individual succeeds alone',
  collectiveResponsibility: 'Community success is personal success',
  sharedHumanity: 'Technology serves human flourishing',
  ancestralWisdom: 'Learning from past to build future',
  circularThinking: 'What goes around, comes around amplified',
} as const;

export const CONSTITUTIONAL_ARTICLES = {
  I: 'Individual Sovereignty',
  II: 'Collective Prosperity',
  III: 'Transparent Governance',
  IV: 'Sustainable Growth',
  V: 'Inclusive Innovation',
  VI: 'Technological Sovereignty',
} as const;

export type AzoraCore = typeof AZORA_CORE;
export type UbuntuPrinciples = typeof UBUNTU_PRINCIPLES;
export type ConstitutionalArticles = typeof CONSTITUTIONAL_ARTICLES;
