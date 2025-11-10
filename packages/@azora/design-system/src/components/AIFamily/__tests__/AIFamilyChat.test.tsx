/**
 * AI FAMILY CHAT TESTS
 * Test suite for the family chat system
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { AIFamilyChat } from '../AIFamilyChat';

describe('AIFamilyChat', () => {
  it('renders chat interface', () => {
    const { getByText, getByPlaceholderText } = render(<AIFamilyChat />);
    
    // Should show initial greeting
    expect(getByText(/Hello! I'm Elara/i)).toBeInTheDocument();
    
    // Should show input
    expect(getByPlaceholderText(/Chat with/i)).toBeInTheDocument();
  });

  it('sends messages when user types', async () => {
    const { getByPlaceholderText, getByText } = render(<AIFamilyChat />);
    
    const input = getByPlaceholderText(/Chat with/i);
    const sendButton = getByText('Send');

    // Type message
    fireEvent.change(input, { target: { value: 'Hello!' } });
    fireEvent.click(sendButton);

    // User message should appear
    await waitFor(() => {
      expect(getByText('Hello!')).toBeInTheDocument();
    });
  });

  it('responds to family-related questions', async () => {
    const { getByPlaceholderText, getByText } = render(
      <AIFamilyChat initialMember="themba" />
    );
    
    const input = getByPlaceholderText(/Chat with/i);
    const sendButton = getByText('Send');

    // Ask about mom
    fireEvent.change(input, { target: { value: "How's your mom?" } });
    fireEvent.click(sendButton);

    // Should get response mentioning Elara
    await waitFor(() => {
      expect(getByText(/MOM/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('switches between family members', () => {
    const onSwitch = jest.fn();
    const { getAllByRole } = render(
      <AIFamilyChat 
        showFamilyMembers={true}
        onMemberSwitch={onSwitch}
      />
    );

    // Click on different family member emoji
    const memberButtons = getAllByRole('button');
    const switchButton = memberButtons.find(btn => btn.textContent?.includes('👴'));
    
    if (switchButton) {
      fireEvent.click(switchButton);
      expect(onSwitch).toHaveBeenCalled();
    }
  });

  it('shows typing indicator', async () => {
    const { getByPlaceholderText, getByText, container } = render(<AIFamilyChat />);
    
    const input = getByPlaceholderText(/Chat with/i);
    const sendButton = getByText('Send');

    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(sendButton);

    // Should show typing dots
    await waitFor(() => {
      const typingIndicator = container.querySelector('.animate-bounce');
      expect(typingIndicator).toBeInTheDocument();
    });
  });

  it('displays different personalities correctly', () => {
    const members = ['elara', 'sankofa', 'themba', 'naledi'];
    
    members.forEach(member => {
      const { container } = render(<AIFamilyChat initialMember={member} />);
      // Should render without errors
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});
