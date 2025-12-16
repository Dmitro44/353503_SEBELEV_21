import React, { useState, useEffect, useContext } from 'react';
import adminService from '../services/adminService';
import { AuthContext } from '../context/AuthContext';
import DateDisplay from '../components/DateDisplay';
import '../components/DateDisplay.css';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { auth } = useContext(AuthContext);

    const fetchPendingRentals = async () => {
        try {
            const response = await adminService.getPendingRentals();
            setRentals(response.data);
        } catch (err) {
            setError('Не удалось загрузить ожидающие запросы.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth.user?.role === 'admin') {
            fetchPendingRentals();
        } else {
            setLoading(false);
        }
    }, [auth.user]);

    const handleApprove = async (id) => {
        try {
            await adminService.approveRental(id);
            // Refresh the list after approval
            fetchPendingRentals();
        } catch (err) {
            console.error('Не удалось одобрить аренду', err);
            alert(err.response?.data?.msg || 'Не удалось одобрить аренду');
        }
    };

    const handleReject = async (id) => {
        try {
            await adminService.rejectRental(id);
            // Refresh the list after rejection
            fetchPendingRentals();
        } catch (err) {
            console.error('Не удалось отклонить аренду', err);
        }
    };

    if (auth.loading) {
        return <p className="text-center">Загрузка...</p>;
    }

    if (auth.user?.role !== 'admin') {
        return <p className="error-message text-center">Доступ запрещен. Требуются права администратора.</p>;
    }

    if (loading) return <p className="text-center">Загрузка ожидающих запросов...</p>;
    if (error) return <p className="error-message text-center">{error}</p>;

    return (
        <div className="admin-dashboard">
            <h1>Панель администратора: Ожидающие подтверждения</h1>
            {rentals.length === 0 ? (
                <p className="text-center">В настоящее время нет запросов, ожидающих подтверждения.</p>
            ) : (
                <div className="table-responsive">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Пользователь</th>
                                <th>Автомобиль</th>
                                <th>Запрос создан</th>
                                <th>Дата начала</th>
                                <th>Дата возврата</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rentals.map(rental => (
                                <tr key={rental._id}>
                                    <td>{rental.user.name} ({rental.user.email})</td>
                                    <td>{rental.car.brand} {rental.car.model}</td>
                                    <td><DateDisplay date={rental.createdAt} /></td>
                                    <td><DateDisplay date={rental.rentalDate} showTime={false} /></td>
                                    <td><DateDisplay date={rental.returnDate} showTime={false} /></td>
                                    <td className="actions">
                                        <button onClick={() => handleApprove(rental._id)} className="btn btn-success">Одобрить</button>
                                        <button onClick={() => handleReject(rental._id)} className="btn btn-danger">Отклонить</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;
