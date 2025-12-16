import React, { useState, useEffect, useContext } from 'react';
import rentalService from '../services/rentalService';
import { AuthContext } from '../context/AuthContext';
import DateDisplay from '../components/DateDisplay';
import '../components/DateDisplay.css';
import './ProfilePage.css';

const ProfilePage = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { auth } = useContext(AuthContext);
    const { user } = auth;

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
            <h1>Профиль</h1>
            {user && (
                <div className="user-info-section">
                    <p><strong>Имя:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Роль:</strong> {user.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
                    <DateDisplay date={new Date()} label="Текущая дата" />
                </div>
            )}

            <h2>История аренды</h2>
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
                                <DateDisplay date={rental.rentalDate} label="Дата аренды" showTime={false} />
                                <DateDisplay date={rental.returnDate} label="Дата возврата" showTime={false} />
                                <p><strong>Итоговая стоимость:</strong> ${rental.totalCost}</p>
                                <hr />
                                <DateDisplay date={rental.createdAt} label="Запрос создан" />
                                <DateDisplay date={rental.updatedAt} label="Последнее обновление" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
