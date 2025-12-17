import React from 'react';
import './ContextMenu.css';

const ContextMenu = ({ x, y, show, onEdit, onDelete, onClose }) => {
    if (!show) {
        return null;
    }

    const style = {
        top: y,
        left: x,
    };

    return (
        <div className="context-menu-overlay" onClick={onClose}>
            <div className="context-menu" style={style}>
                <ul>
                    <li onClick={onEdit}>Изменить</li>
                    <li onClick={onDelete}>Удалить</li>
                </ul>
            </div>
        </div>
    );
};

export default ContextMenu;
