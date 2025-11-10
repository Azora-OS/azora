/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

CDN ASSET UTILITIES
Helper functions for serving assets through Africa-First CDN
*/

import { africaCDN } from '@azora/shared-infrastructure/africa-cdn';

/**
 * Get CDN URL for asset
 */
export function getCDNAssetURL(path: string, region?: string): string {
  return africaCDN.getAssetURL(path, region);
}

/**
 * Get CDN URLs for multiple assets
 */
export function getCDNAssetURLs(paths: string[], region?: string): string[] {
  return paths.map(path => getCDNAssetURL(path, region));
}

/**
 * Generate CDN image URL with optimization
 */
export function getCDNImageURL(
  imagePath: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
    region?: string;
  }
): string {
  const baseUrl = getCDNAssetURL(imagePath, options?.region);
  const params = new URLSearchParams();
  
  if (options?.width) params.set('w', options.width.toString());
  if (options?.height) params.set('h', options.height.toString());
  if (options?.quality) params.set('q', options.quality.toString());
  if (options?.format) params.set('f', options.format);
  
  return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
}

/**
 * Preload CDN assets
 */
export async function preloadCDNAssets(urls: string[]): Promise<void> {
  // In browser environment, use link rel="preload"
  if (typeof window !== 'undefined') {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }
}

/**
 * Get optimal CDN node for region
 */
export function getOptimalCDNNode(region?: string) {
  return africaCDN.getOptimalNode({ path: '/', region });
}

export default {
  getCDNAssetURL,
  getCDNAssetURLs,
  getCDNImageURL,
  preloadCDNAssets,
  getOptimalCDNNode,
};
