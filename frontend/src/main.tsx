import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Use the client ID from your screenshot (485426535146-7ran236jdgglnj606imovq6qbe2jjvc2.apps.googleusercontent.com)
// In production, use environment variables instead of hardcoding
const GOOGLE_CLIENT_ID = '485426535146-7ran236jdgglnj606imovq6qbe2jjvc2.apps.googleusercontent.com';

// Type assertion for root element
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);