import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const setAuthToken = token => {
    if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete axios.defaults.headers.common['x-auth-token'];
    }
};

const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        token: localStorage.getItem('token'),
        isAuthenticated: null,
        loading: true,
        user: null
    });

    const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuthToken(token);
            try {
                const res = await axios.get('http://localhost:5000/api/auth/me');
                setAuth({
                    token,
                    isAuthenticated: true,
                    loading: false,
                    user: res.data
                });
            } catch (error) {
                console.error("Could not load user", error);
                logout();
            }
        } else {
            setAuth({
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null
            });
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const login = async (email, password) => {
        const config = { headers: { 'Content-Type': 'application/json' } };
        const body = JSON.stringify({ email, password });

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', body, config);
            localStorage.setItem('token', res.data.token);
            loadUser();
        } catch (err) {
            console.error(err.response.data);
            throw err;
        }
    };

    const register = async ({ name, email, password }) => {
        const config = { headers: { 'Content-Type': 'application/json' } };
        const body = JSON.stringify({ name, email, password });

        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', body, config);
            localStorage.setItem('token', res.data.token);
            loadUser();
        } catch (err) {
            console.error(err.response.data);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setAuthToken(null);
        setAuth({
            token: null,
            isAuthenticated: false,
            loading: false,
            user: null
        });
    };

    return (
        <AuthContext.Provider value={{ auth, login, register, logout, loadUser }}>
            {!auth.loading && children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
