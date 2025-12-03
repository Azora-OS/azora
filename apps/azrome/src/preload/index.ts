import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('AzStudioBridge', {
    openInAzStudio: (url: string) => {
        console.log('Bridge: Open in AzStudio', url);
        // ipcRenderer.send('open-in-azstudio', url);
    },
    cloneWebsite: (url: string) => {
        console.log('Bridge: Clone Website', url);
        return ipcRenderer.invoke('azrome-builder:clone', url);
    },
    ai: {
        analyze: (url: string) => ipcRenderer.invoke('azrome-ai:analyze', url),
        generateCode: (design: any) => ipcRenderer.invoke('azrome-ai:generate-code', design)
    }
});
