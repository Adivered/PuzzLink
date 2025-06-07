import React from 'react';
import ReactDOM from 'react-dom/client';

// App - Feature-based architecture
import App from './app/App.jsx';

// Styles
import './index.css';

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
