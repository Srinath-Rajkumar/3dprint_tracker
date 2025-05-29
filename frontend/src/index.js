// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router> {/* Router wraps everything */}
      <AuthProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);