import React, { useState, useEffect } from 'react';

const ReturnFormModal = ({ isOpen, onClose, car, onSubmit }) => {
    const [comments, setComments] = useState('');

    useEffect(() => {
        if (isOpen) {
            setComments(''); // Сбрасываем комментарии при каждом открытии
        }
    }, [isOpen]);

    if (!isOpen || !car) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ comments });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Принять возврат: {car.brand} {car.model}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="comments">Комментарии по состоянию автомобиля:</label>
                        <textarea
                            id="comments"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            rows="4"
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn btn-success">Подтвердить возврат</button>
                        <button type="button" onClick={onClose} className="btn btn-secondary">Отмена</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReturnFormModal;
