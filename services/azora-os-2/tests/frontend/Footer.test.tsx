import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../../shared/components/Footer';

describe('Footer', () => {
  test('renders footer with correct text', () => {
    render(<Footer />);
    const footerElement = screen.getByText(/© 2023 Azora OS/i);
    expect(footerElement).toBeInTheDocument();
  });

  test('contains links to privacy policy and terms of service', () => {
    render(<Footer />);
    const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
    const termsLink = screen.getByRole('link', { name: /Terms of Service/i });
    expect(privacyLink).toBeInTheDocument();
    expect(termsLink).toBeInTheDocument();
  });
});