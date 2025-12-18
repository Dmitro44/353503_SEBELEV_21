import React from 'react';

const ContextMenu = ({ x, y, show, onClose, actions = [] }) => {
    if (!show) {
        return null;
    }

    const handleActionClick = (action) => {
        action();
        onClose();
    };

    return (
        <div className="context-menu" style={{ top: y, left: x }} onClick={(e) => e.stopPropagation()}>
            <ul>
                {actions.map((item, index) => (
                    !item.hidden && (
                        <li key={index} onClick={() => handleActionClick(item.action)}>
                            {item.label}
                        </li>
                    )
                ))}
            </ul>
        </div>
    );
};

export default ContextMenu;
