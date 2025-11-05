import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <h2>Azora OS</h2>
            <ul>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/admin">Admin</Link></li>
                <li><Link to="/user">User</Link></li>
                <li><Link to="/settings">Settings</Link></li>
                <li><Link to="/help">Help</Link></li>
            </ul>
        </div>
    );
};

export default Sidebar;