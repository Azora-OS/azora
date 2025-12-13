"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Play,
    Pause,
    Square,
    RotateCcw,
    Volume2,
    VolumeX,
    Eye,
    EyeOff,
    Zap,
    Moon,
    Sun,
    Coffee,
    Brain,
    Timer,
    Target,
    TrendingUp,
    Settings,
    Minimize2,
    Maximize2
} from "lucide-react";

const AMBIENT_SOUNDS = [
    { id: "rain", name: "Rain", icon: "🌧️", volume: 30 },
    { id: "ocean", name: "Ocean Waves", icon: "🌊", volume: 25 },
    { id: "forest", name: "Forest", icon: "🌲", volume: 35 },
    { id: "cafe", name: "Coffee Shop", icon: "☕", volume: 20 },
    { id: "fire", name: "Fireplace", icon: "🔥", volume: 40 },
    { id: "white-noise", name: "White Noise", icon: "📻", volume: 15 }
];

const FOCUS_SESSIONS = [
    { id: "pomodoro", name: "Pomodoro", duration: 25, break: 5, icon: "🍅" },
    { id: "deep-work", name: "Deep Work", duration: 90, break: 15, icon: "🧠" },
    { id: "flow", name: "Flow State", duration: 120, break: 20, icon: "🌊" },
    { id: "sprint", name: "Sprint", duration: 45, break: 10, icon: "🏃" }
];

