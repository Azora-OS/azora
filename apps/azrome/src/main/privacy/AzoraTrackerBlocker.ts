import { session } from 'electron';

export class AzoraTrackerBlocker {
    private blockedDomains: string[] = [
        '*://*.google-analytics.com/*',
        '*://*.googletagmanager.com/*',
        '*://*.facebook.com/tr*',
        '*://*.doubleclick.net/*',
        '*://*.googleadservices.com/*',
    ];

    private isEnabled: boolean = true;

    constructor() {
        this.enable();
    }

    public enable() {
        this.isEnabled = true;
        this.applyRules();
    }

    public disable() {
        this.isEnabled = false;
        // To fully disable, we'd need to remove the listener, but Electron's API 
        // replaces the listener, so re-applying with null or empty filter works differently.
        // For now, we'll just clear the rules if we were to re-apply.
        session.defaultSession.webRequest.onBeforeRequest(null);
    }

    private applyRules() {
        if (!this.isEnabled) return;

        session.defaultSession.webRequest.onBeforeRequest(
            { urls: this.blockedDomains },
            (details, callback) => {
                console.log(`[AzoraTrackerBlocker] Blocked: ${details.url}`);
                callback({ cancel: true });
            }
        );
    }
}
