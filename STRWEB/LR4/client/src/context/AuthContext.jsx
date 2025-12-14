import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        token: localStorage.getItem('token'),
        isAuthenticated: null,
        loading: true,
        user: null
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
            // Here you would typically have an endpoint to get user data from token
            // For now, we'll just assume the token is valid if it exists
            setAuth({
                token,
                isAuthenticated: true,
                loading: false,
                user: { role: 'customer' } // Placeholder, should be fetched from server
            });
        } else {
            setAuth({
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null
            });
        }
    }, []);

    const login = async (email, password) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const body = JSON.stringify({ email, password });

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', body, config);
            localStorage.setItem('token', res.data.token);
            axios.defaults.headers.common['x-auth-token'] = res.data.token;
            setAuth({
                ...auth,
                token: res.data.token,
                isAuthenticated: true,
                loading: false,
            });
        } catch (err) {
            console.error(err.response.data);
            // Handle error (e.g., show alert)
        }
    };

    const register = async ({ name, email, password }) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const body = JSON.stringify({ name, email, password });

        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', body, config);
            localStorage.setItem('token', res.data.token);
            axios.defaults.headers.common['x-auth-token'] = res.data.token;
            setAuth({
                ...auth,
                token: res.data.token,
                isAuthenticated: true,
                loading: false,
            });
        } catch (err) {
            console.error(err.response.data);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        setAuth({
            token: null,
            isAuthenticated: false,
            loading: false,
            user: null
        });
    };

    return (
        <AuthContext.Provider value={{ auth, login, register, logout }}>
            {!auth.loading && children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
