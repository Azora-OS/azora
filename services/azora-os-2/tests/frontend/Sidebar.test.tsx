import React from 'react';
import { render, screen } from '@testing-library/react';
import Sidebar from '../../frontend/shared/components/Sidebar';

describe('Sidebar', () => {
  test('renders sidebar with correct links', () => {
    render(<Sidebar />);
    
    const homeLink = screen.getByText(/home/i);
    const aboutLink = screen.getByText(/about/i);
    const contactLink = screen.getByText(/contact/i);
    
    expect(homeLink).toBeInTheDocument();
    expect(aboutLink).toBeInTheDocument();
    expect(contactLink).toBeInTheDocument();
  });

  test('renders sidebar with correct title', () => {
    render(<Sidebar />);
    
    const title = screen.getByText(/sidebar title/i);
    
    expect(title).toBeInTheDocument();
  });
});