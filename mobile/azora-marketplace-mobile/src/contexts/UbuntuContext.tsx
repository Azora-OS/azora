import React, { createContext, useContext, ReactNode } from 'react';

interface UbuntuContextType {
  philosophy: string;
  principles: string[];
  greeting: () => string;
}

const UbuntuContext = createContext<UbuntuContextType | undefined>(undefined);

export function UbuntuProvider({ children }: { children: ReactNode }) {
  const value: UbuntuContextType = {
    philosophy: 'Ngiyakwazi ngoba sikwazi - I am because we are',
    principles: [
      'My success enables your success',
      'My knowledge becomes our knowledge', 
      'My work strengthens our foundation',
      'My security ensures our freedom'
    ],
    greeting: () => {
      const greetings = [
        'Sawubona! (I see you)',
        'Ubuntu greetings!',
        'Welcome to our collective!',
        'Together we prosper!'
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
  };

  return (
    <UbuntuContext.Provider value={value}>
      {children}
    </UbuntuContext.Provider>
  );
}

export function useUbuntu() {
  const context = useContext(UbuntuContext);
  if (!context) {
    throw new Error('useUbuntu must be used within UbuntuProvider');
  }
  return context;
}