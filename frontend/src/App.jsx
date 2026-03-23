import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          
          <Header />

          <main className="flex-grow flex items-center justify-center p-4 md:p-10 relative overflow-hidden">
            {/* Ambient Decorative Blobs - Removed for Corporate Theme */}

            <Routes>
              <Route path="/" element={<RegistrationPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
