"""
Lab Work № 3
Title: Standard data types, collections, functions, modules
Version: 1.0
Developer: Sebelev Dmitry
Develop date: 26.03.2025
"""

from task1 import task1
from task2 import task2
from task3 import task3
from task4 import task4
from task5 import task5


def main():
    while True:
        print("\n=== Laboratory Work №3 ===")
        print("1. Task 1")
        print("2. Task 2")
        print("3. Task 3")
        print("4. Task 4")
        print("5. Task 5 (Sequence Operations)")
        print("0. Exit")

        choice = input("\nSelect a task to run: ")

        if choice == '1':
            print("\n--- Running Task 1 ---")
            task1()
            input("\nPress Enter to return to the main menu...")
        elif choice == '2':
            print("\n--- Running Task 2 ---")
            task2()
            input("\nPress Enter to return to the main menu...")
        elif choice == '3':
            print("\n--- Running Task 3 ---")
            task3()
            input("\nPress Enter to return to the main menu...")
        elif choice == '4':
            print("\n--- Running Task 4 ---")
            task4()
            input("\nPress Enter to return to the main menu...")
        elif choice == '5':
            print("\n--- Running Task 5 (Sequence Operations) ---")
            task5()
        elif choice == '0':
            print("Exiting the program.")
            break
        else:
            print("Invalid choice. Please select one of the menu options.")
            input("\nPress Enter to continue...")


if __name__ == "__main__":
    main()
