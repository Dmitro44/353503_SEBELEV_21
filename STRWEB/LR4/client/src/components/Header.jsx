import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Header.css';

const Header = () => {
    const { auth, logout } = useContext(AuthContext);
    const { isAuthenticated } = auth;

    const authLinks = (
        <ul>
            <li><Link to="/profile">Profile</Link></li>
            <li><a onClick={logout} href="#!">Logout</a></li>
        </ul>
    );

    const guestLinks = (
        <ul>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
        </ul>
    );

    return (
        <header className="header">
            <div className="logo">
                <Link to="/">CarRental</Link>
            </div>
            <nav>
                <ul>
                    <li><Link to="/">Catalog</Link></li>
                </ul>
                {isAuthenticated ? authLinks : guestLinks}
            </nav>
        </header>
    );
};

export default Header;
