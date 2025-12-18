import React, { Component } from 'react';

class RentalCalculator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            displayDays: 0,
            displayCost: 0,
            error: '',
        };
        this.animationInterval = null;
    }

    componentDidMount() {
        this.runCalculation(this.props);
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.rentalDate !== prevProps.rentalDate ||
            this.props.returnDate !== prevProps.returnDate ||
            this.props.dailyRate !== prevProps.dailyRate
        ) {
            this.runCalculation(this.props);
        }
    }

    componentWillUnmount() {
        clearInterval(this.animationInterval);
    }

    runCalculation = (props) => {
        const { dailyRate, rentalDate, returnDate, onRentalCalculate } = props;

        if (!dailyRate || !rentalDate || !returnDate) {
            // Не показываем ошибку, если даты просто не выбраны
            return;
        }

        const start = new Date(rentalDate);
        const end = new Date(returnDate);

        if (end < start) {
            this.setState({ 
                error: 'Дата возврата не может быть раньше даты аренды',
                displayDays: 0,
                displayCost: 0,
            });
            // Сбрасываем стоимость в родительском компоненте
            if (onRentalCalculate) {
                onRentalCalculate({ days: 0, cost: 0 });
            }
            return;
        }

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
        const finalDiffDays = diffDays === 0 ? 1 : diffDays;
        const totalCost = dailyRate * finalDiffDays;

        this.setState({ error: '' });

        this.animateState(finalDiffDays, totalCost);

        if (onRentalCalculate) {
            onRentalCalculate({ days: finalDiffDays, cost: totalCost });
        }
    };

    animateState = (targetDays, targetCost) => {
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

            const step = Math.ceil(Math.abs(targetCost - displayCost) / 10) || 1;
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
        }, 20);
    };

    render() {
        const { dailyRate, rentalDate, returnDate } = this.props;
        const { displayDays, displayCost, error } = this.state;

        if (!rentalDate || !returnDate) {
            return (
                <div className="rental-calculator">
                    <h3>Расчет стоимости аренды</h3>
                    <p>Выберите даты аренды для расчета.</p>
                </div>
            );
        }

        return (
            <div className="rental-calculator">
                <h3>Расчет стоимости аренды</h3>
                
                {error ? (
                    <p className="error-message">{error}</p>
                ) : (
                    <div className="calculation-results">
                        <p>Дней аренды: <strong>{displayDays}</strong></p>
                        <p>Стоимость в день: <strong>${dailyRate}</strong></p>
                        <p>Общая стоимость: <strong>${displayCost}</strong></p>
                    </div>
                )}
            </div>
        );
    }
}

export default RentalCalculator;
