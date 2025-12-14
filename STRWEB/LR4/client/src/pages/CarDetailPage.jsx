import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import carService from '../services/carService';
import rentalService from '../services/rentalService';
import { AuthContext } from '../context/AuthContext';
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
                setError('Failed to fetch car details.');
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
            setBookingMessage('Please log in to book a car.');
            return;
        }
        if (!rentalDates.rentalDate || !rentalDates.returnDate) {
            setBookingMessage('Please select both rental and return dates.');
            return;
        }

        try {
            await rentalService.createRental({
                carId: car._id,
                rentalDate: rentalDates.rentalDate,
                returnDate: rentalDates.returnDate
            });
            setBookingMessage('Booking request sent! Awaiting admin approval.');
            setTimeout(() => navigate('/profile'), 2000); // Redirect after 2 seconds
        } catch (err) {
            setBookingMessage(err.response?.data?.msg || 'Failed to send booking request.');
            console.error(err);
        }
    };

    if (loading) return <p>Loading car details...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!car) return <p>Car not found.</p>;

    return (
        <div className="car-detail-page">
            <div className="car-detail-card">
                <img src={car.imageUrl || 'https://via.placeholder.com/600x400'} alt={`${car.brand} ${car.model}`} />
                <div className="car-info">
                    <h1>{car.brand} {car.model} ({car.year})</h1>
                    <p><strong>Category:</strong> {car.category}</p>
                    <p><strong>License Plate:</strong> {car.licensePlate}</p>
                    <p><strong>Daily Rate:</strong> ${car.dailyRate}</p>
                    <p><strong>Status:</strong> <span className={`status status-${car.status}`}>{car.status}</span></p>
                    {car.currentLocation && (
                        <p><strong>Location:</strong> {car.currentLocation.name} ({car.currentLocation.address})</p>
                    )}
                </div>
            </div>

            <div className="booking-section">
                <h2>Book this Car</h2>
                {!isAuthenticated && <p className="warning-message">You must be logged in to book a car.</p>}
                <form onSubmit={handleBookingSubmit}>
                    <div className="form-group">
                        <label htmlFor="rentalDate">Rental Date:</label>
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
                        <label htmlFor="returnDate">Return Date:</label>
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
                        {car.status !== 'available' ? 'Car Not Available' : 'Request Booking'}
                    </button>
                </form>
                {bookingMessage && <p className={`booking-message ${bookingMessage.includes('sent') ? 'success' : 'error'}`}>{bookingMessage}</p>}
            </div>
        </div>
    );
};

export default CarDetailPage;