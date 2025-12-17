import React, { useState, useEffect } from 'react';
import carService from '../services/carService';
import { SERVER_URL } from '../config';
import CarFormModal from './CarFormModal';
import ContextMenu from './ContextMenu';
import './FleetManager.css';
import './CarFormModal.css';
import './ContextMenu.css';

const FleetManager = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCar, setEditingCar] = useState(null);

    const [contextMenu, setContextMenu] = useState({
        show: false,
        x: 0,
        y: 0,
        selectedCar: null,
    });

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

    const handleFormSubmit = async (formData, imageFile) => {
        try {
            const data = new FormData();
            for (const key in formData) {
                data.append(key, formData[key]);
            }
            if (imageFile) {
                data.append('image', imageFile);
            }
            if (editingCar) {
                await carService.updateCar(editingCar._id, data);
            } else {
                await carService.createCar(data);
            }
            fetchCars();
            handleCloseModal();
        } catch (err) {
            console.error('Ошибка при сохранении автомобиля:', err);
            const errorMsg = err.response?.data?.msg || 'Не удалось сохранить автомобиль.';
            alert(errorMsg);
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

    const handleContextMenu = (e, car) => {
        e.preventDefault();
        setContextMenu({
            show: true,
            x: e.pageX,
            y: e.pageY,
            selectedCar: car,
        });
    };

    const handleCloseContextMenu = () => {
        if (contextMenu.show) {
            setContextMenu({ ...contextMenu, show: false });
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
        <div className="fleet-manager" onClick={handleCloseContextMenu}>
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
                            <tr key={car._id} onContextMenu={(e) => handleContextMenu(e, car)}>
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

            <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                show={contextMenu.show}
                onClose={handleCloseContextMenu}
                onEdit={() => {
                    if (contextMenu.selectedCar) {
                        handleEdit(contextMenu.selectedCar);
                    }
                    handleCloseContextMenu();
                }}
                onDelete={() => {
                    if (contextMenu.selectedCar) {
                        handleDelete(contextMenu.selectedCar._id);
                    }
                    handleCloseContextMenu();
                }}
            />
        </div>
    );
};

export default FleetManager;
