import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../../frontend/shared/components/Header';

describe('Header Component', () => {
  test('renders the header with the correct title', () => {
    render(<Header />);
    const titleElement = screen.getByText(/Azora OS/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('contains a navigation menu', () => {
    render(<Header />);
    const navElement = screen.getByRole('navigation');
    expect(navElement).toBeInTheDocument();
  });

  test('renders logo image', () => {
    render(<Header />);
    const logoElement = screen.getByAltText(/azora logo/i);
    expect(logoElement).toBeInTheDocument();
  });
});