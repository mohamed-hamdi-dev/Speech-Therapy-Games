import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { TherapyProvider } from './hooks/useTherapyStore';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <TherapyProvider>
        <AppRoutes />
      </TherapyProvider>
    </BrowserRouter>
  );
}

export default App;
