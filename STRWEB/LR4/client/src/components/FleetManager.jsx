import React, { useState, useEffect } from 'react';
import carService from '../services/carService';
import rentalService from '../services/rentalService';
import { SERVER_URL } from '../config';
import CarFormModal from './CarFormModal';
import ContextMenu from './ContextMenu';
import ReturnFormModal from './ReturnFormModal';
import MaintenanceFormModal from './MaintenanceFormModal';
import DamageAssessFormModal from './DamageAssessFormModal';
import './FleetManager.css';
import './CarFormModal.css';
import './ContextMenu.css';

const FleetManager = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [modalState, setModalState] = useState({
        isCarFormOpen: false,
        isReturnOpen: false,
        isMaintenanceOpen: false,
        isDamageOpen: false,
    });
    const [editingCar, setEditingCar] = useState(null);
    const [selectedCar, setSelectedCar] = useState(null);

    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, selectedCar: null });

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

    const openModal = (modalName, car) => {
        setSelectedCar(car);
        setModalState(prev => ({ ...prev, [modalName]: true }));
    };

    const closeModal = (modalName) => {
        setModalState(prev => ({ ...prev, [modalName]: false }));
        setSelectedCar(null);
        setEditingCar(null);
    };

    const handleAddCar = () => {
        setEditingCar(null);
        openModal('isCarFormOpen');
    };

    const handleEditCar = (car) => {
        setEditingCar(car);
        openModal('isCarFormOpen', car);
    };

    const handleCarFormSubmit = async (formData, imageFile) => {
        const data = new FormData();
        for (const key in formData) {
            data.append(key, formData[key]);
        }
        if (imageFile) data.append('image', imageFile);

        try {
            if (editingCar) {
                await carService.updateCar(editingCar._id, data);
            } else {
                await carService.createCar(data);
            }
            fetchCars();
            closeModal('isCarFormOpen');
        } catch (err) {
            console.error('Ошибка при сохранении автомобиля:', err);
            alert(err.response?.data?.msg || 'Не удалось сохранить автомобиль.');
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

    const handleReturnSubmit = async (returnData) => {
        if (!selectedCar || !selectedCar.activeRentalId) return;
        try {
            await rentalService.completeRental(selectedCar.activeRentalId, {
                returnComments: returnData.comments,
            });
            fetchCars();
        } catch (err) {
            console.error('Ошибка при обработке возврата:', err);
            alert('Не удалось обработать возврат автомобиля.');
        }
        finally {
            closeModal('isReturnOpen');
        }
    };

    const handleMaintenanceSubmit = async (maintenanceData) => {
        if (!selectedCar) return;
        console.log(`Отправка на ТО автомобиля ${selectedCar._id} с заметкой: ${maintenanceData.notes}`);
        try {
            await carService.updateCar(selectedCar._id, { status: 'maintenance' });
            fetchCars();
        } catch (err) {
            console.error('Ошибка при отправке на обслуживание:', err);
            alert('Не удалось изменить статус автомобиля.');
        }
        finally {
            closeModal('isMaintenanceOpen');
        }
    };

    const handleDamageSubmit = (damageData) => {
        if (!selectedCar) return;
        console.log(`Зафиксированы повреждения для ${selectedCar.brand} (${selectedCar._id}):\n        Описание: ${damageData.description}\n        Стоимость: ${damageData.cost}`);
        alert('Отчет о повреждениях сохранен в консоли.');
        closeModal('isDamageOpen');
    };

    // --- Context Menu ---
    const handleContextMenu = (e, car) => {
        e.preventDefault();
        setContextMenu({ show: true, x: e.pageX, y: e.pageY, selectedCar: car });
    };
    const closeContextMenu = () => contextMenu.show && setContextMenu({ ...contextMenu, show: false });

    const translateStatus = (status) => {
        const map = { available: 'Доступен', rented: 'В аренде', maintenance: 'На обслуживании' };
        return map[status] || status;
    };

    if (loading) return <p>Загрузка автопарка...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="fleet-manager" onClick={closeContextMenu}>
            <h2>Управление автопарком</h2>
            <button onClick={handleAddCar} className="btn btn-primary add-car-btn">
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
                                <td><img src={`${SERVER_URL}${car.imageUrl}`} alt={`${car.brand} ${car.model}`} className="car-thumbnail" /></td>
                                <td>{car.brand} {car.model}</td>
                                <td>{car.year}</td>
                                <td>{car.licensePlate}</td>
                                <td>{translateStatus(car.status)}</td>
                                <td>${car.dailyRate}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button onClick={() => handleEditCar(car)} className="btn btn-secondary btn-sm">Изменить</button>
                                        <button onClick={() => handleDelete(car._id)} className="btn btn-danger btn-sm">Удалить</button>
                                        {car.status === 'rented' && (
                                            <button onClick={() => openModal('isReturnOpen', car)} className="btn btn-success btn-sm">Принять возврат</button>
                                        )}
                                        {car.status === 'available' && (
                                            <button onClick={() => openModal('isMaintenanceOpen', car)} className="btn btn-secondary btn-sm">На ТО</button>
                                        )}
                                        <button onClick={() => openModal('isDamageOpen', car)} className="btn btn-secondary btn-sm">Ущерб</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <CarFormModal 
                isOpen={modalState.isCarFormOpen}
                onClose={() => closeModal('isCarFormOpen')}
                onSubmit={handleCarFormSubmit} initialData={editingCar}
            />

            <ReturnFormModal
                isOpen={modalState.isReturnOpen}
                onClose={() => closeModal('isReturnOpen')}
                car={selectedCar} onSubmit={handleReturnSubmit}
            />

            <MaintenanceFormModal
                isOpen={modalState.isMaintenanceOpen}
                onClose={() => closeModal('isMaintenanceOpen')}
                car={selectedCar}
                onSubmit={handleMaintenanceSubmit}
            />

            <DamageAssessFormModal
                isOpen={modalState.isDamageOpen}
                onClose={() => closeModal('isDamageOpen')}
                car={selectedCar}
                onSubmit={handleDamageSubmit}
            />

            <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                show={contextMenu.show}
                onClose={closeContextMenu}
                actions={[
                    { label: 'Изменить', action: () => handleEditCar(contextMenu.selectedCar) },
                    { label: 'Удалить', action: () => handleDelete(contextMenu.selectedCar?._id) },
                    { label: 'Принять возврат', action: () => openModal('isReturnOpen', contextMenu.selectedCar), hidden: contextMenu.selectedCar?.status !== 'rented' },
                    { label: 'На ТО', action: () => openModal('isMaintenanceOpen', contextMenu.selectedCar), hidden: contextMenu.selectedCar?.status !== 'available' },
                    { label: 'Оценить ущерб', action: () => openModal('isDamageOpen', contextMenu.selectedCar) },
                ]}
            />
        </div>
    );
};

export default FleetManager;
