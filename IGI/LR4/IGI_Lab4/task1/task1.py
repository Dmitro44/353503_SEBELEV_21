import csv
import os.path
import pickle


class Student:
    def __init__(self, surname: str, street: str, house: str, apartment: str):
        self.surname = surname
        self.street = street
        self.house = house
        self.apartment = apartment

    def __str__(self) -> str:
        return f"{self.surname} - ул. {self.street}, д. {self.house}, кв. {self.apartment}"

    def to_dict(self) -> dict[str, str]:
        return {
            "surname": self.surname,
            "street": self.street,
            "house": self.house,
            "apartment": self.apartment
        }


class StudentDatabase:
    def __init__(self):
        self.students: list[Student] = []
        self.csv_file = "students.csv"
        self.pickle_file = "students.pickle"

    def add_student(self, student: Student) -> None:
        """Add a student to the database"""
        self.students.append(student)

    def save_to_csv(self) -> None:
        """Save students data to CSV file"""
        with open(self.csv_file, "w", newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=["surname", "street", "house", "apartment"])
            writer.writeheader()
            for student in self.students:
                writer.writerow(student.to_dict())
        print(f"Data successfully saved to {self.csv_file}")

    def load_from_csv(self) -> None:
        """Load students data from a CSV file"""
        if not os.path.exists(self.csv_file):
            print(f"File {self.csv_file} not found")
            return

        self.students = []
        with open(self.csv_file, "r", encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                self.students.append(Student(
                    row["surname"],
                    row["street"],
                    row["house"],
                    row["apartment"]
                ))
        print(f"Data successfully loaded from {self.csv_file}")

    def save_to_pickle(self) -> None:
        """Save students data to a pickle file"""
        with open(self.pickle_file, "wb") as file:
            pickle.dump([student.to_dict() for student in self.students], file)
        print(f"Data successfully saved to {self.pickle_file}")

    def load_from_pickle(self) -> None:
        """Load students data from a pickle file"""
        if not os.path.exists(self.pickle_file):
            print(f"File {self.pickle_file} not found")
            return

        self.students = []
        with open(self.pickle_file, 'rb') as file:
            data = pickle.load(file)
            for item in data:
                self.students.append(Student(
                    item["surname"],
                    item["street"],
                    item["house"],
                    item["apartment"]
                ))
        print(f"Data successfully loaded from {self.pickle_file}")

    def count_students_on_street(self, street: str) -> int:
        """Count a number of students that live on a specific street"""
        return sum(1 for student in self.students if student.street.lower() == street.lower())

    def find_students_by_house(self, house: str) -> list[Student]:
        """Find students living in a specific house"""
        return [student for student in self.students if student.house == house]

    def display_all_students(self) -> None:
        """Display all students in the database"""
        if not self.students:
            print("There are no students")
            return

        print("\nList of students:")
        for i, student in enumerate(self.students):
            print(f"{i}. {student}")


def task1():
    db = StudentDatabase()

    sample_data = [
        Student("Иванов", "Ленина", "12", "45"),
        Student("Петров", "Гагарина", "5", "78"),
        Student("Сидоров", "Ленина", "12", "23"),
        Student("Смирнов", "Пушкина", "7", "15"),
        Student("Козлов", "Гагарина", "5", "32")
    ]

    while True:
        print("\n===== МЕНЮ =====")
        print("1. Добавить ученика")
        print("2. Сохранить в CSV")
        print("3. Загрузить из CSV")
        print("4. Сохранить в Pickle")
        print("5. Загрузить из Pickle")
        print("6. Показать всех учеников")
        print("7. Подсчитать учеников по улице")
        print("8. Найти учеников по номеру дома")
        print("9. Заполнить примерными данными")
        print("0. Выход")

        choice = input("Выберите опцию: ")

        if choice == "1":
            surname = input("Введите фамилию: ")
            street = input("Введите улицу: ")
            house = input("Введите номер дома: ")
            apartment = input("Введите номер квартиры: ")
            db.add_student(Student(surname, street, house, apartment))
            print("Ученик успешно добавлен.")

        elif choice == "2":
            db.save_to_csv()

        elif choice == "3":
            db.load_from_csv()
            db.display_all_students()

        elif choice == "4":
            db.save_to_pickle()

        elif choice == "5":
            db.load_from_pickle()
            db.display_all_students()

        elif choice == "6":
            db.display_all_students()

        elif choice == "7":
            street = input("Введите название улицы: ")
            count = db.count_students_on_street(street)
            print(f"На улице {street} живет {count} учеников.")

        elif choice == "8":
            house = input("Введите номер дома: ")
            students_in_house = db.find_students_by_house(house)
            if students_in_house:
                print(f"\nУченики, живущие в доме номер {house}:")
                for i, student in enumerate(students_in_house, 1):
                    print(f"{i}. {student}")
            else:
                print(f"В доме номер {house} не живет ни один ученик.")

        elif choice == "9":
            db.students = sample_data.copy()
            print("Примерные данные добавлены в базу данных.")
            db.display_all_students()

        elif choice == "0":
            print("Программа завершена.")
            break

        else:
            print("Неверный выбор. Попробуйте еще раз.")
