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
                    setError('Failed to fetch rental history.');
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

    if (!auth.isAuthenticated && !auth.loading) {
        return <p className="text-center">Please log in to view your profile.</p>;
    }

    if (loading) return <p className="text-center">Loading profile...</p>;
    if (error) return <p className="error-message text-center">{error}</p>;

    return (
        <div className="profile-page">
            <h1>My Rental History</h1>
            {rentals.length === 0 ? (
                <p className="text-center">You have no rental history.</p>
            ) : (
                <div className="rental-list">
                    {rentals.map(rental => (
                        <div key={rental._id} className="rental-card">
                            <div className="rental-card-header">
                                <h3>{rental.car.brand} {rental.car.model}</h3>
                                <span className={`status status-${rental.status.replace('_', '-')}`}>{rental.status.replace('_', ' ')}</span>
                            </div>
                            <div className="rental-card-body">
                                <p><strong>Rental Date:</strong> {new Date(rental.rentalDate).toLocaleDateString()}</p>
                                <p><strong>Return Date:</strong> {new Date(rental.returnDate).toLocaleDateString()}</p>
                                <p><strong>Total Cost:</strong> ${rental.totalCost}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProfilePage;