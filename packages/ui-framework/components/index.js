/**
 * Azora UI Components
 * Unified component library for cross-platform consistency
 */

import React from 'react';
import styled from 'styled-components';

// Button Component
const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.components.button.padding};
  border-radius: ${props => props.theme.components.button.borderRadius};
  font-size: ${props => props.theme.components.button.fontSize};
  font-weight: ${props => props.theme.components.button.fontWeight};
  transition: ${props => props.theme.components.button.transition};
  cursor: pointer;
  border: 2px solid transparent;
  outline: none;
  text-decoration: none;

  /* Variant styles */
  ${props => {
    const colors = props.theme.colors;
    const variant = props.variant || 'primary';

    switch (variant) {
      case 'primary':
        return `
          background-color: ${colors.primary.main};
          color: ${colors.primary.contrast};
          border-color: ${colors.primary.main};

          &:hover:not(:disabled) {
            background-color: ${colors.primary.dark};
            border-color: ${colors.primary.dark};
            transform: translateY(-1px);
            box-shadow: ${props.theme.shadows.md};
          }

          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${props.theme.shadows.sm};
          }
        `;

      case 'secondary':
        return `
          background-color: ${colors.secondary.main};
          color: ${colors.secondary.contrast};
          border-color: ${colors.secondary.main};

          &:hover:not(:disabled) {
            background-color: ${colors.secondary.dark};
            border-color: ${colors.secondary.dark};
            transform: translateY(-1px);
            box-shadow: ${props.theme.shadows.md};
          }

          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${props.theme.shadows.sm};
          }
        `;

      case 'constitutional':
        return `
          background-color: ${colors.constitutional.main};
          color: ${colors.constitutional.contrast};
          border-color: ${colors.constitutional.main};

          &:hover:not(:disabled) {
            background-color: ${colors.constitutional.dark};
            border-color: ${colors.constitutional.dark};
            transform: translateY(-1px);
            box-shadow: ${props.theme.shadows.md};
          }

          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${props.theme.shadows.sm};
          }
        `;

      case 'outline':
        return `
          background-color: transparent;
          color: ${colors.primary.main};
          border-color: ${colors.primary.main};

          &:hover:not(:disabled) {
            background-color: ${colors.primary.main};
            color: ${colors.primary.contrast};
            transform: translateY(-1px);
            box-shadow: ${props.theme.shadows.md};
          }

          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${props.theme.shadows.sm};
          }
        `;

      case 'ghost':
        return `
          background-color: transparent;
          color: ${colors.primary.main};
          border-color: transparent;

          &:hover:not(:disabled) {
            background-color: ${colors.primary.light}20;
            transform: translateY(-1px);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;

      default:
        return '';
    }
  }}

  /* Size variants */
  ${props => {
    const spacing = props.theme.spacing;
    switch (props.size) {
      case 'sm':
        return `
          padding: ${spacing[1]} ${spacing[3]};
          font-size: ${props.theme.typography.fontSize.sm};
        `;
      case 'lg':
        return `
          padding: ${spacing[3]} ${spacing[6]};
          font-size: ${props.theme.typography.fontSize.lg};
        `;
      case 'xl':
        return `
          padding: ${spacing[4]} ${spacing[8]};
          font-size: ${props.theme.typography.fontSize.xl};
        `;
      default:
        return '';
    }
  }}

  /* State styles */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  &:focus {
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary.main}40;
  }

  /* Loading state */
  ${props => props.loading && `
    position: relative;
    color: transparent;

    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      top: 50%;
      left: 50%;
      margin-left: -8px;
      margin-top: -8px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}
`;

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  return (
    <StyledButton
      ref={ref}
      variant={variant}
      size={size}
      loading={loading}
      disabled={disabled || loading}
      {...props}
    >
      {leftIcon && <span>{leftIcon}</span>}
      {children}
      {rightIcon && <span>{rightIcon}</span>}
    </StyledButton>
  );
});

Button.displayName = 'Button';

// Input Component
const StyledInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.components.input.padding};
  border: ${props => props.theme.components.input.border};
  border-radius: ${props => props.theme.components.input.borderRadius};
  font-size: ${props => props.theme.components.input.fontSize};
  transition: ${props => props.theme.components.input.transition};
  background-color: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.primary};

  &::placeholder {
    color: ${props => props.theme.colors.text.hint};
  }

  &:focus {
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary.main}20;
    outline: none;
  }

  &:disabled {
    background-color: ${props => props.theme.colors.grey[100]};
    color: ${props => props.theme.colors.text.disabled};
    cursor: not-allowed;
  }

  /* Error state */
  ${props => props.error && `
    border-color: ${props.theme.colors.error.main};

    &:focus {
      border-color: ${props.theme.colors.error.main};
      box-shadow: 0 0 0 3px ${props.theme.colors.error.main}20;
    }
  `}

  /* Success state */
  ${props => props.success && `
    border-color: ${props.theme.colors.success.main};

    &:focus {
      border-color: ${props.theme.colors.success.main};
      box-shadow: 0 0 0 3px ${props.theme.colors.success.main}20;
    }
  `}
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

const InputLabel = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const InputError = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.error.main};
`;

const InputHelp = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

export const Input = React.forwardRef(({
  label,
  error,
  help,
  success,
  leftIcon,
  rightIcon,
  wrapperProps,
  ...props
}, ref) => {
  return (
    <InputWrapper {...wrapperProps}>
      {label && <InputLabel htmlFor={props.id}>{label}</InputLabel>}
      <div style={{ position: 'relative' }}>
        {leftIcon && (
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: props.theme.colors.text.secondary,
            zIndex: 1
          }}>
            {leftIcon}
          </div>
        )}
        <StyledInput
          ref={ref}
          error={!!error}
          success={success}
          style={{
            paddingLeft: leftIcon ? '40px' : undefined,
            paddingRight: rightIcon ? '40px' : undefined
          }}
          {...props}
        />
        {rightIcon && (
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: props.theme.colors.text.secondary,
            zIndex: 1
          }}>
            {rightIcon}
          </div>
        )}
      </div>
      {error && <InputError>{error}</InputError>}
      {help && !error && <InputHelp>{help}</InputHelp>}
    </InputWrapper>
  );
});

