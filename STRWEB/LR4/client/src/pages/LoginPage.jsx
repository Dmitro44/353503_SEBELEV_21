import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { SERVER_URL } from '../config';
import './Form.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const { login, loadUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState(null);

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setLoginError(null);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setLoginError(err.response?.data?.msg || 'Ошибка входа');
        }
    };

    const handleGoogleSuccess = async (response) => {
        setLoginError(null);
        try {
            const res = await axios.post(`${SERVER_URL}/api/auth/google`, { idToken: response.credential });
            localStorage.setItem('token', res.data.token);
            loadUser(); // Correctly call loadUser from context
            navigate('/');
        } catch (err) {
            setLoginError(err.response?.data?.msg || 'Ошибка входа через Google');
            console.error('Google login error:', err);
        }
    };

    const handleGoogleError = () => {
        setLoginError('Вход через Google не удался.');
        console.log('Google Login Failed');
    };

    return (
        <div className="form-container">
            <h1>Вход</h1>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Пароль</label>
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Войти</button>
            </form>
            {loginError && <p className="error-message text-center">{loginError}</p>}
            <div className="google-login-section">
                <p>Или войдите через Google:</p>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                />
            </div>
        </div>
    );
};

export default LoginPage;