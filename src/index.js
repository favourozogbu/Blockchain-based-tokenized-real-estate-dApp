// entry point for a React application
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Creating a root container where the React component tree will be attached.
const root = ReactDOM.createRoot(document.getElementById('root'));
// Rendering the application inside React's Strict Mode, which adds additional checks and warnings for its descendants.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


reportWebVitals();