Input.displayName = 'Input';

// Card Component
const StyledCard = styled.div`
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.components.card.borderRadius};
  padding: ${props => props.theme.components.card.padding};
  box-shadow: ${props => props.theme.components.card.boxShadow};
  border: ${props => props.theme.components.card.border};
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;

  ${props => props.hoverable && `
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${props.theme.shadows.lg};
    }
  `}

  ${props => props.variant === 'elevated' && `
    box-shadow: ${props.theme.shadows.lg};
  `}

  ${props => props.variant === 'outlined' && `
    box-shadow: none;
    border: 2px solid ${props.theme.colors.grey[200]};
  `}

  ${props => props.variant === 'filled' && `
    background-color: ${props.theme.colors.grey[50]};
    border: none;
  `}
`;

const CardHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const CardTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing[2]} 0;
`;

const CardSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardActions = styled.div`
  margin-top: ${props => props.theme.spacing[4]};
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  justify-content: ${props => props.justify || 'flex-end'};
`;

export const Card = React.forwardRef(({
  title,
  subtitle,
  actions,
  actionsJustify,
  variant = 'default',
  hoverable = false,
  children,
  ...props
}, ref) => {
  return (
    <StyledCard ref={ref} variant={variant} hoverable={hoverable} {...props}>
      {(title || subtitle) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
      {actions && (
        <CardActions justify={actionsJustify}>
          {actions}
        </CardActions>
      )}
    </StyledCard>
  );
});

Card.displayName = 'Card';

// Export all components
export { Button, Input, Card };