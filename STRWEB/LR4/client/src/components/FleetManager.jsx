import React, { useState, useEffect } from 'react';
import carService from '../services/carService';
import { SERVER_URL } from '../config';
import CarFormModal from './CarFormModal';
import './FleetManager.css';
import './CarFormModal.css';

const FleetManager = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCar, setEditingCar] = useState(null);

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            setLoading(true);
            const response = await carService.getAllCars({});
            setCars(response.data);
            setError(null);
        } catch (err) {
            setError('Не удалось загрузить список автомобилей.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCar(null);
    };

    const handleAdd = () => {
        setEditingCar(null);
        setIsModalOpen(true);
    };

    const handleEdit = (car) => {
        setEditingCar(car);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (editingCar) {
                await carService.updateCar(editingCar._id, formData);
            } else {
                await carService.createCar(formData);
            }
            fetchCars();
            handleCloseModal();
        } catch (err) {
            console.error('Ошибка при сохранении автомобиля:', err);
            alert('Не удалось сохранить автомобиль.');
        }
    };

    const handleDelete = async (carId) => {
        if (window.confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
            try {
                await carService.deleteCar(carId);
                fetchCars();
            } catch (err) {
                console.error('Ошибка при удалении автомобиля:', err);
                alert('Не удалось удалить автомобиль.');
            }
        }
    };

    const translateStatus = (status) => {
        switch (status) {
            case 'available': return 'Доступен';
            case 'rented': return 'В аренде';
            case 'maintenance': return 'На обслуживании';
            default: return status;
        }
    };

    if (loading) return <p>Загрузка автопарка...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="fleet-manager">
            <h2>Управление автопарком</h2>
            <button onClick={handleAdd} className="btn btn-primary add-car-btn">
                Добавить новый автомобиль
            </button>
            <div className="fleet-table-container">
                <table className="fleet-table">
                    <thead>
                        <tr>
                            <th>Фото</th>
                            <th>Марка и модель</th>
                            <th>Год</th>
                            <th>Гос. номер</th>
                            <th>Статус</th>
                            <th>Цена в день</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cars.map(car => (
                            <tr key={car._id}>
                                <td>
                                    <img
                                        src={`${SERVER_URL}${car.imageUrl}`}
                                        alt={`${car.brand} ${car.model}`}
                                        className="car-thumbnail"
                                    />
                                </td>
                                <td>{car.brand} {car.model}</td>
                                <td>{car.year}</td>
                                <td>{car.licensePlate}</td>
                                <td>{translateStatus(car.status)}</td>
                                <td>${car.dailyRate}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button onClick={() => handleEdit(car)} className="btn btn-secondary btn-sm">
                                            Изменить
                                        </button>
                                        <button onClick={() => handleDelete(car._id)} className="btn btn-danger btn-sm">
                                            Удалить
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <CarFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleFormSubmit}
                initialData={editingCar}
            />
        </div>
    );
};

export default FleetManager;
