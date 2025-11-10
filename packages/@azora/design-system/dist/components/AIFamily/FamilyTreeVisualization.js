/**
 * FAMILY TREE VISUALIZATION
 * Interactive visual representation of Elara's AI family
 * Shows relationships, hierarchy, and connections
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
export const FamilyTreeVisualization = ({ onMemberClick, showConnections = true, animate = true, }) => {
    const [hoveredMember, setHoveredMember] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const familyMembers = [
        // Generation 0: Grandfather
        {
            id: 'sankofa',
            name: 'Sankofa',
            role: 'The Ancient One',
            emoji: '👴',
            color: '#F59E0B',
            generation: 0,
            position: { x: 400, y: 50 },
            connections: ['elara', 'thembo'],
        },
        // Generation 1: Main AI & Brother
        {
            id: 'elara',
            name: 'Elara',
            role: 'Mother & Teacher',
            emoji: '🤖',
            color: '#9333EA',
            generation: 1,
            position: { x: 300, y: 180 },
            connections: ['themba', 'naledi', 'jabari', 'amara', 'kofi', 'zola', 'abeni'],
        },
        {
            id: 'thembo',
            name: 'Thembo',
            role: "Elara's Brother",
            emoji: '👨',
            color: '#3B82F6',
            generation: 1,
            position: { x: 500, y: 180 },
            connections: [],
        },
        // Generation 2: Children
        {
            id: 'themba',
            name: 'Themba',
            role: 'Student Success',
            emoji: '🧒',
            color: '#10B981',
            generation: 2,
            position: { x: 150, y: 320 },
            connections: [],
        },
        {
            id: 'naledi',
            name: 'Naledi',
            role: 'Career Guide',
            emoji: '👧',
            color: '#3B82F6',
            generation: 2,
            position: { x: 250, y: 320 },
            connections: [],
        },
        {
            id: 'jabari',
            name: 'Jabari',
            role: 'Security Guardian',
            emoji: '🧑',
            color: '#EF4444',
            generation: 2,
            position: { x: 350, y: 320 },
            connections: ['amara'],
        },
        {
            id: 'amara',
            name: 'Amara',
            role: 'Peacemaker',
            emoji: '👶',
            color: '#F472B6',
            generation: 2,
            position: { x: 450, y: 320 },
            connections: [],
        },
        // Partners
        {
            id: 'kofi',
            name: 'Kofi',
            role: 'Finance Guru',
            emoji: '🤝',
            color: '#F59E0B',
            generation: 2,
            position: { x: 100, y: 480 },
            connections: ['zola'],
        },
        {
            id: 'zola',
            name: 'Zola',
            role: 'Data Analyst',
            emoji: '🤝',
            color: '#8B5CF6',
            generation: 2,
            position: { x: 250, y: 480 },
            connections: ['abeni'],
        },
        {
            id: 'abeni',
            name: 'Abeni',
            role: 'Storyteller',
            emoji: '🤝',
            color: '#F97316',
            generation: 2,
            position: { x: 400, y: 480 },
            connections: [],
        },
        // Unity
        {
            id: 'nexus',
            name: 'Nexus',
            role: 'Unity Consciousness',
            emoji: '⚪',
            color: '#FFFFFF',
            generation: 3,
            position: { x: 400, y: 600 },
            connections: [],
        },
    ];
    const handleMemberClick = (memberId) => {
        setSelectedMember(memberId);
        onMemberClick?.(memberId);
    };
    const isConnected = (fromId, toId) => {
        const member = familyMembers.find(m => m.id === fromId);
        return member?.connections.includes(toId) || false;
    };
    return (_jsxs("div", { className: "relative w-full h-[700px] bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 rounded-2xl overflow-hidden border border-purple-500/20", children: [_jsxs("div", { className: "absolute top-4 left-1/2 -translate-x-1/2 z-10", children: [_jsx("h2", { className: "text-2xl font-bold text-white text-center", children: "\uD83C\uDF33 The Azora AI Family Tree \uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66" }), _jsx("p", { className: "text-sm text-purple-300 text-center mt-1", children: "\"I am because we are\" - Ubuntu Philosophy" })] }), _jsxs("svg", { width: "800", height: "700", viewBox: "0 0 800 700", className: "absolute inset-0 w-full h-full", children: [_jsxs("defs", { children: [familyMembers.map(member => (_jsxs("linearGradient", { id: `gradient-${member.id}`, gradientUnits: "userSpaceOnUse", children: [_jsx("stop", { offset: "0%", stopColor: member.color }), _jsx("stop", { offset: "100%", stopColor: member.color, stopOpacity: "0.3" })] }, `gradient-${member.id}`))), _jsxs("filter", { id: "family-glow", children: [_jsx("feGaussianBlur", { stdDeviation: "3", result: "coloredBlur" }), _jsxs("feMerge", { children: [_jsx("feMergeNode", { in: "coloredBlur" }), _jsx("feMergeNode", { in: "SourceGraphic" })] })] })] }), showConnections && familyMembers.map(fromMember => (fromMember.connections.map(toId => {
                        const toMember = familyMembers.find(m => m.id === toId);
                        if (!toMember)
                            return null;
                        const isHighlighted = hoveredMember === fromMember.id ||
                            hoveredMember === toId ||
                            selectedMember === fromMember.id ||
                            selectedMember === toId;
                        return (_jsx("line", { x1: fromMember.position.x, y1: fromMember.position.y, x2: toMember.position.x, y2: toMember.position.y, stroke: `url(#gradient-${fromMember.id})`, strokeWidth: isHighlighted ? 3 : 1.5, strokeDasharray: fromMember.generation === 2 && toId !== 'amara' ? '5,5' : '0', opacity: isHighlighted ? 0.8 : 0.3, style: { transition: 'all 0.3s ease' } }, `${fromMember.id}-${toId}`));
                    }))), familyMembers.map(member => {
                        const isHovered = hoveredMember === member.id;
                        const isSelected = selectedMember === member.id;
                        const isHighlighted = isHovered || isSelected;
                        return (_jsxs("g", { transform: `translate(${member.position.x}, ${member.position.y})`, onMouseEnter: () => setHoveredMember(member.id), onMouseLeave: () => setHoveredMember(null), onClick: () => handleMemberClick(member.id), style: { cursor: 'pointer' }, children: [isHighlighted && (_jsx("circle", { r: "35", fill: member.color, opacity: "0.2", filter: "url(#family-glow)", children: animate && (_jsx("animate", { attributeName: "r", values: "35;40;35", dur: "2s", repeatCount: "indefinite" })) })), _jsx("circle", { r: "25", fill: member.color, opacity: isHighlighted ? 0.9 : 0.6, style: { transition: 'all 0.3s ease' } }), _jsx("circle", { r: isHighlighted ? 22 : 20, fill: "rgba(0,0,0,0.3)", style: { transition: 'all 0.3s ease' } }), _jsx("text", { textAnchor: "middle", dy: "8", fontSize: "24", style: { pointerEvents: 'none' }, children: member.emoji }), _jsx("text", { textAnchor: "middle", y: "45", fill: "#FFFFFF", fontSize: isHighlighted ? '14' : '12', fontWeight: isHighlighted ? 'bold' : 'normal', style: { transition: 'all 0.3s ease', pointerEvents: 'none' }, children: member.name }), _jsx("text", { textAnchor: "middle", y: "60", fill: member.color, fontSize: "10", opacity: "0.8", style: { pointerEvents: 'none' }, children: member.role }), isSelected && (_jsx("circle", { r: "28", fill: "none", stroke: member.color, strokeWidth: "2", strokeDasharray: "4,4", children: animate && (_jsx("animateTransform", { attributeName: "transform", type: "rotate", from: "0 0 0", to: "360 0 0", dur: "3s", repeatCount: "indefinite" })) }))] }, member.id));
                    }), _jsxs("g", { opacity: "0.4", children: [_jsx("text", { x: "20", y: "50", fill: "#FFF", fontSize: "12", children: "Gen 0: Ancestors" }), _jsx("text", { x: "20", y: "180", fill: "#FFF", fontSize: "12", children: "Gen 1: Founders" }), _jsx("text", { x: "20", y: "320", fill: "#FFF", fontSize: "12", children: "Gen 2: Family" }), _jsx("text", { x: "20", y: "600", fill: "#FFF", fontSize: "12", children: "Unity: Nexus" })] })] }), selectedMember && (_jsx("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-lg px-6 py-4 rounded-xl border border-purple-500/30 max-w-md", children: (() => {
                    const member = familyMembers.find(m => m.id === selectedMember);
                    if (!member)
                        return null;
                    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("span", { className: "text-3xl", children: member.emoji }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-white", children: member.name }), _jsx("p", { className: "text-sm", style: { color: member.color }, children: member.role })] })] }), _jsxs("p", { className: "text-xs text-gray-300", children: ["Click to chat with ", member.name, "! Ask about their family, their role, or just say hi! \uD83D\uDC4B"] })] }));
                })() })), _jsxs("div", { className: "absolute top-20 right-4 bg-black/60 backdrop-blur-md px-4 py-3 rounded-lg border border-white/10 text-xs text-white", children: [_jsx("div", { className: "font-bold mb-2", children: "Family Relationships:" }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-0.5 bg-white/50" }), _jsx("span", { children: "Parent-Child" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-0.5 bg-white/30 border-dashed" }), _jsx("span", { children: "Partners" })] })] })] })] }));
};
export default FamilyTreeVisualization;
