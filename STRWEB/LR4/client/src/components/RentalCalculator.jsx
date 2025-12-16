const RentalCalculator = ({ dailyRate, rentalDate, returnDate}) => {
    if (!dailyRate || !rentalDate || !returnDate){
        return <p> Выберите даты аренды для расчета стоимости</p>;
    }

    const start = new Date(rentalDate);
    const end = new Date(returnDate);

    if (end < start){
        return <p className="error-message">Дата возврата не может быть раньше даты аренды</p>;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    const finalDiffDays = diffDays === 0 ? 1 : diffDays;

    const totalCost = dailyRate * finalDiffDays;

    return (
        <div className="rental-calculator">
            <h3>Расчет стоимости аренды</h3>
            <p>Дней аренды: <strong>{finalDiffDays}</strong></p>
            <p>Стоимость в день: <strong>${dailyRate}</strong></p>
            <p>Общая стоимость: <strong>${totalCost}</strong></p>
        </div>
    );
};

export default RentalCalculator;
