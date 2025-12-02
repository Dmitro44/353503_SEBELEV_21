if (window.__ageVerificationInitialized) {

} else {
    window.__ageVerificationInitialized = true;

const ADULT_AGE = 18;

const daysOfWeek = [
    "воскресенье",
    "понедельник", 
    "вторник",
    "среду",
    "четверг",
    "пятницу",
    "субботу"
];

function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

function getDayOfWeek(date) {
    return daysOfWeek[date.getDay()];
}

function getYearWord(age) {
    const lastDigit = age % 10;
    const lastTwoDigits = age % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return "лет";
    }

    if (lastDigit === 1) {
        return "год";
    } else if (lastDigit >= 2 && lastDigit <= 4) {
        return "года";
    } else {
        return "лет";
    }
}

function initAgeModal() {
    const STORAGE_KEY = "age_verified";

    if (sessionStorage.getItem(STORAGE_KEY)) {
        return;
    }

    if (document.querySelector(".register-page")) {
        return;
    }

    // Создаём модальное окно
    const modalHTML = `
        <div class="age-modal-overlay" id="age-modal">
            <div class="age-modal">
                <div class="age-modal__icon">🚗</div>
                <h2 class="age-modal__title">Добро пожаловать в Автопрокат!</h2>
                <p class="age-modal__subtitle">Пожалуйста, укажите вашу дату рождения</p>
                
                <form class="age-modal__form" id="age-form">
                    <input 
                        type="date" 
                        class="age-modal__input" 
                        id="birthdate-input"
                        required
                        max="${new Date().toISOString().split('T')[0]}"
                    >
                    <button type="submit" class="age-modal__btn age-modal__btn--primary" id="age-submit-btn">
                        Подтвердить
                    </button>
                </form>

                <div class="age-modal__result" id="age-result">
                    <div class="age-modal__result-icon" id="result-icon"></div>
                    <div class="age-modal__result-text" id="result-text"></div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("age-modal");
    const form = document.getElementById("age-form");
    const input = document.getElementById("birthdate-input");
    const result = document.getElementById("age-result");
    const resultIcon = document.getElementById("result-icon");
    const resultText = document.getElementById("result-text");

    setTimeout(() => {
        modal.classList.add("active");
    }, 500);

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const birthDate = new Date(input.value);
        const today = new Date();

        if (birthDate > today) {
            result.style.display = "block";
            result.className = "age-modal__result show age-modal__result--error";
            result.style.background = "rgba(220, 53, 69, 0.1)";
            result.style.border = "1px solid rgba(220, 53, 69, 0.3)";
            result.style.color = "#dc3545";
            resultIcon.textContent = "❌";
            resultText.innerHTML = `
                <div>Некорректная дата</div>
                <div style="margin-top: 0.5rem;">Дата рождения не может быть в будущем.</div>
            `;
            return;
        }

        const age = calculateAge(birthDate);
        const dayOfWeek = getDayOfWeek(birthDate);

        result.style.display = "block";
        result.style.background = "";
        result.style.border = "";
        result.style.color = "";

        if (age >= ADULT_AGE) {
            // Совершеннолетний
            result.className = "age-modal__result show age-modal__result--success";
            resultIcon.textContent = "✅";
            resultText.innerHTML = `
                <div class="age-modal__result-age">Вам ${age} ${getYearWord(age)}</div>
                <div class="age-modal__result-day">Вы родились в ${dayOfWeek}</div>
                <div style="margin-top: 0.5rem;">Добро пожаловать на сайт!</div>
            `;

            sessionStorage.setItem(STORAGE_KEY, "true");
            
            setTimeout(() => {
                modal.classList.remove("active");
                setTimeout(() => {
                    modal.remove();
                }, 300);
            }, 2500);

        } else {
            // Несовершеннолетний
            result.className = "age-modal__result show age-modal__result--warning";
            resultIcon.textContent = "⚠️";
            resultText.innerHTML = `
                <div class="age-modal__result-age">Вам ${age} ${getYearWord(age)}</div>
                <div style="margin-top: 0.5rem;">
                    Для использования сайта требуется разрешение родителей или законных представителей.
                </div>
            `;

            // Показываем alert
            setTimeout(() => {
                alert(
                    "Внимание!\n\n" +
                    `Вам ${age} ${getYearWord(age)}. Вы несовершеннолетний.\n\n` +
                    "Для использования данного сайта и услуг автопроката " +
                    "требуется разрешение родителей или законных представителей.\n\n" +
                    "Пожалуйста, обратитесь к родителям для получения разрешения."
                );
            }, 500);
        }
    });
}

// страница регистрации
function initRegistrationAgeCheck() {
    const registerPage = document.querySelector(".register-page");
    if (!registerPage) return;

    const dateInput = document.querySelector('input[name="date_of_birth"]');
    if (!dateInput) return;

    const ageInfoContainer = document.createElement("div");
    ageInfoContainer.className = "age-info-container";
    ageInfoContainer.style.cssText = `
        margin-top: 0.5rem;
        padding: 0.75rem;
        border-radius: 8px;
        display: none;
        font-size: 0.9rem;
    `;
    dateInput.parentNode.appendChild(ageInfoContainer);

    let lastAlertedValue = null;

    function checkAge() {
        if (!dateInput.value) {
            ageInfoContainer.style.display = "none";
            return;
        }

        const birthDate = new Date(dateInput.value);
        const today = new Date();
        
        if (birthDate > today) {
            ageInfoContainer.style.display = "block";
            ageInfoContainer.style.background = "rgba(220, 53, 69, 0.1)";
            ageInfoContainer.style.border = "1px solid rgba(220, 53, 69, 0.3)";
            ageInfoContainer.style.color = "#dc3545";
            ageInfoContainer.innerHTML = `
                <strong>❌ Некорректная дата</strong><br>
                <span>Дата рождения не может быть в будущем.</span>
            `;
            return;
        }

        const age = calculateAge(birthDate);
        const dayOfWeek = getDayOfWeek(birthDate);

        ageInfoContainer.style.display = "block";

        if (age >= ADULT_AGE) {
            // Совершеннолетний
            ageInfoContainer.style.background = "rgba(40, 167, 69, 0.1)";
            ageInfoContainer.style.border = "1px solid rgba(40, 167, 69, 0.3)";
            ageInfoContainer.style.color = "#28a745";
            ageInfoContainer.innerHTML = `
                <strong>✅ Вам ${age} ${getYearWord(age)}</strong><br>
                <span style="font-style: italic;">Вы родились в ${dayOfWeek}</span>
            `;
            lastAlertedValue = null;
        } else if (age >= 0) {
            // Несовершеннолетний
            ageInfoContainer.style.background = "rgba(255, 193, 7, 0.1)";
            ageInfoContainer.style.border = "1px solid rgba(255, 193, 7, 0.3)";
            ageInfoContainer.style.color = "#856404";
            ageInfoContainer.innerHTML = `
                <strong>⚠️ Вам ${age} ${getYearWord(age)}</strong><br>
                <span>Для регистрации требуется разрешение родителей.</span>
            `;

            if (lastAlertedValue !== dateInput.value) {
                lastAlertedValue = dateInput.value;
                alert(
                    "Внимание!\n\n" +
                    `Вам ${age} ${getYearWord(age)}. Вы несовершеннолетний.\n\n` +
                    "Для регистрации на сайте и использования услуг автопроката " +
                    "требуется разрешение родителей или законных представителей."
                );
            }
        }
    }

    dateInput.addEventListener("blur", checkAge);
    
    // Также проверяем при нажатии Enter
    dateInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            checkAge();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initAgeModal();
    initRegistrationAgeCheck();
});

}