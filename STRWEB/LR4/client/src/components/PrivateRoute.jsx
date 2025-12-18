import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ requiredRole }) => {
    const { auth } = useContext(AuthContext);
    const { isAuthenticated, loading, user } = auth;

    if (loading) {
        return <p>Загрузка...</p>; // Or a spinner component
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/" />; // Or show an 'Access Denied' page
    }

    return <Outlet />;
};

export default PrivateRoute;
