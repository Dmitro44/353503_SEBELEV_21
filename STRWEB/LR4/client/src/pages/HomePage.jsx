import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import carService from '../services/carService';
import CarCard from '../components/CarCard';
import './HomePage.css';

const HomePage = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [order, setOrder] = useState('asc');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCars = async () => {
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

    const handleCarSelect = (carId) => {
        navigate(`/cars/${carId}`);
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
                <div className="filter-group">
                    <label htmlFor="category-select">Категория:</label>
                    <select id="category-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">Все</option>
                        <option value="Sedan">Седан</option>
                        <option value="SUV">Внедорожник</option>
                        <option value="Truck">Грузовик</option>
                        <option value="Van">Минивэн</option>
                        <option value="Luxury">Люкс</option>
                        <option value="Sport">Спорт</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="sort-select">Сортировка:</label>
                    <select id="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="">По умолчанию</option>
                        <option value="dailyRate">По цене</option>
                        <option value="year">По году</option>
                    </select>
                </div>
                {sortBy && (
                    <div className="filter-group">
                        <label htmlFor="order-select">Порядок:</label>
                        <select id="order-select" value={order} onChange={(e) => setOrder(e.target.value)}>
                            <option value="asc">По возрастанию</option>
                            <option value="desc">По убыванию</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="car-list">
                {cars.length === 0 ? (
                    <p>Автомобили, соответствующие вашим критериям, не найдены.</p>
                ) : (
                    cars.map(car => (
                        <CarCard 
                            key={car._id}
                            car={car}
                            onCarSelect={handleCarSelect}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default HomePage;
