import React, { useState, useEffect } from 'react';

const MaintenanceFormModal = ({ isOpen, onClose, car, onSubmit }) => {
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            setNotes('');
        }
    }, [isOpen]);

    if (!isOpen || !car) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ notes });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Отправить на ТО: {car.brand} {car.model}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="notes">Причина или заметки по обслуживанию:</label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="4"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn btn-warning">Отправить на ТО</button>
                        <button type="button" onClick={onClose} className="btn btn-secondary">Отмена</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MaintenanceFormModal;
