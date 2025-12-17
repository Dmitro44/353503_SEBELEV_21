import React, { Component } from 'react';

class RentalCalculator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            displayDays: 0,
            displayCost: 0,
        };
        this.animationInterval = null;
    }

    calculateValues(props) {
        const { dailyRate, rentalDate, returnDate } = props;
        if (!dailyRate || !rentalDate || !returnDate) {
            return { days: 0, cost: 0, error: true };
        }

        const start = new Date(rentalDate);
        const end = new Date(returnDate);

        if (end < start) {
            return { days: 0, cost: 0, error: true };
        }

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
        const finalDiffDays = diffDays === 0 ? 1 : diffDays;
        const totalCost = dailyRate * finalDiffDays;

        return { days: finalDiffDays, cost: totalCost, error: false };
    }

    animateState(targetDays, targetCost) {
        clearInterval(this.animationInterval);

        this.animationInterval = setInterval(() => {
            const { displayDays, displayCost } = this.state;
            let nextDays = displayDays;
            let nextCost = displayCost;
            let isAnimating = false;

            if (displayDays < targetDays) {
                nextDays += 1;
                isAnimating = true;
            } else if (displayDays > targetDays) {
                nextDays -= 1;
                isAnimating = true;
            }

            const step = Math.ceil(Math.abs(targetCost - displayCost) / 10);
            if (displayCost < targetCost) {
                nextCost = Math.min(displayCost + step, targetCost);
                isAnimating = true;
            } else if (displayCost > targetCost) {
                nextCost = Math.max(displayCost - step, targetCost);
                isAnimating = true;
            }

            if (isAnimating) {
                this.setState({ displayDays: nextDays, displayCost: nextCost });
            } else {
                clearInterval(this.animationInterval);
            }
        }, 10);
    }

    componentDidMount() {
        const { days, cost } = this.calculateValues(this.props);
        this.setState({ displayDays: days, displayCost: cost });
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.rentalDate !== prevProps.rentalDate ||
            this.props.returnDate !== prevProps.returnDate
        ) {
            const { days, cost } = this.calculateValues(this.props);
            this.animateState(days, cost);
        }
    }

    componentWillUnmount() {
        clearInterval(this.animationInterval);
    }

    render() {
        const { dailyRate, rentalDate, returnDate } = this.props;
        const { displayDays, displayCost } = this.state;

        if (!dailyRate || !rentalDate || !returnDate) {
            return <p>Выберите даты аренды для расчета стоимости</p>;
        }

        const start = new Date(rentalDate);
        const end = new Date(returnDate);

        if (end < start) {
            return <p className="error-message">Дата возврата не может быть раньше даты аренды</p>;
        }

        return (
            <div className="rental-calculator">
                <h3>Расчет стоимости аренды</h3>
                <p>Дней аренды: <strong>{displayDays}</strong></p>
                <p>Стоимость в день: <strong>${dailyRate}</strong></p>
                <p>Общая стоимость: <strong>${displayCost}</strong></p>
            </div>
        );
    }
}

export default RentalCalculator;
