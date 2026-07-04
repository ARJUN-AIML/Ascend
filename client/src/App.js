import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import GlobalBackground from './components/GlobalBackground';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Copilot = lazy(() => import('./pages/Copilot'));
const SkillGapRadar = lazy(() => import('./pages/SkillGapRadar'));
const MockInterview = lazy(() => import('./pages/MockInterview'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Profile = lazy(() => import('./pages/Profile'));

const LoadingFallback = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)' }}>
    <div className="spinner-sm" style={{ width: '40px', height: '40px', borderColor: 'var(--border-light)', borderTopColor: 'var(--accent-primary)' }}></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <ProductProvider>
          <GlobalBackground />
          <Navbar />
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/login"  element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route path="/onboarding" element={
                  <ProtectedRoute><Onboarding /></ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />

                <Route path="/" element={
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />

                <Route path="/copilot" element={
                  <ProtectedRoute><Copilot /></ProtectedRoute>
                } />

                <Route path="/skill-gap" element={
                  <ProtectedRoute><SkillGapRadar /></ProtectedRoute>
                } />

                <Route path="/mock-interview" element={
                  <ProtectedRoute><MockInterview /></ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </ProductProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
