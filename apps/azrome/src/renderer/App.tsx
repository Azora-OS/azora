import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { NewTabPage } from './components/NewTabPage';
import { LearningPanel } from './components/LearningPanel';

// Placeholder for the AzStudioBridge type
declare global {
    interface Window {
        AzStudioBridge: {
            openInAzStudio: (url: string) => void;
            cloneWebsite: (url: string) => Promise<any>;
            ai: {
                analyze: (url: string) => Promise<any>;
                generateCode: (design: any) => Promise<string>;
            };
        };
    }
}

function App() {
    const [url, setUrl] = useState(''); // Empty URL means New Tab Page
    const [inputUrl, setInputUrl] = useState('');
    const [activeTool, setActiveTool] = useState('explorer');

    const handleNavigate = (targetUrl?: string) => {
        const dest = targetUrl || inputUrl;
        if (!dest) return;

        let finalUrl = dest;
        if (!finalUrl.startsWith('http') && !finalUrl.startsWith('file')) {
            finalUrl = 'https://' + finalUrl;
        }

        setUrl(finalUrl);
        setInputUrl(finalUrl);

        // If we have a webview, load it
        setTimeout(() => {
            const webview = document.getElementById('azrome-view') as any;
            if (webview) {
                webview.loadURL(finalUrl);
            }
        }, 100);
    };

    const handleGoBack = () => {
        const webview = document.getElementById('azrome-view') as any;
        if (webview && webview.canGoBack()) webview.goBack();
    };

    const handleGoForward = () => {
        const webview = document.getElementById('azrome-view') as any;
        if (webview && webview.canGoForward()) webview.goForward();
    };

    const handleReload = () => {
        const webview = document.getElementById('azrome-view') as any;
        if (webview) webview.reload();
    };

    const toggleDevTools = () => {
        const webview = document.getElementById('azrome-view') as any;
        if (webview) {
            if (webview.isDevToolsOpened()) {
                webview.closeDevTools();
            } else {
                webview.openDevTools();
            }
        }
    };

    const handleAnalyze = async () => {
        try {
            const result = await window.AzStudioBridge.ai.analyze(url);
            console.log('AI Analysis:', result);
            alert(`AI Analysis Score: ${result.score}\nSuggestions: ${result.suggestions.join(', ')}`);
        } catch (e) {
            console.error('AI Analysis failed:', e);
        }
    };

    const handleSidebarAction = async (toolId: string) => {
        setActiveTool(toolId);

        if (toolId === 'clone') {
            if (!url) {
                alert('Please navigate to a website to clone it.');
                return;
            }
            const confirm = window.confirm(`Do you want to clone and deploy ${url}?`);
            if (confirm) {
                try {
                    console.log('Cloning...');
                    // In a real app, we'd show a progress bar here
                    const result = await window.AzStudioBridge.cloneWebsite(url);
                    alert(`Success! Deployed to: ${result.deployUrl}\nProject ID: ${result.projectId}`);
                } catch (e) {
                    console.error('Clone failed:', e);
                    alert('Clone failed. See console.');
                }
            }
        }
    };

    const handleHome = () => {
        setUrl('');
        setInputUrl('');
    };

    return (
        <div className="azrome-container">
            <header className="azrome-toolbar">
                <div className="azrome-controls">
                    <button onClick={handleHome} title="New Tab">🏠</button>
                    <button onClick={handleGoBack}>←</button>
                    <button onClick={handleGoForward}>→</button>
                    <button onClick={handleReload}>⟳</button>
                </div>
                <div className="azrome-omnibox">
                    <input
                        type="text"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
                        placeholder="Search or enter website name"
                    />
                </div>
                <div className="azrome-actions">
                    <button onClick={handleAnalyze} title="AI Analyze">
                        🤖
                    </button>
                    <button onClick={toggleDevTools} title="Toggle DevTools">
                        🛠️
                    </button>
                    <button onClick={() => window.AzStudioBridge.openInAzStudio(url)}>
                        Open in AzStudio
                    </button>
                </div>
            </header>

            <div className="azrome-body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <Sidebar activeTool={activeTool} onSelectTool={handleSidebarAction} />

                {activeTool === 'learning' && (
                    <div style={{ width: '250px', borderRight: '1px solid #333' }}>
                        <LearningPanel />
                    </div>
                )}

                <main className="azrome-content">
                    {url === '' ? (
                        <NewTabPage onNavigate={handleNavigate} />
                    ) : (
                        <div className="webview-container" style={{ width: '100%', height: '100%', display: 'flex' }}>
                            <webview
                                id="azrome-view"
                                src={url}
                                style={{ width: '100%', height: '100%', display: 'flex' }}
                                // @ts-ignore
                                allowpopups="true"
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;
