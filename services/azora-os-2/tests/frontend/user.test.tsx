import React from 'react';
import { render, screen } from '@testing-library/react';
import UserApp from '../../frontend/apps/user/App';

describe('User App', () => {
  test('renders user app component', () => {
    render(<UserApp />);
    const linkElement = screen.getByText(/User Dashboard/i);
    expect(linkElement).toBeInTheDocument();
  });

  // Additional tests can be added here
});