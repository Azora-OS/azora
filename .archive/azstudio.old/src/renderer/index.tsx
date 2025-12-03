import React from 'react';
import { createRoot } from 'react-dom/client';
import './App-Modern.css';
import App from './App-Modern';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
