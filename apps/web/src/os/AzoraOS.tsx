import React, { useState, useEffect } from 'react';
import { TrinityStartButton } from './components/TrinityStartButton';
import { APPS } from './config/apps';
import { Maximize2, Minimize2, X, LayoutGrid } from 'lucide-react';

export const AzoraOS: React.FC = () => {
    const [openApps, setOpenApps] = useState<string[]>([]);
    const [activeApp, setActiveApp] = useState<string | null>(null);
    const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto-launch apps from URL parameters
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const launchApps = params.get('launchApps');

        if (launchApps) {
            const appIds = launchApps.split(',');
            // Launch apps with a slight delay for visual effect
            appIds.forEach((appId, index) => {
                setTimeout(() => {
                    launchApp(appId.trim());
                }, index * 100);
            });
        }
    }, []);

    const launchApp = (appId: string) => {
        if (!openApps.includes(appId)) {
            setOpenApps([...openApps, appId]);
        }
        setActiveApp(appId);
        setIsStartMenuOpen(false);
    };

    const closeApp = (appId: string) => {
        setOpenApps(openApps.filter(id => id !== appId));
        if (activeApp === appId) {
            setActiveApp(null);
        }
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Living Organism Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 opacity-80" />
                <div className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
                        backgroundSize: '100% 100%',
                        animation: 'pulse 10s infinite ease-in-out'
                    }}
                />
            </div>

            {/* Desktop Area (Windows) */}
            <div className="relative z-10 w-full h-[calc(100%-3rem)] p-4 flex items-center justify-center">
                {openApps.map(appId => {
                    const app = Object.values(APPS).find(a => a.id === appId);
                    if (!app) return null;
                    const isActive = activeApp === appId;
                    const Component = app.component;

                    return (
                        <div
                            key={appId}
                            className={`absolute transition-all duration-300 ease-out rounded-xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl
                ${isActive ? 'z-50 scale-100 opacity-100' : 'z-0 scale-95 opacity-0 pointer-events-none'}
              `}
                            style={{
                                width: '90%',
                                height: '85%',
                                backgroundColor: 'rgba(15, 23, 42, 0.85)'
                            }}
                            onClick={() => setActiveApp(appId)}
                        >
                            {/* Window Header */}
                            <div className="h-10 bg-white/5 flex items-center justify-between px-4 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <app.icon size={16} className="text-purple-400" />
                                    <span className="text-sm font-medium text-white/90">{app.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-1.5 hover:bg-white/10 rounded-md text-white/60 hover:text-white transition-colors">
                                        <Minimize2 size={14} />
                                    </button>
                                    <button className="p-1.5 hover:bg-white/10 rounded-md text-white/60 hover:text-white transition-colors">
                                        <Maximize2 size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); closeApp(appId); }}
                                        className="p-1.5 hover:bg-red-500/20 rounded-md text-white/60 hover:text-red-400 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Window Content */}
                            <div className="w-full h-[calc(100%-2.5rem)] overflow-auto">
                                <Component />
                            </div>
                        </div>
                    );
                })}

                {openApps.length === 0 && (
                    <div className="text-center text-white/30 animate-pulse">
                        <div className="mb-4 flex justify-center">
                            <LayoutGrid size={64} strokeWidth={1} />
                        </div>
                        <p className="text-xl font-light">Azora OS</p>
                        <p className="text-sm">Ready for input</p>
                    </div>
                )}
            </div>

            {/* Taskbar */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-black/40 backdrop-blur-2xl border-t border-white/10 flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-4">
                    <div onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}>
                        <TrinityStartButton active={isStartMenuOpen} />
                    </div>

                    {/* Open Apps Dock */}
                    <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/10 h-8">
                        {openApps.map(appId => {
                            const app = Object.values(APPS).find(a => a.id === appId);
                            if (!app) return null;
                            return (
                                <button
                                    key={appId}
                                    onClick={() => setActiveApp(appId)}
                                    className={`p-2 rounded-lg transition-all duration-200 group relative
                    ${activeApp === appId ? 'bg-white/10 text-purple-300' : 'hover:bg-white/5 text-white/60'}
                  `}
                                >
                                    <app.icon size={20} />
                                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        {app.title}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* System Tray */}
                <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            {/* Start Menu */}
            {isStartMenuOpen && (
                <div className="absolute bottom-14 left-4 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
                    <div className="p-2 mb-2 border-b border-white/5">
                        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Applications</p>
                        {Object.values(APPS).map(app => (
                            <button
                                key={app.id}
                                onClick={() => launchApp(app.id)}
                                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 text-left transition-colors group"
                            >
                                <div className="p-2 rounded-md bg-white/5 group-hover:bg-purple-500/20 text-purple-400 transition-colors">
                                    <app.icon size={18} />
                                </div>
                                <span className="text-sm font-medium text-white/90">{app.title}</span>
                            </button>
                        ))}
                    </div>
                    <div className="p-2">
                        <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-500/10 text-left transition-colors text-red-400/80 hover:text-red-400">
                            <div className="p-2 rounded-md bg-white/5">
                                <X size={18} />
                            </div>
                            <span className="text-sm font-medium">Shut Down</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
