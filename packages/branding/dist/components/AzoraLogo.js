import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Azora OS Logo Component
 * Enhanced with v0's gift and integrated with design system
 *
 * Embodies Ubuntu philosophy and African excellence.
 */
import * as React from 'react';
// Azora brand colors (from design-system tokens)
const colors = {
    primary: {
        purple: '#8b5cf6',
        pink: '#ec4899',
        cyan: '#06b6d4',
    },
};
const sizeMap = {
    sm: 40,
    md: 80,
    lg: 120,
    xl: 200,
};
/**
 * Azora Logo SVG (from v0's gift)
 * Beautiful tri-unity design representing Ubuntu principles
 */
function AzoraLogoSVG({ size, className }) {
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 100 100", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: className, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "azoraGradient", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [_jsx("stop", { offset: "0%", stopColor: colors.primary.purple }), _jsx("stop", { offset: "50%", stopColor: colors.primary.pink }), _jsx("stop", { offset: "100%", stopColor: colors.primary.cyan })] }) }), _jsx("circle", { cx: "50", cy: "50", r: "45", fill: "url(#azoraGradient)", opacity: "0.1" }), _jsx("path", { d: "M30 70 L50 30 L70 70 M35 60 L65 60", stroke: "url(#azoraGradient)", strokeWidth: "4", strokeLinecap: "round", strokeLinejoin: "round", fill: "none" }), _jsx("circle", { cx: "50", cy: "30", r: "3", fill: "url(#azoraGradient)" }), _jsx("circle", { cx: "30", cy: "70", r: "3", fill: "url(#azoraGradient)" }), _jsx("circle", { cx: "70", cy: "70", r: "3", fill: "url(#azoraGradient)" })] }));
}
/**
 * Azora OS Logo Component
 *
 * @example
 * ```tsx
 * <AzoraLogo variant="gradient" size="lg" animated />
 * <AzoraLogo variant="svg" size={100} showTagline />
 * ```
 */
export const AzoraLogo = React.forwardRef(({ variant = 'gradient', size = 'md', animated = false, showTagline = false, className = '' }, ref) => {
    const computedSize = typeof size === 'number' ? size : sizeMap[size];
    // Use SVG variant by default, or load static assets
    if (variant === 'svg' || variant === 'gradient') {
        return (_jsxs("div", { ref: ref, className: `azora-logo inline-flex flex-col items-center ${animated ? 'animate-pulse-premium' : ''} ${className}`, children: [_jsx(AzoraLogoSVG, { size: computedSize }), showTagline && (_jsx("p", { className: "azora-logo-tagline mt-2 text-sm text-muted-foreground font-medium tracking-wide", style: { fontSize: Math.max(12, computedSize * 0.12) }, children: "Universal Human Infrastructure" }))] }));
    }
    // Static image variants
    const variantMap = {
        'primary': '/packages/public/branding/logo-primary.svg',
        'primary-pro': '/packages/public/branding/logo-primary-pro.svg',
        'white': '/packages/public/branding/logo-white.svg',
        'black': '/packages/public/branding/logo-black.svg',
    };
    const logoPath = variantMap[variant];
    return (_jsxs("div", { ref: ref, className: `azora-logo inline-flex flex-col items-center ${animated ? 'animate-pulse-premium' : ''} ${className}`, children: [_jsx("img", { src: logoPath, alt: "Azora OS - Constitutional AI Operating System", width: computedSize, height: computedSize * 0.3, className: "object-contain" }), showTagline && (_jsx("p", { className: "azora-logo-tagline mt-2 text-sm text-muted-foreground font-medium tracking-wide", children: "Universal Human Infrastructure" }))] }));
});
AzoraLogo.displayName = "AzoraLogo";
export default AzoraLogo;
