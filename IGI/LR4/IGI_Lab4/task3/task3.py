from collections import Counter
import numpy as np
import matplotlib.pyplot as plt
from statistics import mean, median, mode, stdev, variance
import os


class Calculator:
    def __init__(self, x, eps):
        """Initialize Calculator with x value and required precision."""
        self.x = x
        self.eps = eps
        self.exact = 1 / (1 - x)  # Exact value of 1/(1-x)
        self.series_result = None  # Result of series calculation
        self.n_terms = None  # Number of terms used in series
        self.results_table = []  # Store intermediate results for plotting

    def calculate_series(self):
        """Calculate series approximation with required accuracy."""
        result = 0
        term = 1
        n = 0
        self.results_table = []  # Reset results table

        # 1 + x + x^2 + x^3 + ... = 1/(1-x) for |x| < 1
        while n == 0 or abs(self.exact - result) > self.eps:
            result += term

            # Store each intermediate result
            self.results_table.append({
                'n': n,
                'term': term,
                'sum': result,
                'exact': self.exact,
                'diff': abs(self.exact - result)
            })

            n += 1
            term *= self.x  # Next term is previous term * x

            if n >= 5000:  # Safety limit to prevent infinite loops
                print("Warning: Maximum iteration count reached!")
                break

        self.series_result = result
        self.n_terms = n
        return result, n

    def calculate_mean(self, data):
        """Calculate arithmetic mean of a sequence."""
        if not data:
            return 0
        return sum(data) / len(data)

    def calculate_median(self, data):
        """Calculate median value of a sequence."""
        if not data:
            return 0

        # Sort the data
        sorted_data = sorted(data)
        n = len(sorted_data)

        # Check if length is even or odd
        if n % 2 == 0:
            # If even, average the two middle values
            mid1 = sorted_data[n // 2 - 1]
            mid2 = sorted_data[n // 2]
            return (mid1 + mid2) / 2
        else:
            # If odd, return the middle value
            return sorted_data[n // 2]

    def calculate_mode(self, data):
        """Calculate mode (most common value) of a sequence."""
        if not data:
            return 0

        # Count occurrences of each value
        counter = Counter(data)

        # Find the most common value(s)
        most_common = counter.most_common()

        if not most_common:
            return 0

        # Check if there is a unique mode
        highest_count = most_common[0][1]
        modes = [val for val, count in most_common if count == highest_count]

        # Return first mode if there are multiple with same count
        return modes[0]

    def calculate_variance(self, data):
        """Calculate variance of a sequence."""
        if not data or len(data) <= 1:
            return 0

        # Calculate mean
        mean_value = self.calculate_mean(data)

        # Calculate sum of squared differences
        squared_diff_sum = sum((x - mean_value) ** 2 for x in data)

        # Return variance (mean of squared differences)
        return squared_diff_sum / (len(data) - 1)  # Using n-1 for sample variance

    def calculate_std_dev(self, data):
        """Calculate standard deviation of a sequence."""
        # Standard deviation is the square root of variance
        return np.sqrt(self.calculate_variance(data))

    def calculate_statistics(self):
        """Calculate statistical parameters for the sequence of terms."""
        if not self.results_table:
            self.calculate_series()

        # Extract the sequence of terms
        terms = [item['term'] for item in self.results_table]

        stats = {
            'mean': self.calculate_mean(terms),
            'median': self.calculate_median(terms),
            'mode': self.calculate_mode(terms),
            'variance': self.calculate_variance(terms),
            'std_dev': self.calculate_std_dev(terms)
        }

        return stats

    def create_plots(self, save_filename=None):
        """Create plots comparing series approximation with exact function."""
        if not self.results_table:
            self.calculate_series()

        # Generate x values for plotting the exact function
        x_vals = np.linspace(-0.99, 0.99, 100)  # Avoid x = 1 which causes division by zero
        exact_vals = [1 / (1 - x) for x in x_vals]

        # Calculate series approximation for multiple x values (same range)
        series_x = np.linspace(-0.99, 0.99, 100)
        series_y = []

        for x in series_x:
            # Calculate series for this x value with the same eps
            temp_calc = Calculator(x, self.eps)
            result, _ = temp_calc.calculate_series()
            series_y.append(result)

        # Extract data from results table for plotting the convergence of our main x
        sum_vals = [item['sum'] for item in self.results_table]

        # Create the plot
        plt.figure(figsize=(10, 6))

        # Plot exact function
        plt.plot(x_vals, exact_vals, 'b-', label='Exact: 1/(1-x)')

        # Plot series approximation for range of x values
        plt.plot(x_vals, series_y, 'r--', label='Series Approx.', alpha=0.7)

        # Highlight our specific x value calculation
        # x_points = [self.x] * len(sum_vals)
        # plt.scatter(x_points, sum_vals, color='darkred', s=10,
        #             label=f'Convergence at x={self.x}')

        # Connect the dots to show convergence at our specific x
        # plt.plot(x_points, sum_vals, 'r-', alpha=0.3)

        # # Add annotation for the final approximation
        # plt.annotate(f'Final: {self.series_result:.6f}\nTerms: {self.n_terms}',
        #              xy=(self.x, self.series_result),
        #              xytext=(self.x + 0.1, self.series_result),
        #              arrowprops=dict(facecolor='black', shrink=0.05, width=1.5))

        # Set up the rest of the plot
        plt.axhline(y=0, color='k', linestyle='-', alpha=0.3)  # x-axis
        plt.axvline(x=0, color='k', linestyle='-', alpha=0.3)  # y-axis
        plt.grid(True, linestyle='--', alpha=0.7)
        plt.title(f'Series Approximation of 1/(1-x), eps={self.eps}')
        plt.xlabel('x')
        plt.ylabel('f(x)')
        plt.legend()

        # Add statistical information
        # stats = self.calculate_statistics()
        # stats_text = (
        #     f"Statistics of terms:\n"
        #     f"Mean: {stats['mean']:.6f}\n"
        #     f"Median: {stats['median']:.6f}\n"
        #     f"Mode: {stats['mode']:.6f}\n"
        #     f"Variance: {stats['variance']:.6f}\n"
        #     f"Std Dev: {stats['std_dev']:.6f}"
        # )
        # plt.figtext(0.02, 0.02, stats_text, fontsize=10,
        #             bbox={'facecolor': 'white', 'alpha': 0.8, 'pad': 5})

        # Adjust the y-axis limits to better view the data
        plt.ylim(-10, 10)  # Adjust as needed

        # Save to file if requested
        if save_filename:
            plt.savefig(save_filename)
            print(f"Plot saved to {save_filename}")

    def display_results(self):
        """Display calculation results in tabular form."""
        if not self.results_table:
            self.calculate_series()

        print("\nResults Table:")
        print(f"{'n':>3} | {'Term':>12} | {'Sum':>12} | {'Exact':>12} | {'Difference':>12}")
        print("-" * 60)

        for item in self.results_table:
            print(f"{item['n']:3d} | {item['term']:12.8f} | {item['sum']:12.8f} | "
                  f"{item['exact']:12.8f} | {item['diff']:12.8f}")

        print("\nStatistics:")
        stats = self.calculate_statistics()
        print(f"Mean of terms: {stats['mean']:.8f}")
        print(f"Median of terms: {stats['median']:.8f}")
        print(f"Mode of terms: {stats['mode']:.8f}")
        print(f"Variance of terms: {stats['variance']:.8f}")
        print(f"Standard deviation of terms: {stats['std_dev']:.8f}")


def task3():
    print("Geometric series calculator for 1/(1-x)")
    print("The series is: 1 + x + x^2 + x^3 + ... (for |x| < 1)")

    x = 0
    eps = 0

    while True:
        try:
            x = float(input("Enter value of x (must be |x| < 1): "))
            if abs(x) >= 1:
                print(f"Series diverges when |x| >= 1. The provided value |{x}| >= 1.")
                continue
            break
        except ValueError:
            print("Invalid input!")

    while True:
        try:
            eps = float(input("Enter accuracy of calculations: "))
            if eps <= 0:
                print("Accuracy must be positive.")
                continue
            break
        except ValueError:
            print("Invalid input!")

    # Create calculator and perform calculations
    calculator = Calculator(x, eps)
    result, n_terms = calculator.calculate_series()

    # Display results
    print(f"\nResult of series calculation: {result}")
    print(f"Exact value (1/(1-x)): {calculator.exact}")
    print(f"Number of terms used: {n_terms}")
    print(f"Difference: {abs(calculator.exact - result)}")

    # Display table and statistics
    calculator.display_results()

    # Create and save plots
    calculator.create_plots("task3/series_plot.png")

    print("\nProgram execution completed successfully!")
