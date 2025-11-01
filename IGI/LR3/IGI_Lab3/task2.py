"""
Module for calculating sum of user-entered numbers.
Contains functions for numeric input processing.
"""


def calculate_sum_until_negative():
    """
    Calculate the sum of numbers entered by user until a negative number is entered.
    
    Takes numerical input from user repeatedly until a negative number is entered.
    Negative number is not included in the sum.
    
    Returns:
        The sum of all non-negative numbers entered
    """
    total_sum = 0

    while True:
        try:
            num = int(input("Enter a number: "))

            if num < 0:
                break

            total_sum += num
            print(f"Amount of numbers: {total_sum}")
        except ValueError:
            print("Error! Please enter a valid integer.")

    return total_sum


def task2():
    """
    Demonstrate number summing functionality.
    
    Calls the calculate_sum_until_negative function and displays the final result.
    """
    sum_result = calculate_sum_until_negative()
    print(f"Amount of numbers: {sum_result}")