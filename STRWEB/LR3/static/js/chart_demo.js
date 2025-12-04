document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("function-chart").getContext("2d");
    const nSlider = document.getElementById("n-slider");
    const nValueSpan = document.getElementById("n-value");
    const saveChartBtn = document.getElementById("save-chart-btn");

    let chart;

    // --- Функции для вычислений ---

    // Исходная функция f(x) = 1 / (1 - x)
    const originalFunction = (x) => {
        if (x === 1) return NaN; // Избегаем деления на ноль
        return 1 / (1 - x);
    };

    // Ряд Тейлора S(x) = 1 + x + x^2 + ... + x^n
    const taylorSeries = (x, n) => {
        let sum = 0;
        for (let i = 0; i <= n; i++) {
            sum += Math.pow(x, i);
        }
        return sum;
    };

    // --- Генерация данных для графика ---
    const generateChartData = (n) => {
        const labels = [];
        const originalData = [];
        const taylorData = [];

        // Генерируем точки от 0 до 0.99 с шагом 0.01
        for (let x = 0.3; x <= 0.99; x += 0.01) {
            labels.push(x.toFixed(2));
            originalData.push(originalFunction(x));
            taylorData.push(taylorSeries(x, n));
        }

        return {
            labels,
            datasets: [
                {
                    label: "f(x) = 1 / (1 - x)",
                    data: originalData,
                    borderColor: "rgba(255, 99, 132, 1)",
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderWidth: 2,
                    tension: 0.1,
                    pointRadius: 0,
                },
                {
                    label: `S(x, n=${n})`,
                    data: taylorData,
                    borderColor: "rgba(54, 162, 235, 1)",
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderWidth: 2,
                    tension: 0.1,
                    pointRadius: 0,
                },
            ],
        };
    };

    // --- Создание и обновление графика ---
    const createOrUpdateChart = (n) => {
        const data = generateChartData(n);

        if (chart) {
            // Обновляем существующий график
            chart.data = data;
            chart.options.plugins.annotation.annotations.nLabel.content = `n = ${n}`;
            chart.update();
        } else {
            // Создаем новый график
            chart = new Chart(ctx, {
                type: "line",
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false, // Отключаем анимацию
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "x",
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: "y",
                            },
                            beginAtZero: false,
                            min: -10,
                            max: 20,
                        },
                    },
                    plugins: {
                        legend: {
                            position: "top",
                        },
                        title: {
                            display: true,
                            text: "График функции и ее разложения в ряд Тейлора",
                        },
                        annotation: {
                            annotations: {
                                nLabel: {
                                    type: "label",
                                    xValue: 5,
                                    yValue: 18,
                                    content: `n = ${n}`,
                                    font: {
                                        size: 14,
                                    },
                                    backgroundColor: "rgba(245, 245, 245, 0.7)",
                                    color: "black",
                                },
                            },
                        },
                    },
                },
            });
        }
    };

    // --- Обработчики событий ---

    // Изменение ползунка
    nSlider.addEventListener("input", (e) => {
        const n = parseInt(e.target.value, 10);
        nValueSpan.textContent = n;
        createOrUpdateChart(n);
    });

    // Кнопка сохранения
    saveChartBtn.addEventListener("click", () => {
        if (chart) {
            const link = document.createElement("a");
            link.href = chart.toBase64Image("image/png");
            link.download = `chart_n=${nSlider.value}.png`;
            link.click();
        }
    });

    // --- Инициализация ---
    createOrUpdateChart(parseInt(nSlider.value, 10));
});
