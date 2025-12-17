import React, { useState, useEffect } from 'react';
import './CarFormModal.css';

const CarFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({});
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    brand: '', model: '', year: '', licensePlate: '',
                    category: 'Sedan', dailyRate: '', status: 'available', imageUrl: ''
                });
            }
            setImageFile(null);
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        // Функция очистки для удаления обработчика
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [initialData, isOpen, onClose]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setImageFile(files[0]);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData, imageFile);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>{initialData ? 'Редактировать автомобиль' : 'Добавить новый автомобиль'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Марка</label>
                        <input type="text" name="brand" value={formData.brand || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Модель</label>
                        <input type="text" name="model" value={formData.model || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Год</label>
                        <input type="number" name="year" value={formData.year || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Гос. номер</label>
                        <input type="text" name="licensePlate" value={formData.licensePlate || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Категория</label>
                        <select name="category" value={formData.category || 'Sedan'} onChange={handleChange}>
                            <option value="Sedan">Седан</option>
                            <option value="Truck">Грузовик</option>
                            <option value="Van">Фургон</option>
                            <option value="SUV">Внедорожник</option>
                            <option value="Luxury">Люкс</option>
                            <option value="Sport">Спорт</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Цена в день ($)</label>
                        <input type="number" name="dailyRate" value={formData.dailyRate || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Статус</label>
                        <select name="status" value={formData.status || 'available'} onChange={handleChange}>
                            <option value="available">Доступен</option>
                            <option value="rented">В аренде</option>
                            <option value="maintenance">На обслуживании</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Изображение</label>
                        <input type="file" name="image" onChange={handleChange} accept="image/*" />
                        {initialData && !imageFile && (
                            <p className="current-image-text">Текущее изображение: {initialData.imageUrl}</p>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button type="submit" className="btn btn-primary">{initialData ? 'Сохранить' : 'Создать'}</button>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Отмена</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CarFormModal;
