import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Import React Router
import { BrowserRouter } from 'react-router-dom';

// Import pages


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);