import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles.css';

const UserApp = () => {
    return (
        <div>
            <h1>User Application</h1>
            <App />
        </div>
    );
};

ReactDOM.render(<UserApp />, document.getElementById('root'));