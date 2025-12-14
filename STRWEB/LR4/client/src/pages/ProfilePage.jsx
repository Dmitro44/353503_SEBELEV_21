import React, { useState, useEffect, useContext } from 'react';
import rentalService from '../services/rentalService';
import { AuthContext } from '../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        if (auth.isAuthenticated) {
            const fetchRentals = async () => {
                try {
                    const response = await rentalService.getMyRentals();
                    setRentals(response.data);
                } catch (err) {
                    setError('Не удалось загрузить историю аренды.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchRentals();
        } else {
            setLoading(false);
        }
    }, [auth.isAuthenticated]);

    const translateStatus = (status) => {
        const statusMap = {
            'pending_approval': 'Ожидает подтверждения',
            'active': 'Активна',
            'completed': 'Завершена',
            'cancelled': 'Отменена',
            'rejected': 'Отклонена'
        };
        return statusMap[status] || status;
    };

    if (!auth.isAuthenticated && !auth.loading) {
        return <p className="text-center">Пожалуйста, войдите, чтобы просмотреть свой профиль.</p>;
    }

    if (loading) return <p className="text-center">Загрузка профиля...</p>;
    if (error) return <p className="error-message text-center">{error}</p>;

    return (
        <div className="profile-page">
            <h1>Моя история аренды</h1>
            {rentals.length === 0 ? (
                <p className="text-center">У вас нет истории аренды.</p>
            ) : (
                <div className="rental-list">
                    {rentals.map(rental => (
                        <div key={rental._id} className="rental-card">
                            <div className="rental-card-header">
                                <h3>{rental.car.brand} {rental.car.model}</h3>
                                <span className={`status status-${rental.status.replace('_', '-')}`}>{translateStatus(rental.status)}</span>
                            </div>
                            <div className="rental-card-body">
                                <p><strong>Дата аренды:</strong> {new Date(rental.rentalDate).toLocaleDateString()}</p>
                                <p><strong>Дата возврата:</strong> {new Date(rental.returnDate).toLocaleDateString()}</p>
                                <p><strong>Итоговая стоимость:</strong> ${rental.totalCost}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProfilePage;