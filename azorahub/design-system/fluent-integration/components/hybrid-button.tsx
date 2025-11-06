/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

import React, { useState, useRef, useEffect } from 'react';
import { Button as FluentButton } from '@fluentui/react-components';
import { Button as MUIButton } from '@mui/material';
import styled from '@emotion/styled';

// Hybrid Design Token System
const HybridTokens = {
  // Combined Material Design 3 + Fluent Design colors
  primary: {
    main: '#6750A4', // Material Design 3 primary
    light: '#D0BCFF',
    dark: '#381E72',
    accent: '#0078D4', // Fluent Design accent
    surface: '#F3F2F1', // Fluent surface
  },
  // Unified typography
  typography: {
    fontFamily: "'Segoe UI Variable', 'Roboto', system-ui, sans-serif",
    fontSize: {
      small: '12px',
      medium: '14px',
      large: '16px',
      xlarge: '18px',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  // Enhanced elevation system
  elevation: {
    subtle: '0 1px 3px rgba(0, 0, 0, 0.12)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.15)',
    strong: '0 8px 24px rgba(0, 0, 0, 0.18)',
  },
  // Motion system
  motion: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
    easing: {
      standard: 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
      emphasized: 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
    },
  },
};

// Styled Components with Hybrid Design System
const HybridButtonRoot = styled.button<{
  variant: 'primary' | 'secondary' | 'accent' | 'subtle';
  appearance: 'filled' | 'outlined' | 'ghost' | 'lightweight';
  size: 'small' | 'medium' | 'large';
  disabled: boolean;
  loading: boolean;
}>`
  /* Base Styles */
  font-family: ${HybridTokens.typography.fontFamily};
  font-size: ${props => HybridTokens.typography.fontSize[props.size]};
  font-weight: ${HybridTokens.typography.fontWeight.medium};
  border: none;
  border-radius: 8px; /* Material Design 3 corner medium */
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: ${props => {
    switch (props.size) {
      case 'small': return '32px';
      case 'medium': return '40px';
      case 'large': return '48px';
      default: return '40px';
    }
  }};
  padding: ${props => {
    switch (props.size) {
      case 'small': return '6px 12px';
      case 'medium': return '8px 16px';
      case 'large': return '12px 24px';
      default: return '8px 16px';
    }
  }};
  transition: all ${HybridTokens.motion.duration.normal} ${HybridTokens.motion.easing.standard};
  position: relative;
  overflow: hidden;
  
  /* Variant Styles */
  ${props => {
    if (props.appearance === 'filled') {
      switch (props.variant) {
        case 'primary':
          return `
            background: linear-gradient(135deg, ${HybridTokens.primary.main} 0%, ${HybridTokens.primary.dark} 100%);
            color: white;
            box-shadow: ${HybridTokens.elevation.subtle};
            
            &:hover:not(:disabled) {
              box-shadow: ${HybridTokens.elevation.medium};
              transform: translateY(-1px);
            }
          `;
        case 'secondary':
          return `
            background: ${HybridTokens.primary.surface};
            color: ${HybridTokens.primary.main};
            box-shadow: ${HybridTokens.elevation.subtle};
            
            &:hover:not(:disabled) {
              background: ${HybridTokens.primary.light};
              box-shadow: ${HybridTokens.elevation.medium};
            }
          `;
        case 'accent':
          return `
            background: linear-gradient(135deg, ${HybridTokens.primary.accent} 0%, #106EBE 100%);
            color: white;
            box-shadow: ${HybridTokens.elevation.subtle};
            
            &:hover:not(:disabled) {
              box-shadow: ${HybridTokens.elevation.medium};
              transform: translateY(-1px);
            }
          `;
        default:
          return `
            background: ${HybridTokens.primary.surface};
            color: ${HybridTokens.primary.main};
          `;
      }
    } else if (props.appearance === 'outlined') {
      switch (props.variant) {
        case 'primary':
          return `
            background: transparent;
            color: ${HybridTokens.primary.main};
            border: 1px solid ${HybridTokens.primary.main};
            
            &:hover:not(:disabled) {
              background: ${HybridTokens.primary.light};
              border-color: ${HybridTokens.primary.dark};
            }
          `;
        case 'accent':
          return `
            background: transparent;
            color: ${HybridTokens.primary.accent};
            border: 1px solid ${HybridTokens.primary.accent};
            
            &:hover:not(:disabled) {
              background: rgba(0, 120, 212, 0.1);
            }
          `;
        default:
          return `
            background: transparent;
            color: ${HybridTokens.primary.main};
            border: 1px solid ${HybridTokens.primary.main};
          `;
      }
    } else if (props.appearance === 'ghost') {
      switch (props.variant) {
        case 'primary':
          return `
            background: transparent;
            color: ${HybridTokens.primary.main};
            
            &:hover:not(:disabled) {
              background: rgba(103, 80, 164, 0.1);
            }
          `;
        case 'accent':
          return `
            background: transparent;
            color: ${HybridTokens.primary.accent};
            
            &:hover:not(:disabled) {
              background: rgba(0, 120, 212, 0.1);
            }
          `;
        default:
          return `
            background: transparent;
            color: ${HybridTokens.primary.main};
          `;
      }
    } else {
      // Lightweight
      return `
        background: transparent;
        color: ${HybridTokens.primary.main};
        padding: 4px 8px;
        min-height: auto;
        
        &:hover:not(:disabled) {
          background: rgba(103, 80, 164, 0.05);
        }
      `;
    }
  }}
  
  /* Disabled State */
  ${props => props.disabled && `
    opacity: 0.38;
    cursor: not-allowed;
    pointer-events: none;
  `}
  
  /* Loading State */
  ${props => props.loading && `
    color: transparent;
    pointer-events: none;
  `}
  
  /* Focus State (Accessibility) */
  &:focus-visible {
    outline: 2px solid ${HybridTokens.primary.accent};
    outline-offset: 2px;
  }
  
  /* Active State */
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: ${HybridTokens.elevation.subtle};
  }
`;

// Reveal Effect (Fluent Design)
const RevealOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, 0.2) 0%,
    transparent 50%
  );
  opacity: 0;
  transition: opacity ${HybridTokens.motion.duration.normal} ${HybridTokens.motion.easing.standard};
  pointer-events: none;
  border-radius: inherit;
