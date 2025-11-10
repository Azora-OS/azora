import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * SANKOFA ENGINE - The Living Philosophical Heart
 * "Sovereignty Amplification Network for Knowledge, Opportunity, Finance & Abundance"
 *
 * Visual representation of the circular Ubuntu philosophy:
 * "What goes around, comes around amplified"
 */
import * as React from 'react';
export const SankofaEngine = React.forwardRef(({ size = 400, animated = true, speed = 'normal', showMetrics = false, className = '' }, ref) => {
    const [metrics, setMetrics] = React.useState({
        sovereignty: 85,
        knowledge: 92,
        opportunity: 78,
        finance: 88,
        abundance: 95,
    });
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size * 0.42;
    const innerRadius = size * 0.25;
    const rotationSpeed = speed === 'fast' ? '15s' : speed === 'slow' ? '45s' : '30s';
    // Calculate positions for the 5 S.A.N.K.O.F.A. pillars
    const pillars = [
        { name: 'Sovereignty', angle: -90, color: '#8b5cf6', icon: '👑' },
        { name: 'Knowledge', angle: -18, color: '#3b82f6', icon: '📚' },
        { name: 'Opportunity', angle: 54, color: '#10b981', icon: '🚀' },
        { name: 'Finance', angle: 126, color: '#f59e0b', icon: '💰' },
        { name: 'Abundance', angle: 198, color: '#ec4899', icon: '✨' },
    ];
    const getPillarPosition = (angle, radius) => ({
        x: centerX + radius * Math.cos((angle * Math.PI) / 180),
        y: centerY + radius * Math.sin((angle * Math.PI) / 180),
    });
    return (_jsxs("div", { ref: ref, className: `sankofa-engine ${className}`, style: {
            width: size,
            height: size,
            position: 'relative',
            display: 'inline-block',
        }, children: [_jsxs("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "sankofaFlow", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [_jsx("stop", { offset: "0%", stopColor: "#8b5cf6" }), _jsx("stop", { offset: "20%", stopColor: "#3b82f6" }), _jsx("stop", { offset: "40%", stopColor: "#10b981" }), _jsx("stop", { offset: "60%", stopColor: "#f59e0b" }), _jsx("stop", { offset: "80%", stopColor: "#ec4899" }), _jsx("stop", { offset: "100%", stopColor: "#8b5cf6" })] }), _jsxs("filter", { id: "sankofaGlow", children: [_jsx("feGaussianBlur", { stdDeviation: "4", result: "coloredBlur" }), _jsxs("feMerge", { children: [_jsx("feMergeNode", { in: "coloredBlur" }), _jsx("feMergeNode", { in: "SourceGraphic" })] })] }), _jsxs("filter", { id: "pulseGlow", children: [_jsx("feGaussianBlur", { stdDeviation: "8", result: "coloredBlur" }), _jsxs("feMerge", { children: [_jsx("feMergeNode", { in: "coloredBlur" }), _jsx("feMergeNode", { in: "SourceGraphic" })] })] })] }), _jsxs("g", { transform: `rotate(0 ${centerX} ${centerY})`, children: [_jsx("circle", { cx: centerX, cy: centerY, r: outerRadius, fill: "none", stroke: "url(#sankofaFlow)", strokeWidth: "3", opacity: "0.4", filter: "url(#sankofaGlow)", children: animated && (_jsx("animateTransform", { attributeName: "transform", attributeType: "XML", type: "rotate", from: `0 ${centerX} ${centerY}`, to: `360 ${centerX} ${centerY}`, dur: rotationSpeed, repeatCount: "indefinite" })) }), animated && (_jsxs(_Fragment, { children: [_jsx("circle", { r: "4", fill: "#8b5cf6", opacity: "0.8", filter: "url(#sankofaGlow)", children: _jsx("animateMotion", { dur: rotationSpeed, repeatCount: "indefinite", path: `M ${centerX + outerRadius},${centerY} A ${outerRadius},${outerRadius} 0 1,1 ${centerX + outerRadius},${centerY - 0.1}` }) }), _jsx("circle", { r: "4", fill: "#10b981", opacity: "0.8", filter: "url(#sankofaGlow)", children: _jsx("animateMotion", { dur: rotationSpeed, repeatCount: "indefinite", path: `M ${centerX - outerRadius},${centerY} A ${outerRadius},${outerRadius} 0 1,1 ${centerX - outerRadius},${centerY - 0.1}` }) })] }))] }), _jsx("g", { children: _jsx("circle", { cx: centerX, cy: centerY, r: innerRadius, fill: "none", stroke: "url(#sankofaFlow)", strokeWidth: "2", opacity: "0.3", children: animated && (_jsx("animateTransform", { attributeName: "transform", attributeType: "XML", type: "rotate", from: `360 ${centerX} ${centerY}`, to: `0 ${centerX} ${centerY}`, dur: rotationSpeed, repeatCount: "indefinite" })) }) }), _jsx("circle", { cx: centerX, cy: centerY, r: innerRadius * 0.6, fill: "url(#sankofaFlow)", opacity: "0.3", filter: "url(#pulseGlow)", children: animated && (_jsxs(_Fragment, { children: [_jsx("animate", { attributeName: "r", values: `${innerRadius * 0.5};${innerRadius * 0.7};${innerRadius * 0.5}`, dur: "4s", repeatCount: "indefinite" }), _jsx("animate", { attributeName: "opacity", values: "0.2;0.5;0.2", dur: "4s", repeatCount: "indefinite" })] })) }), _jsxs("text", { x: centerX, y: centerY, textAnchor: "middle", dominantBaseline: "middle", fontSize: size * 0.15, fill: "#fff", opacity: "0.8", fontWeight: "bold", children: ["\u26A1", animated && (_jsx("animate", { attributeName: "opacity", values: "0.6;1;0.6", dur: "2s", repeatCount: "indefinite" }))] }), pillars.map((pillar, index) => {
                        const pos = getPillarPosition(pillar.angle, outerRadius);
                        return (_jsxs("g", { children: [_jsx("line", { x1: centerX, y1: centerY, x2: pos.x, y2: pos.y, stroke: pillar.color, strokeWidth: "1.5", opacity: "0.2", children: animated && (_jsx("animate", { attributeName: "opacity", values: "0.1;0.4;0.1", dur: "3s", repeatCount: "indefinite", begin: `${index * 0.6}s` })) }), _jsx("circle", { cx: pos.x, cy: pos.y, r: size * 0.06, fill: pillar.color, stroke: "#fff", strokeWidth: "2", filter: "url(#sankofaGlow)", children: animated && (_jsx("animate", { attributeName: "r", values: `${size * 0.05};${size * 0.07};${size * 0.05}`, dur: "2s", repeatCount: "indefinite", begin: `${index * 0.4}s` })) }), _jsx("text", { x: pos.x, y: pos.y, textAnchor: "middle", dominantBaseline: "middle", fontSize: size * 0.04, children: pillar.icon }), _jsx("text", { x: pos.x, y: pos.y + size * 0.08, textAnchor: "middle", fontSize: size * 0.035, fill: "#fff", fontWeight: "600", opacity: "0.9", children: pillar.name })] }, pillar.name));
                    }), animated && pillars.map((pillar, index) => {
                        const nextPillar = pillars[(index + 1) % pillars.length];
                        const start = getPillarPosition(pillar.angle, outerRadius * 0.85);
                        const end = getPillarPosition(nextPillar.angle, outerRadius * 0.85);
                        return (_jsx("g", { children: _jsx("circle", { r: "3", fill: pillar.color, opacity: "0.6", children: _jsx("animateMotion", { dur: "5s", repeatCount: "indefinite", begin: `${index * 1}s`, path: `M ${start.x},${start.y} Q ${centerX},${centerY} ${end.x},${end.y}` }) }) }, `arrow-${index}`));
                    })] }), showMetrics && (_jsxs("div", { style: {
                    position: 'absolute',
                    bottom: -60,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: '#fff',
                    width: '100%',
                }, children: [_jsx("div", { style: { fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }, children: "SANKOFA ENGINE STATUS" }), _jsx("div", { style: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }, children: pillars.map((pillar, i) => (_jsxs("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                color: pillar.color
                            }, children: [_jsx("span", { children: pillar.icon }), _jsxs("span", { children: [Object.values(metrics)[i], "%"] })] }, pillar.name))) })] }))] }));
});
SankofaEngine.displayName = 'SankofaEngine';
export default SankofaEngine;
