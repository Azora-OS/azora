import React from 'react';
import { Dashboard } from './Dashboard';
import './styles.css';

const App = () => {
    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            <Dashboard />
        </div>
    );
};

export default App;