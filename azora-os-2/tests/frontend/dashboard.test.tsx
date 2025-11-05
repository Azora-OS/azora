import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../../frontend/apps/dashboard/App';

describe('Dashboard Component', () => {
  test('renders dashboard heading', () => {
    render(<Dashboard />);
    const headingElement = screen.getByText(/Dashboard/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders user data', () => {
    render(<Dashboard />);
    const userDataElement = screen.getByTestId('user-data');
    expect(userDataElement).toBeInTheDocument();
  });

  test('renders loading state', () => {
    render(<Dashboard loading={true} />);
    const loadingElement = screen.getByText(/Loading/i);
    expect(loadingElement).toBeInTheDocument();
  });
});