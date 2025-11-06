import React from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { Header } from '../../shared/components/Header';
import { Footer } from '../../shared/components/Footer';
import './styles.css';

const App = () => {
    return (
        <div className="admin-app">
            <Header />
            <main>
                <AdminDashboard />
            </main>
            <Footer />
        </div>
    );
};

export default App;