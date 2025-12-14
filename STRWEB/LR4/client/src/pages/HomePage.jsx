import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import carService from '../services/carService';
import { SERVER_URL } from '../config';
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
                setError('Не удалось загрузить автомобили.');
                console.error(err);
            } finally {
                setLoading(false);
                setIsSearching(false);
            }
        };
        fetchCars();
    }, [search, category, sortBy, order]);

    const translateStatus = (status) => {
        switch (status) {
            case 'available': return 'Доступен';
            case 'rented': return 'В аренде';
            case 'maintenance': return 'На обслуживании';
            default: return status;
        }
    };

    if (loading) return <p>Загрузка автомобилей...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="home-page">
            <h1>Каталог автомобилей</h1>

            <div className="filters-sort-search">
                <input
                    type="text"
                    placeholder="Поиск по марке или модели..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Все категории</option>
                    <option value="Sedan">Седан</option>
                    <option value="SUV">Внедорожник</option>
                    <option value="Truck">Грузовик</option>
                    <option value="Van">Минивэн</option>
                    <option value="Luxury">Люкс</option>
                    <option value="Sport">Спорт</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="">Сортировать по</option>
                    <option value="dailyRate">Стоимость в день</option>
                    <option value="year">Год выпуска</option>
                </select>
                {sortBy && (
                    <select value={order} onChange={(e) => setOrder(e.target.value)}>
                        <option value="asc">По возрастанию</option>
                        <option value="desc">По убыванию</option>
                    </select>
                )}
            </div>

            <div className="car-list">
                {cars.length === 0 ? (
                    <p>Автомобили, соответствующие вашим критериям, не найдены.</p>
                ) : (
                    cars.map(car => (
                        <div key={car._id} className="car-card">
                            <img src={`${SERVER_URL}${car.imageUrl}`} alt={`${car.brand} ${car.model}`} />
                            <h2>{car.brand} {car.model} ({car.year})</h2>
                            <p>Категория: {car.category}</p>
                            <p>Стоимость в день: ${car.dailyRate}</p>
                            <p>Статус: {translateStatus(car.status)}</p>
                            <Link to={`/cars/${car._id}`} className="btn btn-primary">Подробнее</Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HomePage;
