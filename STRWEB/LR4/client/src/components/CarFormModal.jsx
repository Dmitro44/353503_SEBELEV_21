import React, { useState, useEffect, useRef } from 'react';
import './CarFormModal.css';

const CarFormModal = ({ isOpen, onClose, onSubmit, initialData, onKeyDown }) => {
    const [formData, setFormData] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [errors, setErrors] = useState({});
    const modalRef = useRef(null);

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
            setErrors({});

            if (modalRef.current) {
                modalRef.current.focus();
            }
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setImageFile(files[0]);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        const currentYear = new Date().getFullYear();

        if (!formData.brand) newErrors.brand = 'Марка обязательна';
        if (!formData.model) newErrors.model = 'Модель обязательна';
        
        if (!formData.year) {
            newErrors.year = 'Год обязателен';
        } else if (isNaN(formData.year) || formData.year < 1900 || formData.year > currentYear + 1) {
            newErrors.year = `Некорректный год (1900 - ${currentYear + 1})`;
        }
        
        if (!formData.licensePlate) {
            newErrors.licensePlate = 'Гос. номер обязателен';
        } else if (!/^[АВЕКМНОРСТУХABEKMHOPCTYX]\d{3}(?<!000)[АВЕКМНОРСТУХABEKMHOPCTYX]{2}\d{2,3}$/i.test(formData.licensePlate)) {
            newErrors.licensePlate = 'Некорректный формат гос. номера (например, А123ВВ77)';
        }
        
        if (!formData.dailyRate) {
            newErrors.dailyRate = 'Цена в день обязательна';
        } else if (isNaN(formData.dailyRate) || parseFloat(formData.dailyRate) <= 0) {
            newErrors.dailyRate = 'Цена должна быть положительным числом';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData, imageFile);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose} onKeyDown={onKeyDown} tabIndex={-1} ref={modalRef}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>{initialData ? 'Редактировать автомобиль' : 'Добавить новый автомобиль'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Марка</label>
                        <input type="text" name="brand" value={formData.brand || ''} onChange={handleChange} required />
                        {errors.brand && <p className="error-message">{errors.brand}</p>}
                    </div>
                    <div className="form-group">
                        <label>Модель</label>
                        <input type="text" name="model" value={formData.model || ''} onChange={handleChange} required />
                        {errors.model && <p className="error-message">{errors.model}</p>}
                    </div>
                    <div className="form-group">
                        <label>Год</label>
                        <input type="number" name="year" value={formData.year || ''} onChange={handleChange} required />
                        {errors.year && <p className="error-message">{errors.year}</p>}
                    </div>
                    <div className="form-group">
                        <label>Гос. номер</label>
                        <input type="text" name="licensePlate" value={formData.licensePlate || ''} onChange={handleChange} required />
                        {errors.licensePlate && <p className="error-message">{errors.licensePlate}</p>}
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
                        {errors.dailyRate && <p className="error-message">{errors.dailyRate}</p>}
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
