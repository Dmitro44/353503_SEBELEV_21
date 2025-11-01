import numpy as np


class Matrix:

    def __init__(self, rows=0, cols=0, matrix=None):
        """Initialize the matrix with dimensions or existing data"""
        if matrix is not None:
            self.data = matrix
        else:
            self.data = np.zeros((rows, cols))

    @classmethod
    def create_random(cls, rows, cols, min_val=0, max_val=100):
        """Create a matrix with random integer values"""
        matrix = np.random.randint(min_val, max_val, size=(rows, cols))
        return cls(matrix=matrix)

    def get_row(self, index):
        """Get a specific row from the matrix"""
        return self.data[index, :]

    def sort_row(self, index):
        """Sort a specific row in ascending order"""
        self.data[index, :] = np.sort(self.data[index, :])
        return self.data[index, :]

    def calculate_median(self, row_index):
        """Calculate the median of a specific row using custom implementation"""
        row = self.get_row(row_index)
        return StatisticsHelper.custom_median(row)

    def __str__(self):
        """String representation of the matrix"""
        return str(self.data)


class StatisticsHelper:

    @staticmethod
    def custom_median(arr):
        """Calculate the median of an array without using built-in functions"""
        # Create a copy and sort the array
        sorted_arr = np.sort(arr.copy())
        n = len(sorted_arr)

        # If the number of elements is even
        if n % 2 == 0:
            return (sorted_arr[n // 2 - 1] + sorted_arr[n // 2]) / 2
        # If the number of elements is odd
        else:
            return sorted_arr[n // 2]

    @staticmethod
    def compare_values(val1, val2, tolerance=1e-9):
        """Compare two numerical values with a tolerance"""
        return np.isclose(val1, val2, rtol=tolerance)


def task5():
    # Get matrix dimensions directly in task5
    while True:
        try:
            n = int(input("Enter the number of rows (n): "))
            m = int(input("Enter the number of columns (m): "))

            if n <= 0 or m <= 0:
                print("Matrix dimensions must be positive numbers")
                continue
            break
        except ValueError:
            print("Error: please enter an integer")

    # Create a random matrix
    matrix = Matrix.create_random(n, m)

    print("\nOriginal matrix:")
    print(matrix)

    # 1. Sort the last row of the matrix in ascending order
    print("\n1. Last row before sorting:")
    print(matrix.get_row(-1))

    # Sort the last row
    sorted_row = matrix.sort_row(-1)

    print("\nMatrix after sorting the last row:")
    print(matrix)

    # 2. Calculate the median of the sorted last row
    # Method 1: Using the built-in numpy function
    median_numpy = np.median(sorted_row)
    print(f"\n2. Median of the last row (numpy.median): {median_numpy}")

    # Method 2: Using our custom implementation
    median_custom = matrix.calculate_median(-1)
    print(f"   Median of the last row (custom function): {median_custom}")

    # Verify the results
    if StatisticsHelper.compare_values(median_numpy, median_custom):
        print("\nResults from both methods match.")
    else:
        print("\nWarning! Results from the median calculation methods differ!")
