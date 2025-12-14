import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Header.css';

const Header = () => {
    const { auth, logout } = useContext(AuthContext);
    const { isAuthenticated, user } = auth;

    const authLinks = (
        <ul>
            {user?.role === 'admin' && <li><Link to="/admin">Админ</Link></li>}
            <li><Link to="/profile">Профиль</Link></li>
            <li><a onClick={logout} href="#!">Выйти</a></li>
        </ul>
    );

    const guestLinks = (
        <ul>
            <li><Link to="/login">Войти</Link></li>
            <li><Link to="/register">Регистрация</Link></li>
        </ul>
    );

    return (
        <header className="header">
            <div className="logo">
                <Link to="/">АвтоПрокат</Link>
            </div>
            <nav>
                <ul>
                    <li><Link to="/">Каталог</Link></li>
                </ul>
                {isAuthenticated ? authLinks : guestLinks}
            </nav>
        </header>
    );
};

export default Header;
