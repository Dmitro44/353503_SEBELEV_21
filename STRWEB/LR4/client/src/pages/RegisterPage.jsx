import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Form.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password2: ''
    });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const { name, email, password, password2 } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (password !== password2) {
            alert('Пароли не совпадают');
        } else {
            await register({ name, email, password });
            navigate('/');
        }
    };

    return (
        <div className="form-container">
            <h1>Регистрация</h1>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Имя</label>
                    <input type="text" name="name" value={name} onChange={onChange} required />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={email} onChange={onChange} required />
                </div>
                <div className="form-group">
                    <label>Пароль</label>
                    <input type="password" name="password" value={password} onChange={onChange} required minLength="6" />
                </div>
                <div className="form-group">
                    <label>Подтвердите пароль</label>
                    <input type="password" name="password2" value={password2} onChange={onChange} required minLength="6" />
                </div>
                <button type="submit" className="btn btn-primary">Зарегистрироваться</button>
            </form>
        </div>
    );
};

export default RegisterPage;