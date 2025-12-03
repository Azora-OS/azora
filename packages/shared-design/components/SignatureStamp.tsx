import React from 'react';
import { cn } from '../utils';
import {
    Shield,
    Bot,
    Zap,
    Coins,
    Briefcase,
    GraduationCap,
    Hammer,
    Building2,
    Microscope,
    Globe
} from 'lucide-react';

export type ServiceType =
    | 'security'
    | 'ai'
    | 'infrastructure'
    | 'finance'
    | 'talent'
    | 'education'
    | 'development'
    | 'enterprise'
    | 'research'
    | 'network';

interface ServiceStampProps {
    type: ServiceType;
    className?: string;
    showLabel?: boolean;
}

export function ServiceStamp({ type, className, showLabel = true }: ServiceStampProps) {
    const config = {
        security: {
            icon: Shield,
            label: 'Secured by',
            provider: 'The Oracle',
            color: 'text-red-400',
            borderColor: 'border-red-500/20',
            bg: 'bg-red-500/5'
        },
        ai: {
            icon: Bot,
            label: 'Intelligence by',
            provider: 'AI Family',
            color: 'text-purple-400',
            borderColor: 'border-purple-500/20',
            bg: 'bg-purple-500/5'
        },
        infrastructure: {
            icon: Zap,
            label: 'Powered by',
            provider: 'Azora Core',
            color: 'text-blue-400',
            borderColor: 'border-blue-500/20',
            bg: 'bg-blue-500/5'
        },
        finance: {
            icon: Coins,
            label: 'Transacted on',
            provider: 'Azora Mint',
            color: 'text-emerald-400',
            borderColor: 'border-emerald-500/20',
            bg: 'bg-emerald-500/5'
        },
        talent: {
            icon: Briefcase,
            label: 'Staffed by',
            provider: 'JobSpaces',
            color: 'text-orange-400',
            borderColor: 'border-orange-500/20',
            bg: 'bg-orange-500/5'
        },
        education: {
            icon: GraduationCap,
            label: 'Certified by',
            provider: 'Sapiens',
            color: 'text-yellow-400',
            borderColor: 'border-yellow-500/20',
            bg: 'bg-yellow-500/5'
        },
        development: {
            icon: Hammer,
            label: 'Built in',
            provider: 'BuildSpaces',
            color: 'text-cyan-400',
            borderColor: 'border-cyan-500/20',
            bg: 'bg-cyan-500/5'
        },
        enterprise: {
            icon: Building2,
            label: 'Managed by',
            provider: 'Enterprise',
            color: 'text-slate-400',
            borderColor: 'border-slate-500/20',
            bg: 'bg-slate-500/5'
        },
        research: {
            icon: Microscope,
            label: 'Verified by',
            provider: 'Research Ctr',
            color: 'text-pink-400',
            borderColor: 'border-pink-500/20',
            bg: 'bg-pink-500/5'
        },
        network: {
            icon: Globe,
            label: 'Connected to',
            provider: 'Azora Net',
            color: 'text-indigo-400',
            borderColor: 'border-indigo-500/20',
            bg: 'bg-indigo-500/5'
        }
    };

    const { icon: Icon, label, provider, color, borderColor, bg } = config[type];

    return (
        <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-mono uppercase tracking-wider transition-all hover:bg-opacity-20 cursor-help select-none group",
            borderColor,
            bg,
            className
        )} title={`${label} ${provider}`}>
            <Icon className={cn("w-3 h-3", color)} />
            {showLabel && (
                <>
                    <span className="text-muted-foreground opacity-70 hidden sm:inline">{label}</span>
                    <span className={cn("font-bold", color)}>{provider}</span>
                </>
            )}
        </div>
    );
}

interface FooterStampsProps {
    className?: string;
    services?: ServiceType[];
}

export function FooterStamps({ className, services = ['security', 'ai', 'infrastructure'] }: FooterStampsProps) {
    return (
        <div className={cn("w-full border-t border-border/40 bg-background/50 backdrop-blur-sm mt-auto", className)}>
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {services.map((service) => (
                            <ServiceStamp key={service} type={service} />
                        ))}
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono opacity-60">
                        <span className="hidden md:inline">|</span>
                        <span>UBUNTU: I AM BECAUSE WE ARE</span>
                        <span className="hidden md:inline">|</span>
                        <span>v1.0.0-alpha</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SignatureStamp({ appName, department, className }: { appName: string, department: string, className?: string }) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-8 opacity-60 hover:opacity-100 transition-opacity", className)}>
            <div className="flex items-center gap-2 text-sm font-mono tracking-widest uppercase text-muted-foreground">
                <span className="font-bold text-primary">{appName}</span>
                <span className="text-xs">by</span>
                <span className="font-bold text-foreground">{department}</span>
            </div>
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-2" />
        </div>
    );
}
