import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { TherapyProvider } from './hooks/useTherapyStore';
import AppRoutes from './routes/AppRoutes';
import WhatsAppButton from './components/WhatsAppButton';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <TherapyProvider>
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 min-h-0">
            <AppRoutes />
          </div>
          <Footer />
        </div>
        <WhatsAppButton />
      </TherapyProvider>
    </BrowserRouter>
  );
}

export default App;
