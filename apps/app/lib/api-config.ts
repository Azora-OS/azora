/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

'use client';

import { ApiClient } from '../../../packages/lib/api-client';

const STORAGE_KEYS = {
  baseUrl: 'api.baseUrl',
};

export type ApiEndpoints = {
  baseUrl?: string;
};

export function getStoredApiConfig(): ApiEndpoints {
  if (typeof window === 'undefined') return {};
  try {
    const baseUrl = localStorage.getItem(STORAGE_KEYS.baseUrl) || undefined;
    return { baseUrl };
  } catch {
    return {};
  }
}

export function saveApiConfig(cfg: ApiEndpoints) {
  if (typeof window === 'undefined') return;
  if (cfg.baseUrl) {
    localStorage.setItem(STORAGE_KEYS.baseUrl, cfg.baseUrl);
  } else {
    localStorage.removeItem(STORAGE_KEYS.baseUrl);
  }
}

let cachedClient: ApiClient | null = null;
let cachedForBase: string | undefined;

export function getApiClient(): ApiClient {
  const { baseUrl } = getStoredApiConfig();
  if (!cachedClient || cachedForBase !== baseUrl) {
    cachedClient = new ApiClient(baseUrl);
    cachedForBase = baseUrl;
  }
  return cachedClient;
}

export async function testHealth(baseUrl?: string): Promise<{ ok: boolean; status?: number; error?: string }>
{
  const url = `${(baseUrl || '').replace(/\/$/, '')}/api/health`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return { ok: res.ok, status: res.status };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Network error' };
  }
}
