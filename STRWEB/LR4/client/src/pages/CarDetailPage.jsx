import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import carService from '../services/carService';
import rentalService from '../services/rentalService';
import { AuthContext } from '../context/AuthContext';
import { SERVER_URL } from '../config';
import './CarDetailPage.css';

const CarDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    const { isAuthenticated } = auth;

    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rentalDates, setRentalDates] = useState({
        rentalDate: '',
        returnDate: ''
    });
    const [bookingMessage, setBookingMessage] = useState('');

    useEffect(() => {
        const fetchCar = async () => {
            try {
                const response = await carService.getCarById(id);
                setCar(response.data);
            } catch (err) {
                setError('Не удалось загрузить информацию об автомобиле.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCar();
    }, [id]);

    const handleDateChange = e => {
        setRentalDates({ ...rentalDates, [e.target.name]: e.target.value });
    };

    const handleBookingSubmit = async e => {
        e.preventDefault();
        if (!isAuthenticated) {
            setBookingMessage('Пожалуйста, войдите, чтобы забронировать автомобиль.');
            return;
        }
        if (!rentalDates.rentalDate || !rentalDates.returnDate) {
            setBookingMessage('Пожалуйста, выберите дату начала и окончания аренды.');
            return;
        }

        try {
            await rentalService.createRental({
                carId: car._id,
                rentalDate: rentalDates.rentalDate,
                returnDate: rentalDates.returnDate
            });
            setBookingMessage('Запрос на бронирование отправлен! Ожидается подтверждение администратора.');
            setTimeout(() => navigate('/profile'), 2000); // Redirect after 2 seconds
        } catch (err) {
            setBookingMessage(err.response?.data?.msg || 'Не удалось отправить запрос на бронирование.');
            console.error(err);
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

    if (loading) return <p>Загрузка информации об автомобиле...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!car) return <p>Автомобиль не найден.</p>;

    return (
        <div className="car-detail-page">
            <div className="car-detail-card">
                <img src={`${SERVER_URL}${car.imageUrl}`} alt={`${car.brand} ${car.model}`} />
                <div className="car-info">
                    <h1>{car.brand} {car.model} ({car.year})</h1>
                    <p><strong>Категория:</strong> {car.category}</p>
                    <p><strong>Гос. номер:</strong> {car.licensePlate}</p>
                    <p><strong>Стоимость в день:</strong> ${car.dailyRate}</p>
                    <p><strong>Статус:</strong> <span className={`status status-${car.status}`}>{translateStatus(car.status)}</span></p>
                    {car.currentLocation && (
                        <p><strong>Местоположение:</strong> {car.currentLocation.name} ({car.currentLocation.address})</p>
                    )}
                </div>
            </div>

            <div className="booking-section">
                <h2>Забронировать этот автомобиль</h2>
                {!isAuthenticated && <p className="warning-message">Вы должны войти в систему, чтобы забронировать автомобиль.</p>}
                <form onSubmit={handleBookingSubmit}>
                    <div className="form-group">
                        <label htmlFor="rentalDate">Дата начала аренды:</label>
                        <input
                            type="date"
                            id="rentalDate"
                            name="rentalDate"
                            value={rentalDates.rentalDate}
                            onChange={handleDateChange}
                            min={new Date().toISOString().split('T')[0]}
                            required
                            disabled={!isAuthenticated || car.status !== 'available'}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="returnDate">Дата возврата:</label>
                        <input
                            type="date"
                            id="returnDate"
                            name="returnDate"
                            value={rentalDates.returnDate}
                            onChange={handleDateChange}
                            min={rentalDates.rentalDate || new Date().toISOString().split('T')[0]}
                            required
                            disabled={!isAuthenticated || car.status !== 'available'}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={!isAuthenticated || car.status !== 'available'}>
                        {car.status !== 'available' ? 'Автомобиль недоступен' : 'Отправить запрос'}
                    </button>
                </form>
                {bookingMessage && <p className={`booking-message ${bookingMessage.includes('sent') || bookingMessage.includes('отправлен') ? 'success' : 'error'}`}>{bookingMessage}</p>}
            </div>
        </div>
    );
};

export default CarDetailPage;