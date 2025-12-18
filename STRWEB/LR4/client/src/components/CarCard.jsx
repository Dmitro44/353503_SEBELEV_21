import { SERVER_URL } from '../config';
import './CarCard.css';

const CarCard = ({ car, onCarSelect }) => {
    const translateStatus = (status) => {
        switch (status) {
            case 'available': return 'Доступен';
            case 'rented': return 'В аренде';
            case 'maintenance': return 'На обслуживании';
            default: return status;
        }
    };

    return (
        <div 
            className="car-card"
            onDoubleClick={() => onCarSelect(car._id)}
        >
            <img src={`${SERVER_URL}${car.imageUrl}`} alt={`${car.brand} ${car.model}`} />
            <div className="car-card-content">
                <div>
                    <h2>{car.brand} {car.model} ({car.year})</h2>
                    <p>Категория: {car.category}</p>
                    <p>Стоимость в день: ${car.dailyRate}</p>
                    <p>Статус: <span className={`status-${car.status}`}>{translateStatus(car.status)}</span></p>
                </div>
                <button onClick={() => onCarSelect(car._id)} className="btn btn-primary">Подробнее</button>
            </div>
        </div>
    );
};

export default CarCard;