`;

// Loading Spinner
const LoadingSpinner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }
`;

// Icon Container
const IconContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

// Text Container
const TextContainer = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Main Hybrid Button Component
export interface AzoraFluentButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'subtle';
  appearance?: 'filled' | 'outlined' | 'ghost' | 'lightweight';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'before' | 'after';
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'data-testid'?: string;
}

export const AzoraFluentButton: React.FC<AzoraFluentButtonProps> = ({
  variant = 'primary',
  appearance = 'filled',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'before',
  children,
  onClick,
  onFocus,
  onBlur,
  onMouseEnter,
  onMouseLeave,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'data-testid': dataTestId,
  ...rest
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  // Handle reveal effect mouse tracking
  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  // Handle click with ripple effect
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    // Create ripple effect
    if (buttonRef.current) {
      const ripple = document.createElement('span');
      const rect = buttonRef.current.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('azora-fluent-ripple');
      
      buttonRef.current.appendChild(ripple);
      
      // Remove ripple after animation
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
    
    onClick?.(event);
  };

  // Accessibility: Handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(event as any);
    }
  };

  return (
    <HybridButtonRoot
      ref={buttonRef}
      variant={variant}
      appearance={appearance}
      size={size}
      disabled={disabled}
      loading={loading}
      onClick={handleClick}
      onFocus={onFocus}
      onBlur={onBlur}
      onMouseEnter={(e) => {
        handleMouseMove(e);
        onMouseEnter?.(e);
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={onMouseLeave}
      onKeyDown={handleKeyDown}
      className={className}
      style={style}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled}
      aria-busy={loading}
      data-testid={dataTestId}
      {...rest}
    >
      {/* Reveal Effect Overlay */}
      <RevealOverlay
        style={{
          '--mouse-x': `${mousePosition.x}%`,
          '--mouse-y': `${mousePosition.y}%`,
        } as React.CSSProperties}
      />
      
      {/* Loading Spinner */}
      {loading && <LoadingSpinner />}
      
      {/* Icon Before */}
      {icon && iconPosition === 'before' && !loading && (
        <IconContainer>{icon}</IconContainer>
      )}
      
      {/* Button Text */}
      <TextContainer>{children}</TextContainer>
      
      {/* Icon After */}
      {icon && iconPosition === 'after' && !loading && (
        <IconContainer>{icon}</IconContainer>
      )}
    </HybridButtonRoot>
  );
};

// CSS for ripple effect
const rippleStyles = `
  .azora-fluent-ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }
  
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;

// Inject ripple styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = rippleStyles;
  document.head.appendChild(styleElement);
}

export default AzoraFluentButton;

