/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

'use client';

import Image from 'next/image';
import { getLogoPath, getService, type LogoStyle, type LogoSize } from '@/lib/assets';
// Utility function for class names
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface LogoProps {
  service: string;
  style?: LogoStyle;
  size?: LogoSize;
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
}

/**
 * Premium Logo Component
 * Displays Azora OS service logos with proper styling
 */
export function Logo({
  service,
  style = 'geometric',
  size = 'full',
  width,
  height,
  className,
  alt,
  priority = false,
}: LogoProps) {
  const serviceInfo = getService(service);
  const logoPath = getLogoPath(service, style, size);
  
  // Default sizes based on size prop
  const defaultWidth = width || (size === 'icon' ? 32 : size === 'small' ? 64 : size === 'medium' ? 128 : size === 'large' ? 256 : 512);
  const defaultHeight = height || defaultWidth;
  
  const displayAlt = alt || serviceInfo?.name || `${service} logo`;

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <Image
        src={logoPath}
        alt={displayAlt}
        width={defaultWidth}
        height={defaultHeight}
        priority={priority}
        className="object-contain"
        style={{
          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
        }}
      />
    </div>
  );
}

interface LogoWithTextProps extends LogoProps {
  showText?: boolean;
  textPosition?: 'right' | 'below' | 'above';
  textClassName?: string;
}

/**
 * Logo with Service Name
 */
export function LogoWithText({
  service,
  style = 'geometric',
  size = 'medium',
  showText = true,
  textPosition = 'right',
  className,
  textClassName,
  ...logoProps
}: LogoWithTextProps) {
  const serviceInfo = getService(service);
  const isVertical = textPosition === 'below' || textPosition === 'above';

  return (
    <div
      className={cn(
        'flex items-center gap-3',
        isVertical && 'flex-col',
        className
      )}
    >
      {textPosition === 'above' && showText && (
        <span className={cn('font-bold text-lg', textClassName)}>
          {serviceInfo?.name}
        </span>
      )}
      
      <Logo
        service={service}
        style={style}
        size={size}
        {...logoProps}
      />
      
      {textPosition !== 'above' && showText && (
        <span className={cn('font-semibold', textClassName)}>
          {serviceInfo?.name}
        </span>
      )}
    </div>
  );
}

/**
 * Service Icon Component (compact version)
 */
export function ServiceIcon({
  service,
  className,
  ...props
}: Omit<LogoProps, 'size' | 'style'>) {
  return (
    <Logo
      service={service}
      style="geometric"
      size="icon"
      className={className}
      {...props}
    />
  );
}

