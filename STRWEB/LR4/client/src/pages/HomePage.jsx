import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import carService from '../services/carService';
import './HomePage.css'; // For styling the car catalog

const HomePage = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true); // For initial page load
    const [isSearching, setIsSearching] = useState(false); // For subsequent searches
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [order, setOrder] = useState('asc');

    useEffect(() => {
        const fetchCars = async () => {
            // Don't use the main loader for subsequent searches
            if (!loading) {
                setIsSearching(true);
            }
            try {
                const params = { search, category, sortBy, order };
                const response = await carService.getAllCars(params);
                setCars(response.data);
            } catch (err) {
                setError('Failed to fetch cars.');
                console.error(err);
            } finally {
                setLoading(false);
                setIsSearching(false);
            }
        };
        fetchCars();
    }, [search, category, sortBy, order]);

    if (loading) return <p>Loading cars...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="home-page">
            <h1>Car Catalog</h1>

            <div className="filters-sort-search">
                <input
                    type="text"
                    placeholder="Search by brand or model..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Sport">Sport</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="">Sort By</option>
                    <option value="dailyRate">Daily Rate</option>
                    <option value="year">Year</option>
                </select>
                {sortBy && (
                    <select value={order} onChange={(e) => setOrder(e.target.value)}>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                )}
            </div>

            <div className="car-list">
                {cars.length === 0 ? (
                    <p>No cars found matching your criteria.</p>
                ) : (
                    cars.map(car => (
                        <div key={car._id} className="car-card">
                            <img src={car.imageUrl || 'https://via.placeholder.com/300'} alt={`${car.brand} ${car.model}`} />
                            <h2>{car.brand} {car.model} ({car.year})</h2>
                            <p>Category: {car.category}</p>
                            <p>Daily Rate: ${car.dailyRate}</p>
                            <p>Status: {car.status}</p>
                            <Link to={`/cars/${car._id}`} className="btn btn-primary">View Details</Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HomePage;
