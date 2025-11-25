document.addEventListener('DOMContentLoaded', () => {
    // Element references
    const tableBody = document.querySelector('.data-table tbody');
    const paginationContainer = document.querySelector('.pagination-buttons');
    const tableHeaders = document.querySelectorAll('.data-table th[data-sort]');
    const filterInput = document.getElementById('filter-input');
    const filterBtn = document.getElementById('filter-btn');
    const detailsContainer = document.getElementById('employee-details-container');
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    const addFormContainer = document.getElementById('add-employee-form-container');
    const addForm = document.getElementById('add-employee-form');
    const cancelAddBtn = document.getElementById('cancel-add-btn');
    const submitAddBtn = document.getElementById('submit-add-btn');
    const phoneInput = document.getElementById('phone');
    const phoneValidationMsg = document.getElementById('phone-validation-msg');
    const bonusBtn = document.getElementById('bonus-btn');
    const bonusMessageContainer = document.getElementById('bonus-message-container');
    const selectAllCheckbox = document.getElementById('select-all-employees');


    // State
    let allContacts = [];
    let filteredContacts = [];
    let currentPage = 1;
    const rowsPerPage = 3;
    let sortColumn = 'full_name';
    let sortDirection = 'asc';
    let filterQuery = '';
    let selectedContactId = null;
    let checkedContactIds = new Set();

    // --- UTILS ---
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');

    // --- DATA FETCHING ---
    async function fetchContacts() {
        try {
            const response = await fetch('/api/contacts/');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allContacts = await response.json();
            filteredContacts = [...allContacts];
            renderPage();
        } catch (error) {
            console.error("Could not fetch contacts:", error);
            tableBody.innerHTML = `<tr><td colspan="7">Ошибка загрузки данных.</td></tr>`;
        }
    }

    // --- RENDERING ---
    function renderPage() {
        applyFilter();
        sortContacts();
        renderTable();
        renderPagination();
        updateHeaderSortIndicators();
        updateSelectAllCheckboxState(); // Update select all checkbox state
        const selectedContact = filteredContacts.find(c => c.id === selectedContactId);
        renderDetails(selectedContact);
    }

    function renderTable() {
        tableBody.innerHTML = '';
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedContacts = filteredContacts.slice(start, end);

        if (paginatedContacts.length === 0 && currentPage > 1) {
            currentPage--;
            renderPage();
            return;
        }

        if (paginatedContacts.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7">Сотрудники не найдены.</td></tr>';
            return;
        }

        paginatedContacts.forEach(employee => {
            const row = document.createElement('tr');
            row.dataset.employeeId = employee.id;
            if (employee.id === selectedContactId) row.classList.add('selected');
            
            const isChecked = checkedContactIds.has(employee.id);

            row.innerHTML = `
                <td><input type="checkbox" class="employee-checkbox" name="employee_id" value="${employee.id}" ${isChecked ? 'checked' : ''}></td>
                <td><img src="${employee.photo_url || '/static/images/default_avatar.png'}" alt="${employee.full_name}" class="employee-photo"></td>
                <td data-label="ФИО">${employee.full_name}</td>
                <td data-label="Должность">${employee.position}</td>
                <td data-label="Телефон">${employee.phone}</td>
                <td data-label="Email">${employee.email}</td>
                <td data-label="Описание">${employee.bio || 'Нет описания'}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function renderPagination() {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        const pageCount = Math.ceil(filteredContacts.length / rowsPerPage);
        if (pageCount <= 1) return;

        const firstBtn = createPaginationButton('&laquo;&laquo;', 1, currentPage > 1);
        const prevBtn = createPaginationButton('&laquo;', currentPage - 1, currentPage > 1);
        paginationContainer.appendChild(firstBtn);
        paginationContainer.appendChild(prevBtn);

        for (let i = 1; i <= pageCount; i++) {
            const pageBtn = createPaginationButton(i, i, true, currentPage === i);
            paginationContainer.appendChild(pageBtn);
        }

        const nextBtn = createPaginationButton('&raquo;', currentPage + 1, currentPage < pageCount);
        const lastBtn = createPaginationButton('&raquo;&raquo;', pageCount, currentPage < pageCount);
        paginationContainer.appendChild(nextBtn);
        paginationContainer.appendChild(lastBtn);
    }

    function renderDetails(contact) {
        if (!contact) {
            detailsContainer.innerHTML = '';
            detailsContainer.style.display = 'none';
            return;
        }
        detailsContainer.style.display = 'block';
        detailsContainer.innerHTML = `
            <h3>Детали сотрудника</h3>
            <div class="details-content">
                <img src="${contact.photo_url || '/static/images/default_avatar.png'}" alt="${contact.full_name}" class="details-photo">
                <div>
                    <p><strong>ФИО:</strong> ${contact.full_name}</p>
                    <p><strong>Должность:</strong> ${contact.position}</p>
                    <p><strong>Отдел:</strong> ${contact.department || 'N/A'}</p>
                    <p><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
                    <p><strong>Телефон:</strong> <a href="tel:${contact.phone}">${contact.phone}</a></p>
                    <p><strong>Биография:</strong> ${contact.bio || 'Нет информации.'}</p>
                </div>
            </div>
        `;
    }

    // --- LOGIC (Filter, Sort, Bonus) ---
    function applyFilter() {
        const query = filterQuery.toLowerCase();
        if (!query) {
            filteredContacts = [...allContacts];
            return;
        }
        filteredContacts = allContacts.filter(c => 
            Object.values(c).some(val => 
                String(val).toLowerCase().includes(query)
            )
        );
    }

    function sortContacts() {
        filteredContacts.sort((a, b) => {
            const valA = a[sortColumn] || '';
            const valB = b[sortColumn] || '';
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    function handleBonus() {
        if (checkedContactIds.size === 0) {
            bonusMessageContainer.innerHTML = '<p>Пожалуйста, выберите сотрудников для премирования.</p>';
            bonusMessageContainer.style.display = 'block';
            return;
        }

        const employeeNames = Array.from(checkedContactIds).map(id => {
            const contact = allContacts.find(c => c.id === id);
            return contact ? contact.full_name : '';
        }).filter(name => name);

        bonusMessageContainer.innerHTML = `<p><strong>Приказ о премировании:</strong><br>Премировать следующих сотрудников: ${employeeNames.join(', ')}.</p>`;
        bonusMessageContainer.style.display = 'block';
    }

    // --- FORM VALIDATION ---
    function validatePhone(phone) {
        // Remove all non-digit characters, but keep a leading '+'
        const cleaned = phone.replace(/(?!^\+)\D/g, '');

        // Check for +375 format (12 digits total)
        if (cleaned.startsWith('+375')) {
            return cleaned.length === 12;
        }
        
        // Check for 80 format (11 digits total)
        if (cleaned.startsWith('80')) {
            return cleaned.length === 11;
        }

        return false;
    }

    function validateAddForm() {
        const isPhoneValid = validatePhone(phoneInput.value);
        const requiredFields = addForm.querySelectorAll('input[required]');
        let allRequiredFilled = true;
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                allRequiredFilled = false;
            }
        });

        if (phoneInput.value) {
            if (isPhoneValid) {
                phoneInput.classList.remove('is-invalid');
                phoneInput.classList.add('is-valid');
                phoneValidationMsg.textContent = 'Номер валиден.';
                phoneValidationMsg.style.color = 'green';
            } else {
                phoneInput.classList.remove('is-valid');
                phoneInput.classList.add('is-invalid');
                phoneValidationMsg.textContent = 'Неверный формат номера.';
                phoneValidationMsg.style.color = 'red';
            }
        } else {
             phoneInput.classList.remove('is-valid', 'is-invalid');
             phoneValidationMsg.textContent = '';
        }

        submitAddBtn.disabled = !(allRequiredFilled && isPhoneValid);
    }

    // --- UTILS ---
    function createPaginationButton(text, page, enabled = true, isActive = false) {
        const button = document.createElement('a');
        button.href = '#';
        button.innerHTML = text;
        button.className = 'btn';
        if (isActive) button.classList.add('btn-primary');
        else button.classList.add('btn-secondary');
        if (!enabled) {
            button.classList.add('disabled');
            button.setAttribute('tabindex', '-1');
            button.setAttribute('aria-disabled', 'true');
        } else {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = page;
                renderPage();
            });
        }
        return button;
    }

    function updateHeaderSortIndicators() {
        tableHeaders.forEach(header => {
            const key = header.getAttribute('data-sort');
            header.classList.remove('sort-asc', 'sort-desc');
            if (key === sortColumn) {
                header.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        });
    }

    function updateSelectAllCheckboxState() {
        const allFilteredIds = new Set(filteredContacts.map(c => c.id));
        const allFilteredChecked = filteredContacts.every(c => checkedContactIds.has(c.id));
        selectAllCheckbox.checked = allFilteredChecked && filteredContacts.length > 0;
    }

    // --- EVENT LISTENERS ---
    tableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const newSortColumn = header.getAttribute('data-sort');
            if (sortColumn === newSortColumn) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortColumn = newSortColumn;
                sortDirection = 'asc';
            }
            currentPage = 1;
            renderPage();
        });
    });

    filterBtn.addEventListener('click', () => {
        filterQuery = filterInput.value;
        currentPage = 1;
        renderPage();
    });

    tableBody.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('employee-checkbox')) {
            const employeeId = parseInt(target.value, 10);
            if (target.checked) {
                checkedContactIds.add(employeeId);
            } else {
                checkedContactIds.delete(employeeId);
            }
            updateSelectAllCheckboxState(); // Update select all checkbox state
        } else {
            const row = target.closest('tr');
            if (!row || !row.dataset.employeeId) return;
            const employeeId = parseInt(row.dataset.employeeId, 10);
            selectedContactId = (selectedContactId === employeeId) ? null : employeeId;
            renderPage();
        }
    });

    addEmployeeBtn.addEventListener('click', () => {
        addFormContainer.style.display = 'block';
    });

    cancelAddBtn.addEventListener('click', () => {
        addFormContainer.style.display = 'none';
        addForm.reset();
        phoneInput.classList.remove('is-valid', 'is-invalid');
        phoneValidationMsg.textContent = '';
        submitAddBtn.disabled = true;
    });

    addForm.addEventListener('input', validateAddForm);

    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (submitAddBtn.disabled) return;

        const formData = new FormData(addForm);

        try {
            const response = await fetch('/api/contacts/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Form submission error:', errorData);
                alert('Ошибка при добавлении сотрудника. Проверьте консоль для деталей.');
                return;
            }

            addForm.reset();
            addFormContainer.style.display = 'none';
            await fetchContacts(); 
            
        } catch (error) {
            console.error('Network error:', error);
            alert('Сетевая ошибка при добавлении сотрудника.');
        }
    });

    bonusBtn.addEventListener('click', handleBonus);

    selectAllCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        if (isChecked) {
            filteredContacts.forEach(contact => checkedContactIds.add(contact.id));
        } else {
            filteredContacts.forEach(contact => checkedContactIds.delete(contact.id));
        }
        renderTable(); // Re-render table to update checkboxes
    });

    // --- INITIALIZATION ---
    fetchContacts();
});