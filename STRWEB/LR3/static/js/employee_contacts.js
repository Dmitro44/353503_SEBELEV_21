// static/js/employee_contacts.js

document.addEventListener('DOMContentLoaded', function() {
    const selectAllCheckbox = document.getElementById('select-all-employees');
    const employeeCheckboxes = document.querySelectorAll('input[name="employee_id"]');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            employeeCheckboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
    }
});
