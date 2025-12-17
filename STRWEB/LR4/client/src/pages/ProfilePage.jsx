import React, { useState, useEffect, useContext } from 'react';
import rentalService from '../services/rentalService';
import { AuthContext } from '../context/AuthContext';
import DateDisplay from '../components/DateDisplay';
import DocumentVerifier from '../components/DocumentVerifier';
import Toast from '../components/Toast';
import '../components/DateDisplay.css';
import '../components/DocumentVerifier.css';
import '../components/Toast.css';
import './ProfilePage.css';

const ProfilePage = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { auth, loadUser } = useContext(AuthContext);
    const { user } = auth;

    const [isVerified, setIsVerified] = useState(user?.isVerified || false);
    
    const [toastInfo, setToastInfo] = useState({ show: false, message: '' });

    useEffect(() => {
        if (user) {
            setIsVerified(user.isVerified);
        }
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
    }, [auth.isAuthenticated, user]);

    useEffect(() => {
        const twoHours = 2 * 60 * 60 * 1000;
        const timeoutIds = [];

        rentals.forEach(rental => {
            if (rental.status === 'active') {
                const returnDate = new Date(rental.returnDate);
                const now = new Date();
                const timeUntilReturn = returnDate.getTime() - now.getTime();

                if (timeUntilReturn < 0) {
                    setToastInfo({ show: true, message: `Вы просрочили возврат ${rental.car.brand} ${rental.car.model}!` });
                } else if (timeUntilReturn <= twoHours) {
                    setToastInfo({ show: true, message: `Не забудьте вернуть ${rental.car.brand} ${rental.car.model}!` });
                } else {
                    const timeoutId = setTimeout(() => {
                        setToastInfo({ show: true, message: `Через 2 часа необходимо вернуть ${rental.car.brand} ${rental.car.model}.` });
                    }, timeUntilReturn - twoHours);
                    timeoutIds.push(timeoutId);
                }
            }
        });

        return () => {
            timeoutIds.forEach(id => clearTimeout(id));
        };
    }, [rentals]);

    const handleVerificationSuccess = () => {
        setIsVerified(true);
        loadUser();
    };

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
            {toastInfo.show && <Toast message={toastInfo.message} onClose={() => setToastInfo({ show: false, message: '' })} />}
            <h1>Профиль</h1>
            {user && (
                <div className="user-info-section">
                    <p><strong>Имя:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Роль:</strong> {user.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
                    <p><strong>Статус верификации:</strong> {isVerified ? <span className="verified">Подтвержден</span> : <span className="not-verified">Не подтвержден</span>}</p>
                    <DateDisplay date={new Date()} label="Текущая дата:" />
                </div>
            )}

            {!isVerified && user?.role !== 'admin' && (
                <DocumentVerifier onVerified={handleVerificationSuccess} />
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
