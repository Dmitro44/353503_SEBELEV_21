document.addEventListener("DOMContentLoaded", () => {
    const vehicleListContainer = document.querySelector(".vehicle-list");
    const noVehiclesFound = document.querySelector(".no-vehicles-found");
    const paginationContainer = document.querySelector(".pagination-buttons");
    const vehicleCountSpan = document.getElementById("vehicle-count");

    // Filter and sort controls
    const searchInput = document.querySelector('input[name="search"]');
    const brandSelect = document.getElementById("brand");
    const bodyTypeSelect = document.getElementById("body_type");
    const yearSelect = document.getElementById("year");
    const isAvailableSelect = document.getElementById("is_available");
    const carParkSelect = document.getElementById("car_park");
    const orderingSelect = document.getElementById("ordering");
    
    const searchForm = document.getElementById("search-form");
    const filtersForm = document.getElementById("filters-form");
    const resetFiltersBtn = document.getElementById("reset-filters-btn");


    // State
    let allVehicles = [];
    let filteredVehicles = [];
    let currentPage = 1;
    const rowsPerPage = 3;

    // --- DATA FETCHING ---
    async function fetchVehicles() {
        try {
            const response = await fetch("/vehicles/api/");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allVehicles = await response.json();
            filteredVehicles = [...allVehicles];
            renderPage();
        } catch (error) {
            console.error("Could not fetch vehicles:", error);
            vehicleListContainer.innerHTML = `<p>Ошибка загрузки данных.</p>`;
        }
    }

    // --- RENDERING ---
    function renderPage() {
        applyFiltersAndSort();
        renderVehicleCards();
        renderPagination();
    }

    function renderVehicleCards() {
        vehicleListContainer.innerHTML = "";
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedVehicles = filteredVehicles.slice(start, end);

        vehicleCountSpan.textContent = filteredVehicles.length;

        if (paginatedVehicles.length === 0) {
            vehicleListContainer.style.display = "none";
            noVehiclesFound.style.display = "block";
            return;
        }

        vehicleListContainer.style.display = "";
        noVehiclesFound.style.display = "none";

        paginatedVehicles.forEach((vehicle) => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <img class="card-img-top" src="${vehicle.image}" alt="${vehicle.car_model.brand} ${vehicle.car_model.model}">
                <div class="card-content">
                    <div class="card-main-info">
                        <h5>${vehicle.car_model.brand} ${vehicle.car_model.model}</h5>
                        <p><strong>${vehicle.daily_rental_price} $</strong>/день</p>
                        <p>${vehicle.year} г. | ${vehicle.car_model.body_type.name}</p>
                    </div>
                    <div class="card-actions">
                        <a href="/vehicles/${vehicle.id}/" class="btn btn-primary">Подробнее</a>
                    </div>
                </div>
            `;
            vehicleListContainer.appendChild(card);
        });

        // Initialize parallax effect on the newly created cards
        if (typeof initializeVehicleCardParallax === 'function') {
            const newCards = vehicleListContainer.querySelectorAll('.card');
            initializeVehicleCardParallax(newCards);
        }
    }

    function renderPagination() {
        paginationContainer.innerHTML = "";
        const pageCount = Math.ceil(filteredVehicles.length / rowsPerPage);
        if (pageCount <= 1) return;

        const createButton = (text, page, enabled = true, isActive = false) => {
            const button = document.createElement("a");
            button.href = "#";
            button.innerHTML = text;
            button.className = "btn";
            if (isActive) button.classList.add("btn-primary");
            else button.classList.add("btn-secondary");
            if (!enabled) {
                button.classList.add("disabled");
                button.setAttribute("tabindex", "-1");
            } else {
                button.addEventListener("click", (e) => {
                    e.preventDefault();
                    currentPage = page;
                    renderPage();
                });
            }
            return button;
        };

        paginationContainer.appendChild(createButton("&laquo;&laquo;", 1, currentPage > 1));
        paginationContainer.appendChild(createButton("&laquo;", currentPage - 1, currentPage > 1));

        for (let i = 1; i <= pageCount; i++) {
            paginationContainer.appendChild(createButton(i, i, true, currentPage === i));
        }

        paginationContainer.appendChild(createButton("&raquo;", currentPage + 1, currentPage < pageCount));
        paginationContainer.appendChild(createButton("&raquo;&raquo;", pageCount, currentPage < pageCount));
    }

    // --- LOGIC ---
    function applyFiltersAndSort() {
        const search = searchInput.value.toLowerCase();
        const brand = brandSelect.value;
        const bodyType = bodyTypeSelect.value;
        const year = yearSelect.value;
        const isAvailable = isAvailableSelect.value;
        const carPark = carParkSelect.value;
        const ordering = orderingSelect.value;

        filteredVehicles = allVehicles.filter(v => {
            const matchesSearch = !search || 
                v.car_model.brand.toLowerCase().includes(search) ||
                v.car_model.model.toLowerCase().includes(search);
            const matchesBrand = !brand || v.car_model.brand === brand;
            const matchesBodyType = !bodyType || v.car_model.body_type.id == bodyType;
            const matchesYear = !year || v.year == year;
            const matchesAvailable = isAvailable === "" || String(v.is_available) === isAvailable;
            const matchesCarPark = !carPark || v.car_park.id == carPark;
            return matchesSearch && matchesBrand && matchesBodyType && matchesYear && matchesAvailable && matchesCarPark;
        });

        filteredVehicles.sort((a, b) => {
            switch (ordering) {
                case 'daily_rental_price': return a.daily_rental_price - b.daily_rental_price;
                case '-daily_rental_price': return b.daily_rental_price - a.daily_rental_price;
                case 'year': return b.year - a.year;
                case '-year': return a.year - b.year;
                default: return 0;
            }
        });
    }

    // --- EVENT LISTENERS ---
    function handleFilterChange() {
        currentPage = 1;
        renderPage();
    }

    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handleFilterChange();
    });

    filtersForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handleFilterChange();
    });

    resetFiltersBtn.addEventListener("click", (e) => {
        e.preventDefault();
        searchForm.reset();
        filtersForm.reset();
        handleFilterChange();
    });

    orderingSelect.addEventListener("change", handleFilterChange);

    // --- INITIALIZATION ---
    fetchVehicles();
});
