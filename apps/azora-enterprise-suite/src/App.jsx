import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { Billing } from './pages/Billing';
import { Settings } from './pages/Settings';
import { Integrations } from './pages/Integrations';
import { Reports } from './pages/Reports';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/admin/analytics" element={<Analytics />} />
                <Route path="/admin/billing" element={<Billing />} />
                <Route path="/admin/settings" element={<Settings />} />
                <Route path="/admin/integrations" element={<Integrations />} />
                <Route path="/admin/reports" element={<Reports />} />
            </Routes>
        </Router>
    );
}

export default App;