export default function DeepFocus() {
    const [isZenMode, setIsZenMode] = useState(false);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [currentSession, setCurrentSession] = useState(FOCUS_SESSIONS[0]);
    const [timeLeft, setTimeLeft] = useState(currentSession.duration * 60);
    const [isBreak, setIsBreak] = useState(false);
    const [completedSessions, setCompletedSessions] = useState(0);
    const [totalFocusTime, setTotalFocusTime] = useState(0);
    const [currentSound, setCurrentSound] = useState(AMBIENT_SOUNDS[0]);
    const [soundVolume, setSoundVolume] = useState([30]);
    const [isSoundOn, setIsSoundOn] = useState(false);
    const [distractionBlocker, setDistractionBlocker] = useState(true);
    const [notificationsBlocked, setNotificationsBlocked] = useState(true);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => {
                    if (time <= 1) {
                        handleSessionComplete();
                        return 0;
                    }
                    return time - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft]);

    const handleSessionComplete = () => {
        setIsTimerRunning(false);
        if (!isBreak) {
            setCompletedSessions(prev => prev + 1);
            setTotalFocusTime(prev => prev + currentSession.duration);
            setIsBreak(true);
            setTimeLeft(currentSession.break * 60);
        } else {
            setIsBreak(false);
            setTimeLeft(currentSession.duration * 60);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startTimer = () => {
        setIsTimerRunning(true);
    };

    const pauseTimer = () => {
        setIsTimerRunning(false);
    };

    const resetTimer = () => {
        setIsTimerRunning(false);
        setTimeLeft(currentSession.duration * 60);
        setIsBreak(false);
    };

    const toggleZenMode = () => {
        setIsZenMode(!isZenMode);
    };

    return (
        <div className={`h-full flex flex-col ${isZenMode ? 'bg-black' : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'}`}>
            {/* Header - Hidden in Zen Mode */}
            {!isZenMode && (
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            Deep Focus
                            <Badge variant="secondary" className="bg-yellow-600">
                                <Zap className="w-3 h-3 mr-1" />
                                Flow State
                            </Badge>
                        </h1>
                        <p className="text-slate-400">Distraction-free environment for deep work and flow state</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Target className="w-4 h-4" />
                            <span>{completedSessions} sessions completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={isZenMode ? "default" : "outline"}
                                size="sm"
                                onClick={toggleZenMode}
                            >
                                {isZenMode ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                                {isZenMode ? "Exit Zen" : "Zen Mode"}
                            </Button>
                            <Button variant="outline" size="sm">
                                <Settings className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Left Panel - Focus Tools */}
                {!isZenMode && (
                    <div className="w-80 border-r border-white/10 bg-slate-900/50">
                        <Tabs defaultValue="timer" className="h-full flex flex-col">
                            <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
                                <TabsTrigger value="timer" className="text-xs">Timer</TabsTrigger>
                                <TabsTrigger value="sounds" className="text-xs">Sounds</TabsTrigger>
                                <TabsTrigger value="stats" className="text-xs">Stats</TabsTrigger>
                            </TabsList>

                            <TabsContent value="timer" className="flex-1 m-0 p-4">
                                <div className="space-y-6">
                                    {/* Session Selection */}
                                    <div>
                                        <h3 className="font-medium text-white mb-3">Focus Sessions</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {FOCUS_SESSIONS.map((session) => (
                                                <button
                                                    key={session.id}
                                                    onClick={() => {
                                                        setCurrentSession(session);
                                                        setTimeLeft(session.duration * 60);
                                                        setIsBreak(false);
                                                        setIsTimerRunning(false);
                                                    }}
                                                    className={`p-3 rounded-lg border text-left transition-colors ${
                                                        currentSession.id === session.id
                                                            ? 'border-yellow-500 bg-yellow-500/10'
                                                            : 'border-slate-600 hover:border-slate-500'
                                                    }`}
                                                >
                                                    <div className="text-lg mb-1">{session.icon}</div>
                                                    <div className="text-sm font-medium text-white">{session.name}</div>
                                                    <div className="text-xs text-slate-400">{session.duration}m focus</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Timer Display */}
                                    <div className="text-center">
                                        <div className="text-6xl font-mono font-bold text-white mb-2">
                                            {formatTime(timeLeft)}
                                        </div>
                                        <div className="text-sm text-slate-400 mb-4">
                                            {isBreak ? "Break Time" : "Focus Time"}
                                        </div>

                                        <div className="flex justify-center gap-2">
                                            {!isTimerRunning ? (
                                                <Button onClick={startTimer} size="lg">
                                                    <Play className="w-4 h-4 mr-2" />
                                                    Start
                                                </Button>
                                            ) : (
                                                <Button onClick={pauseTimer} variant="outline" size="lg">
                                                    <Pause className="w-4 h-4 mr-2" />
                                                    Pause
                                                </Button>
                                            )}
                                            <Button onClick={resetTimer} variant="outline" size="lg">
                                                <RotateCcw className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div>
                                        <div className="flex justify-between text-sm text-slate-400 mb-2">
                                            <span>Session Progress</span>
                                            <span>{Math.round(((currentSession.duration * 60 - timeLeft) / (currentSession.duration * 60)) * 100)}%</span>
                                        </div>
                                        <Progress
                                            value={((currentSession.duration * 60 - timeLeft) / (currentSession.duration * 60)) * 100}
                                            className="h-2"
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="sounds" className="flex-1 m-0 p-4">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-medium text-white mb-3">Ambient Sounds</h3>
                                        <div className="space-y-2">
                                            {AMBIENT_SOUNDS.map((sound) => (
                                                <button
                                                    key={sound.id}
                                                    onClick={() => setCurrentSound(sound)}
                                                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                                        currentSound.id === sound.id
                                                            ? 'border-blue-500 bg-blue-500/10'
                                                            : 'border-slate-600 hover:border-slate-500'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">{sound.icon}</span>
                                                        <span className="text-sm text-white">{sound.name}</span>
                                                    </div>
                                                    {currentSound.id === sound.id && isSoundOn && (
                                                        <div className="flex items-center gap-2">
                                                            <Volume2 className="w-4 h-4 text-blue-400" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Volume Control */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-white">Volume</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsSoundOn(!isSoundOn)}
                                            >
                                                {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                        <Slider
                                            value={soundVolume}
                                            onValueChange={setSoundVolume}
                                            max={100}
                                            min={0}
                                            step={1}
                                            disabled={!isSoundOn}
                                            className="w-full"
                                        />
                                        <div className="text-xs text-slate-400 mt-1">{soundVolume[0]}%</div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="stats" className="flex-1 m-0 p-4">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-medium text-white mb-3">Today's Focus</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Card className="bg-slate-800 border-slate-700">
                                                <CardContent className="p-4">
                                                    <div className="text-2xl font-bold text-green-400">{completedSessions}</div>
                                                    <div className="text-xs text-slate-400">Sessions</div>
                                                </CardContent>
                                            </Card>
                                            <Card className="bg-slate-800 border-slate-700">
                                                <CardContent className="p-4">
                                                    <div className="text-2xl font-bold text-blue-400">{Math.floor(totalFocusTime / 60)}h</div>
                                                    <div className="text-xs text-slate-400">Focus Time</div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-white mb-3">Distraction Control</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-300">Block Notifications</span>
                                                <Switch
                                                    checked={notificationsBlocked}
                                                    onCheckedChange={setNotificationsBlocked}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-300">Distraction Blocker</span>
                                                <Switch
                                                    checked={distractionBlocker}
                                                    onCheckedChange={setDistractionBlocker}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-white mb-3">Weekly Goal</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-400">Progress</span>
                                                <span className="text-slate-400">12/20 hours</span>
                                            </div>
                                            <Progress value={60} className="h-2" />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}

                {/* Center - Code Editor (Zen Mode) */}
                <div className="flex-1 flex flex-col">
                    {/* Minimal Editor Header */}
                    <div className={`flex items-center justify-between p-4 border-b ${isZenMode ? 'border-slate-800' : 'border-white/10'}`}>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-slate-300">focus-session.js</span>
                            <Badge variant="secondary" className="text-xs">JavaScript</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            {!isZenMode && (
                                <Button variant="ghost" size="sm">
                                    <Minimize2 className="w-4 h-4" />
                                </Button>
                            )}
                            <Button variant="ghost" size="sm">
                                <Maximize2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Code Editor Area */}
                    <div className="flex-1 bg-slate-950 flex items-center justify-center">
                        <div className="text-center text-slate-500">
                            <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
                                <Coffee className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">Ready for Deep Focus</h3>
                            <p className="text-sm">Your distraction-free coding environment is active</p>
                            {isTimerRunning && (
                                <div className="mt-4 text-2xl font-mono font-bold text-yellow-400">
                                    {formatTime(timeLeft)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Quick Stats (Hidden in Zen Mode) */}
                {!isZenMode && (
                    <div className="w-64 border-l border-white/10 bg-slate-900/50 p-4">
                        <div className="space-y-6">
                            {/* Current Session */}
                            <Card className="bg-slate-800 border-slate-700">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Timer className="w-4 h-4" />
                                        Current Session
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center">
                                        <div className="text-3xl font-mono font-bold text-white mb-1">
                                            {formatTime(timeLeft)}
                                        </div>
                                        <div className="text-xs text-slate-400 mb-2">
                                            {isBreak ? "Break Time" : `${currentSession.name}`}
                                        </div>
                                        <Progress
                                            value={isBreak
                                                ? ((currentSession.break * 60 - timeLeft) / (currentSession.break * 60)) * 100
                                                : ((currentSession.duration * 60 - timeLeft) / (currentSession.duration * 60)) * 100
                                            }
                                            className="h-1"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <div>
                                <h4 className="text-sm font-medium text-white mb-3">Quick Actions</h4>
                                <div className="space-y-2">
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        <Brain className="w-4 h-4 mr-2" />
                                        Mind Map
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        <Target className="w-4 h-4 mr-2" />
                                        Set Goal
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        <TrendingUp className="w-4 h-4 mr-2" />
                                        View Stats
                                    </Button>
                                </div>
                            </div>

                            {/* Ambient Indicator */}
                            {isSoundOn && (
                                <Card className="bg-slate-800 border-slate-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{currentSound.icon}</span>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-white">{currentSound.name}</div>
                                                <div className="text-xs text-slate-400">Playing • {soundVolume[0]}%</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}