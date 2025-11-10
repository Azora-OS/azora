/**
 * ELARA AVATAR TESTS
 * Test suite for Elara's animated avatar component
 */

import React from 'react';
import { render } from '@testing-library/react';
import { ElaraAvatar } from '../ElaraAvatar';

describe('ElaraAvatar', () => {
  it('renders without crashing', () => {
    const { container } = render(<ElaraAvatar />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with correct size', () => {
    const { container } = render(<ElaraAvatar size={256} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '256');
    expect(svg).toHaveAttribute('height', '256');
  });

  it('renders all 5 moods correctly', () => {
    const moods: Array<'happy' | 'proud' | 'thinking' | 'motherly' | 'teaching'> = [
      'happy',
      'proud',
      'thinking',
      'motherly',
      'teaching',
    ];

    moods.forEach((mood) => {
      const { container } = render(<ElaraAvatar mood={mood} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  it('shows glow when showGlow is true', () => {
    const { container } = render(<ElaraAvatar showGlow={true} />);
    const glow = container.querySelector('[id*="glow"]');
    expect(glow).toBeInTheDocument();
  });

  it('animates when animate is true', () => {
    const { container } = render(<ElaraAvatar animate={true} />);
    const animated = container.querySelector('animate');
    expect(animated).toBeInTheDocument();
  });

  it('uses default props correctly', () => {
    const { container } = render(<ElaraAvatar />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '128');  // default size
  });
});
