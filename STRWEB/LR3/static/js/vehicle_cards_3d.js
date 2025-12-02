document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".vehicle-list .card");

    if (!cards.length) return;

    cards.forEach((card) => {
        // Настройки эффекта
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
            
            // Позиция курсора относительно центра карточки (-0.5 до 0.5)
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            // Вычисляем углы поворота
            const rotateY = x * maxRotation;
            const rotateX = -y * maxRotation;

            // Применяем трансформацию
            card.style.transform = `
                perspective(${perspective}px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale3d(${scale}, ${scale}, ${scale})
            `;

            // Динамическая тень в зависимости от положения
            const shadowX = x * 20;
            const shadowY = y * 20;
            card.style.boxShadow = `
                ${shadowX}px ${shadowY + 20}px 40px rgba(0, 0, 0, 0.25),
                ${shadowX * 0.5}px ${shadowY * 0.5 + 10}px 20px rgba(0, 0, 0, 0.15),
                0 5px 10px rgba(0, 0, 0, 0.1)
            `;

            // Световой блик следует за курсором
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
});
