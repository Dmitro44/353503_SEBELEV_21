import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Уведомление исчезнет через 3 секунды

        return () => {
            clearTimeout(timer);
        };
    }, [onClose]);

    return (
        <div className="toast-notification">
            {message}
        </div>
    );
};

export default Toast;
