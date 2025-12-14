import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CarDetailPage from './pages/CarDetailPage';
import PrivateRoute from './components/PrivateRoute';
import AdminDashboardPage from './pages/AdminDashboardPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/cars/:id" element={<CarDetailPage />} />
            
            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route element={<PrivateRoute requiredRole="admin" />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>

          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
