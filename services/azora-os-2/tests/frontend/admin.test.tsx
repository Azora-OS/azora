import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminApp from '../../frontend/apps/admin/App';

describe('Admin App', () => {
  test('renders Admin App title', () => {
    render(<AdminApp />);
    const titleElement = screen.getByText(/Admin Dashboard/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    render(<AdminApp />);
    const linkElement = screen.getByRole('link', { name: /Users/i });
    expect(linkElement).toBeInTheDocument();
  });

  test('renders admin features', () => {
    render(<AdminApp />);
    const featureElement = screen.getByText(/Manage Users/i);
    expect(featureElement).toBeInTheDocument();
  });
});