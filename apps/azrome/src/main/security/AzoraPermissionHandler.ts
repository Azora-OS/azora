import { session } from 'electron';

export class AzoraPermissionHandler {
    constructor() {
        this.initialize();
    }

    private initialize() {
        session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
            const url = webContents.getURL();

            // Default policy: Deny sensitive permissions unless explicitly allowed (none for now)
            const sensitivePermissions = ['media', 'geolocation', 'notifications', 'midiSysex', 'pointerLock', 'fullscreen'];

            if (sensitivePermissions.includes(permission)) {
                console.warn(`[AzoraPermissionHandler] Blocked permission '${permission}' for ${url}`);
                // In a real app, we would ask the user here via IPC
                callback(false);
            } else {
                // Allow benign permissions
                callback(true);
            }
        });
    }
}
