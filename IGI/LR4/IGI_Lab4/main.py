"""
Lab Work № 4
Version: 1.0
Developer: Sebelev Dmitry
Develop date: 23.04.2025
"""

from task1.task1 import task1
from task2.task2 import task2
from task3.task3 import task3
from task4.task4 import task4
from task5.task5 import task5
from task6.task6 import task6

def print_menu():
    print("\n===============================")
    print("ЛАБОРАТОРНАЯ РАБОТА №4")
    print("===============================")
    print("\nВыберите задание для выполнения:")
    print("1. Задание 1")
    print("2. Задание 2")
    print("3. Задание 3")
    print("4. Задание 4")
    print("5. Задание 5")
    print("6. Задание 6")
    print("0. Выход из программы")
    print("-------------------------------")


def main():
    while True:
        print_menu()

        try:
            choice = input("Введите номер задания (0-6): ")

            if choice == "0":
                print("Завершение программы...")
                break

            elif choice == "1":
                print("\nЗапуск задания 1...")
                task1()

            elif choice == "2":
                print("\nЗапуск задания 2...")
                task2()

            elif choice == "3":
                print("\nЗапуск задания 3...")
                task3()

            elif choice == "4":
                print("\nЗапуск задания 4...")
                task4()

            elif choice == "5":
                print("\nЗапуск задания 5...")
                task5()

            elif choice == "6":
                print("\nЗапуск задания 6...")
                task6()

            else:
                print("Ошибка: Введите число от 0 до 6!")

            input("\nНажмите Enter для возврата в меню...")

        except Exception as e:
            print(f"Произошла ошибка: {str(e)}")


if __name__ == "__main__":
    main()
