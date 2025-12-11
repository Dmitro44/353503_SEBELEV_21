document.addEventListener("DOMContentLoaded", () => {
    // --- 1. Geolocation API ---
    const geoBtn = document.getElementById("geo-btn");
    const geoResult = document.getElementById("geo-result");

    geoBtn.addEventListener("click", () => {
        if (!navigator.geolocation) {
            geoResult.textContent = "Geolocation API не поддерживается вашим браузером.";
            return;
        }

        // 1. Проверяем разрешения
        navigator.permissions.query({ name: "geolocation" }).then((permissionStatus) => {
            if (permissionStatus.state === "granted") {
                geoResult.textContent = "Разрешение есть. Получаем координаты...";
                getLocation();
            } else if (permissionStatus.state === "prompt") {
                geoResult.textContent = "Браузер запросит разрешение на доступ к геолокации.";
                getLocation();
            } else if (permissionStatus.state === "denied") {
                geoResult.innerHTML =
                    "<strong>Ошибка: Доступ к геолокации заблокирован.</strong><br>Пожалуйста, измените настройки разрешений для этого сайта в вашем браузере (обычно это делается по клику на иконку замка в адресной строке).";
            }

            permissionStatus.onchange = () => {
                geoResult.textContent = `Статус разрешений изменился на: ${permissionStatus.state}`;
            };
        });
    });

    function getLocation() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                geoResult.innerHTML = `
                    <strong>Местоположение определено:</strong><br>
                    Широта: ${latitude.toFixed(6)}<br>
                    Долгота: ${longitude.toFixed(6)}<br>
                `;
            },
            (error) => {
                let errorMessage = "Произошла неизвестная ошибка.";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Вы отказали в доступе к геолокации.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage =
                            "<strong>Информация о местоположении недоступна.</strong><br>Возможные причины:<ul><li>На устройстве отключен GPS/службы геолокации.</li><li>Отсутствует подключение к сети или слабый сигнал.</li><li>Браузер не может получить доступ к службам геолокации ОС.</li></ul>";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Истекло время ожидания запроса на получение координат.";
                        break;
                }
                geoResult.innerHTML = `Ошибка: ${errorMessage}`;
            },
        );
    }

    // Battery Status API ---
    const batteryBtn = document.getElementById("battery-btn");
    const batteryResult = document.getElementById("battery-result");

    batteryBtn.addEventListener("click", () => {
        if ("getBattery" in navigator) {
            navigator.getBattery().then((battery) => {
                const updateBatteryStatus = () => {
                    batteryResult.innerHTML = `
                        <strong>Уровень заряда:</strong> ${(battery.level * 100).toFixed(0)}%<br>
                        <strong>Статус:</strong> ${battery.charging ? "Заряжается" : "Не заряжается"}<br>
                        ${battery.chargingTime !== Infinity ? `<strong>Время до полной зарядки:</strong> ${Math.floor(battery.chargingTime / 60)} мин.<br>` : ""}
                        ${battery.dischargingTime !== Infinity ? `<strong>Оставшееся время работы:</strong> ${Math.floor(battery.dischargingTime / 60)} мин.` : ""}
                    `;
                };

                // Initial status
                updateBatteryStatus();

                // Update on change
                battery.addEventListener("levelchange", updateBatteryStatus);
                battery.addEventListener("chargingchange", updateBatteryStatus);
                battery.addEventListener("chargingtimechange", updateBatteryStatus);
                battery.addEventListener("dischargingtimechange", updateBatteryStatus);

                batteryResult.innerHTML += "<br><i>(Статус будет обновляться автоматически)</i>";
            });
        } else {
            batteryResult.textContent = "Battery Status API не поддерживается вашим браузером.";
        }
    });

    // --- 3. Speech Synthesis API ---
    // const speechBtn = document.getElementById("speech-btn");
    // const speechText = document.getElementById("speech-text");
    // const speechResult = document.getElementById("speech-result");
    // const synth = window.speechSynthesis;
    //
    // speechBtn.addEventListener("click", () => {
    //     if (synth.speaking) {
    //         speechResult.textContent = "Синтезатор уже говорит.";
    //         return;
    //     }
    //     if (speechText.value !== "") {
    //         const utterThis = new SpeechSynthesisUtterance(speechText.value);
    //         utterThis.onstart = () => {
    //             speechResult.textContent = "Синтез речи начался...";
    //         };
    //         utterThis.onend = () => {
    //             speechResult.textContent = "Синтез речи завершен.";
    //         };
    //         utterThis.onerror = (event) => {
    //             speechResult.textContent = `Ошибка синтеза речи: ${event.error}`;
    //         };
    //
    //         const russianVoice = synth
    //             .getVoices()
    //             .find((voice) => voice.lang === "en-US");
    //
    //         if (russianVoice) {
    //             utterThis.voice = russianVoice;
    //         }
    //         synth.speak(utterThis);
    //     } else {
    //         speechResult.textContent = "Поле для текста пустое.";
    //     }
    // });
    //
    // // Убедимся, что голоса загружены, прежде чем пытаться их использовать
    // if (synth.onvoiceschanged !== undefined) {
    //     synth.onvoiceschanged = () => synth.getVoices();
    // }
});
