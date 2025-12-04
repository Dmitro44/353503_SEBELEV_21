document.addEventListener("DOMContentLoaded", () => {
    const initialEmployeesData = [
        {
            fullName: "Иванов И. И.",
            gender: "Мужской",
            maritalStatus: "В браке",
        },
        {
            fullName: "Петрова П. П.",
            gender: "Женский",
            maritalStatus: "Не в браке",
        },
        {
            fullName: "Сидоров С. С.",
            gender: "Мужской",
            maritalStatus: "Не в браке",
        },
        {
            fullName: "Кузнецова К. К.",
            gender: "Женский",
            maritalStatus: "В браке",
        },
        {
            fullName: "Васильев В. В.",
            gender: "Мужской",
            maritalStatus: "В браке",
        },
        {
            fullName: "Михайлова М. М.",
            gender: "Женский",
            maritalStatus: "Не в браке",
        },
    ];

    const getResult = (employeeArray) => {
        if (!employeeArray || employeeArray.length === 0) {
            return "Нет данных для анализа.";
        }
        const marriedCount = employeeArray.filter(
            (emp) => emp.maritalStatus === "В браке",
        ).length;
        const probability = (marriedCount / employeeArray.length) * 100;
        return `Процент сотрудников в браке: ${probability.toFixed(2)}%`;
    };

    // ПРОТОТИПНОЕ НАСЛЕДОВАНИЕ
    {
        function BaseEmployee(fullName, gender) {
            this._fullName = fullName;
            this._gender = gender;
        }

        Object.defineProperty(BaseEmployee.prototype, "fullName", {
            get: function () {
                return this._fullName;
            },
            set: function (value) {
                this._fullName = value;
            },
        });

        Object.defineProperty(BaseEmployee.prototype, "gender", {
            get: function () {
                return this._gender;
            },
            set: function (value) {
                this._gender = value;
            },
        });

        function Employee(fullName, gender, maritalStatus) {
            BaseEmployee.call(this, fullName, gender);
            this._maritalStatus = maritalStatus;
        }
        Employee.prototype = Object.create(BaseEmployee.prototype);
        Employee.prototype.constructor = Employee;
        Object.defineProperty(Employee.prototype, "maritalStatus", {
            get: function () {
                return this._maritalStatus;
            },
            set: function (value) {
                this._maritalStatus = value;
            },
        });

        // Менеджер для управления логикой
        const protoManager = {
            employees: [],

            init: function () {
                this.employees = initialEmployeesData.map(
                    (d) => new Employee(d.fullName, d.gender, d.maritalStatus),
                );
                const protoForm = document.getElementById("proto-form");
                protoForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    this.addObject(protoForm);
                });
                this.updateUI();
            },

            addObject: function (form) {
                const fullName = form.querySelector('[name="fullname"]').value;
                const gender = form.querySelector('[name="gender"]').value;
                const maritalStatus = form.querySelector(
                    '[name="marital-status"]',
                ).value;

                if (!fullName.trim()) {
                    alert("Пожалуйста, введите ФИО.");
                    return;
                }

                const employee = new Employee(fullName, gender, maritalStatus);
                this.employees.push(employee);
                form.reset();
                this.updateUI();
            },

            displayAll: function (container) {
                container.innerHTML = "";
                const ul = document.createElement("ul");
                this.employees.forEach((emp) => {
                    const li = document.createElement("li");
                    li.textContent = `ФИО: ${emp.fullName}, Пол: ${emp.gender}, Семейное положение: ${emp.maritalStatus}`;
                    ul.appendChild(li);
                });
                container.appendChild(ul);
            },

            displayResult: function (container) {
                container.textContent = getResult(this.employees);
            },

            updateUI: function () {
                const displayAllContainer =
                    document.getElementById("proto-display-all");
                const displayResultContainer = document.getElementById(
                    "proto-display-result",
                );
                this.displayAll(displayAllContainer);
                this.displayResult(displayResultContainer);
            },
        };

        protoManager.init();
    }

    // КЛАССЫ
    {
        class BaseEmployeeClass {
            constructor(fullName, gender) {
                this._fullName = fullName;
                this._gender = gender;
            }
            get fullName() {
                return this._fullName;
            }
            set fullName(value) {
                this._fullName = value;
            }
            get gender() {
                return this._gender;
            }
            set gender(value) {
                this._gender = value;
            }
        }

        class EmployeeClass extends BaseEmployeeClass {
            constructor(fullName, gender, maritalStatus) {
                super(fullName, gender);
                this._maritalStatus = maritalStatus;
            }
            get maritalStatus() {
                return this._maritalStatus;
            }
            set maritalStatus(value) {
                this._maritalStatus = value;
            }
        }

        const classManager = {
            employees: [],

            init: function () {
                this.employees = initialEmployeesData.map(
                    (d) =>
                        new EmployeeClass(
                            d.fullName,
                            d.gender,
                            d.maritalStatus,
                        ),
                );
                const classForm = document.getElementById("class-form");
                classForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    this.addObject(classForm);
                });
                this.updateUI();
            },

            addObject: function (form) {
                const fullName = form.querySelector('[name="fullname"]').value;
                const gender = form.querySelector('[name="gender"]').value;
                const maritalStatus = form.querySelector(
                    '[name="marital-status"]',
                ).value;

                if (!fullName.trim()) {
                    alert("Пожалуйста, введите ФИО.");
                    return;
                }

                const employee = new EmployeeClass(
                    fullName,
                    gender,
                    maritalStatus,
                );
                this.employees.push(employee);
                form.reset();
                this.updateUI();
            },

            displayAll: function (container) {
                container.innerHTML = "";
                const ul = document.createElement("ul");
                this.employees.forEach((emp) => {
                    const li = document.createElement("li");
                    li.textContent = `ФИО: ${emp.fullName}, Пол: ${emp.gender}, Семейное положение: ${emp.maritalStatus}`;
                    ul.appendChild(li);
                });
                container.appendChild(ul);
            },

            displayResult: function (container) {
                container.textContent = getResult(this.employees);
            },

            updateUI: function () {
                const displayAllContainer =
                    document.getElementById("class-display-all");
                const displayResultContainer = document.getElementById(
                    "class-display-result",
                );
                this.displayAll(displayAllContainer);
                this.displayResult(displayResultContainer);
            },
        };

        classManager.init();
    }
});

