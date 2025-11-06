import React from 'react';
import { UserProfile } from './components/UserProfile';
import { UserSettings } from './components/UserSettings';
import { UserActivity } from './components/UserActivity';

const App: React.FC = () => {
    return (
        <div className="user-app">
            <h1>User Dashboard</h1>
            <UserProfile />
            <UserSettings />
            <UserActivity />
        </div>
    );
};

export default App;