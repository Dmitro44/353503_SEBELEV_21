document.addEventListener("DOMContentLoaded", () => {
    const addElementCheckbox = document.getElementById("addElementCheckbox");
    const formContainer = document.getElementById("formContainer");
    const selectTemplate = document.getElementById("selectTemplate");

    const getElementState = (formElement) => {
        const select = formElement.querySelector("select");
        return {
            name: select.name,
            size: select.size,
            multiple: select.multiple,
            required: select.required,
            disabled: select.disabled,
        };
    };

    const saveState = () => {
        const elements = formContainer.querySelectorAll(".generated-form");
        const state = Array.from(elements).map((el) => getElementState(el));
        localStorage.setItem("formGeneratorState", JSON.stringify(state));
    };

    const createFormElement = (state) => {
        const newFormFragment = selectTemplate.content.cloneNode(true);
        const formElement = newFormFragment.querySelector(".generated-form");
        const selectElement = formElement.querySelector("select");

        // Apply state to the select element
        selectElement.name = state.name;
        selectElement.size = state.size;
        selectElement.multiple = state.multiple;
        selectElement.required = state.required;
        selectElement.disabled = state.disabled;

        // Apply state to the attribute controls
        formElement.querySelector('[data-attr="name"]').value = state.name;
        formElement.querySelector('[data-attr="size"]').value = state.size;
        formElement.querySelector('[data-attr="multiple"]').checked =
            state.multiple;
        formElement.querySelector('[data-attr="required"]').checked =
            state.required;
        formElement.querySelector('[data-attr="disabled"]').checked =
            state.disabled;

        attachEventListenersToForm(formElement);
        formContainer.appendChild(formElement);
    };

    const loadState = () => {
        const savedState = localStorage.getItem("formGeneratorState");
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                formContainer.innerHTML = "";
                state.forEach((elementState) =>
                    createFormElement(elementState),
                );
            } catch (e) {
                console.error(
                    "Error parsing form generator state from localStorage",
                    e,
                );
                localStorage.removeItem("formGeneratorState");
            }
        }
    };

    const attachEventListenersToForm = (formElement) => {
        const selectElement = formElement.querySelector("select");
        const attributeControls =
            formElement.querySelectorAll(".attribute-control");
        const deleteButton = formElement.querySelector(".delete-btn");

        attributeControls.forEach((control) => {
            control.addEventListener("input", () => {
                const attr = control.dataset.attr;
                if (control.type === "checkbox") {
                    selectElement[attr] = control.checked;
                } else {
                    selectElement.setAttribute(attr, control.value);
                }
                saveState();
            });
        });

        deleteButton.addEventListener("click", () => {
            formElement.remove();
            saveState();
        });
    };

    addElementCheckbox.addEventListener("change", () => {
        if (addElementCheckbox.checked) {
            createFormElement({
                name: "",
                size: 1,
                multiple: false,
                required: false,
                disabled: false,
            });
            saveState();
            addElementCheckbox.checked = false;
        }
    });

    loadState();
});

