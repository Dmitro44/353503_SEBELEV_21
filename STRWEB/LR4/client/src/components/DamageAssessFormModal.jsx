import React, { useState, useEffect } from 'react';

const DamageAssessFormModal = ({ isOpen, onClose, car, onSubmit }) => {
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState('');

    useEffect(() => {
        if (isOpen) {
            setDescription('');
            setCost('');
        }
    }, [isOpen]);

    if (!isOpen || !car) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ description, cost: parseFloat(cost) || 0 });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Оценка ущерба: {car.brand} {car.model}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="description">Описание повреждений:</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="4"
                            style={{ width: '100%' }}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="cost">Оценочная стоимость ремонта ($):</label>
                        <input
                            type="number"
                            id="cost"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            min="0"
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn btn-danger">Сохранить отчет</button>
                        <button type="button" onClick={onClose} className="btn btn-secondary">Отмена</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DamageAssessFormModal;
