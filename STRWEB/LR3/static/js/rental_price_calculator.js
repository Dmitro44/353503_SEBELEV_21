document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const vehicleSelect = document.getElementById('id_vehicle');
    const daysInput = document.getElementById('id_rental_days');
    const discountSelect = document.getElementById('id_discount');
    const promoCodeSelect = document.getElementById('id_promo_code');
    const priceDisplay = document.getElementById('calculated-price');
    const breakdownDisplay = document.getElementById('price-breakdown');

    // Parse JSON data from hidden elements
    const vehiclePrices = JSON.parse(document.getElementById('vehicle-prices').dataset.prices || '{}');
    const promoCodes = JSON.parse(document.getElementById('promo-percentages').dataset.percentages || '{}');

    // Function to calculate and update price
    function updatePrice() {
        // Get selected values
        const vehicleId = vehicleSelect.value;
        const days = parseInt(daysInput.value) || 0;
        const promoCodeId = promoCodeSelect.value;

        if (!vehicleId || days <= 0) {
            priceDisplay.textContent = 'Выберите автомобиль и укажите количество дней';
            breakdownDisplay.innerHTML = '';
            return;
        }

        // Calculate base price
        const dailyPrice = vehiclePrices[vehicleId];
        const basePrice = dailyPrice * days;

        // Apply promo code
        let promoDiscount = 0;
        let promoPercentage = 0;
        if (promoCodeId && promoCodes[promoCodeId]) {
            promoPercentage = promoCodes[promoCodeId];
            promoDiscount = basePrice * (promoPercentage / 100);
        }

        // Calculate final price
        const totalPrice = basePrice - promoDiscount;

        // Create breakdown
        priceDisplay.textContent = `$${totalPrice.toFixed(2)}`;

        // Create breakdown
        let breakdown = `
            <div><strong>Базовая стоимость:</strong> $${dailyPrice.toFixed(2)} × ${days} дней = $${basePrice.toFixed(2)}</div>
        `;

        if (promoPercentage > 0) {
            breakdown += `<div><strong>Промокод:</strong> ${promoPercentage}% = -$${promoDiscount.toFixed(2)}</div>`;
        }

        breakdownDisplay.innerHTML = breakdown;
    }

    // Add event listeners to form elements
    if (vehicleSelect) vehicleSelect.addEventListener('change', updatePrice);
    if (daysInput) daysInput.addEventListener('input', updatePrice);
    if (discountSelect) discountSelect.addEventListener('change', updatePrice);
    if (promoCodeSelect) promoCodeSelect.addEventListener('change', updatePrice);

    // Initial calculation
    updatePrice();
});