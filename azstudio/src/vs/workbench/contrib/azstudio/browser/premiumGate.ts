/*
 * Azora AzStudio: Premium gating stub
 * This module provides a small helper to check if AzStudio is running in a premium/entitled mode.
 * Full implementation requires entitlements & authentication against the Azora backend
 * and is out of scope for the initial migration; this acts as a safe placeholder.
 */

export async function isPremiumEntitled(): Promise<boolean> {
    // Priority 1: environment variable for local testing and CI
    try {
        const env = (typeof process !== 'undefined' && (process.env || {})) || {};
        if (env['AZSTUDIO_PREMIUM'] === '1' || env['AZSTUDIO_PREMIUM'] === 'true') {
            return true;
        }
    } catch (e) {
        // ignore and try other methods
    }

        // Detect if we are running in a browser (renderer) or Node (main)
        const isBrowser = (typeof window !== 'undefined' && typeof window.document !== 'undefined');
        if (isBrowser) {
            // Try to fetch product.json from the web root (if served by app) and check feature flags
            try {
                // Use global fetch if available (browsers/renderer)
                if (typeof fetch === 'function') {
                    const resp = await fetch('/product.json');
                    if (resp && resp.ok) {
                        const parsed = await resp.json();
                        if (parsed && parsed.featureFlags && parsed.featureFlags.premiumEnabledByDefault === true) {
                            return true;
                        }
                    }
                }
            } catch (e) {
                // ignore fetch errors — do not escalate in browser
            }

            return false;
        }

        // In a Node environment, attempt to read product.json from several known locations
            try {
                // Node fs/path may not be available in browser contexts — guard for that
                if (typeof require === 'function') {
                    const fs = await import('fs');
                    const path = await import('path');
                    const repoRoot = process.cwd();

                    // Check multiple likely paths for product.json to make migration robust
                    const candidates = [
                        path.resolve(repoRoot, 'product.json'),
                        path.resolve(repoRoot, 'azstudio', 'product.json'),
                        path.resolve(repoRoot, 'azstudio-vscode', 'product.json'),
                        path.resolve(repoRoot, 'azstudio.old', 'product.json'),
                    ];

                    for (const p of candidates) {
                        try {
                            if (fs.existsSync(p)) {
                                const content = fs.readFileSync(p, 'utf-8');
                                const parsed = JSON.parse(content);
                                if (parsed && parsed.featureFlags && parsed.featureFlags.premiumEnabledByDefault === true) {
                                    return true;
                                }
                            }
                        } catch (e) {
                            // ignore per-candidate errors
                        }
                    }
                }
            } catch (e) {
                // Not a Node main process nor fs available — ignore and try browser fallback below
            }

    // Default to false if not explicitly enabled
    return false;
}
