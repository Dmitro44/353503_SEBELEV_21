"""
Module for calculating and displaying mathematical series.
Contains functions for series approximation, table formatting, and user interaction.
"""


def calculate_series(x, eps, exact):
    """
    Calculate series approximation with required accuracy.
    
    Computes the sum of the geometric series 1 + x + x^2 + x^3 + ...
    until the error compared to exact value falls below eps.
    
    Args:
        x: The value of the variable in the series
        eps: The required accuracy (maximum error)
        exact: The exact value for error comparison
        
    Returns:
        tuple: (result of series approximation, number of terms used)
    """
    result = 0
    term = 1
    n = 0

    while n == 0 or abs(exact - result) > eps:
        result += term
        n += 1
        term *= x

        if n >= 500:
            print("Warning: Maximum iteration count reached!")
            break

    return result, n


def print_table_header():
    """
    Print the table header for results display.
    
    Formats and prints a header for the calculation results table.
    """
    print("\n{:<8} | {:<8} | {:<15} | {:<15} | {:<15}".format(
        "x", "n", "F(x)", "Math F(x)", "epsilon"))
    print("-" * 70)


def print_table_row(x, n, series_result, exact_result, error):
    """
    Print a row of the results table.
    
    Args:
        x: The input value
        n: Number of terms used
        series_result: Result from the series approximation
        exact_result: Exact mathematical result
        error: Absolute error between approximation and exact result
    """
    print("{:<8.4f} | {:<8d} | {:<15.10f} | {:<15.10f} | {:<15.10e}".format(
        x, n, series_result, exact_result, error))


def task1():
    """
    Demonstrate series approximation for the geometric series sum 1/(1-x).
    
    Prompts for user input of x and required accuracy, then calculates and displays
    the series approximation, exact value, and error in a formatted table.
    """
    x = 0
    eps = 0

    while True:
        try:
            x = float(input("Enter value of x (must be |x| < 1): "))
        except ValueError:
            print("Invalid input!")
            continue

        if abs(x) >= 1:
            print(f"Series diverges when |x| >= 1. The provided value |{x}| >= 1.")
            continue
        break

    while True:
        try:
            eps = float(input("Enter accuracy of calculations: "))
        except ValueError:
            print("Invalid input!")
            continue
        break

    exact_result = 1 / (1 - x)
    series_result, term_used = calculate_series(x, eps, exact_result)

    error = abs(exact_result - series_result)

    print_table_header()
    print_table_row(x, term_used, series_result, exact_result, error)
