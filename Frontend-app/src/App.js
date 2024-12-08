import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './AppRoutes';

function App() {
    return (
        <AuthProvider>
            
                <AppRoutes />
            
        </AuthProvider>
    );
}

export default App;

