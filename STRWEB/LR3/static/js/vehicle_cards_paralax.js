function initializeVehicleCardParallax(cards) {
    if (!cards || !cards.length) return;

    cards.forEach((card) => {
        const maxRotation = 30; // Максимальный угол наклона в градусах
        const perspective = 1000; // Перспектива
        const scale = 1.02; // Масштаб при наведении

        card.style.transformStyle = "preserve-3d";
        card.style.transition = "transform 0.1s ease-out, box-shadow 0.3s ease";

        card.addEventListener("mouseenter", () => {
            card.style.transition = "transform 0.1s ease-out, box-shadow 0.3s ease";
        });

        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();

            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            const rotateY = x * maxRotation;
            const rotateX = -y * maxRotation;

            card.style.transform = `
                perspective(${perspective}px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale3d(${scale}, ${scale}, ${scale})
            `;

            const shadowX = x * 20;
            const shadowY = y * 20;
            card.style.boxShadow = `
                ${shadowX}px ${shadowY + 20}px 40px rgba(0, 0, 0, 0.25),
                ${shadowX * 0.5}px ${shadowY * 0.5 + 10}px 20px rgba(0, 0, 0, 0.15),
                0 5px 10px rgba(0, 0, 0, 0.1)
            `;

            const glareX = (x + 0.5) * 100;
            const glareY = (y + 0.5) * 100;
            card.style.setProperty("--glare-x", `${glareX}%`);
            card.style.setProperty("--glare-y", `${glareY}%`);
        });

        card.addEventListener("mouseleave", () => {
            // Плавный возврат в исходное положение
            card.style.transition = "transform 0.5s ease-out, box-shadow 0.5s ease-out";
            card.style.transform = `
                perspective(${perspective}px)
                rotateX(0deg)
                rotateY(0deg)
                scale3d(1, 1, 1)
            `;
            card.style.boxShadow = `
                0 4px 6px rgba(0, 0, 0, 0.1),
                0 1px 3px rgba(0, 0, 0, 0.08)
            `;
        });
    });
}

// Для обратной совместимости, если скрипт будет вызван на странице со статической версткой
document.addEventListener("DOMContentLoaded", () => {
    const staticCards = document.querySelectorAll(".vehicle-list .card");
    if (staticCards.length > 0) {
        initializeVehicleCardParallax(staticCards);
    }
});
