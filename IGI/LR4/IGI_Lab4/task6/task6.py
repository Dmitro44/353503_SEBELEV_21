import pandas as pd
import numpy as np


class SeriesExplorer:

    def __init__(self):
        """Initialize the SeriesExplorer with example Series"""
        self.list_series = pd.Series([10, 20, 30, 40, 50], name="Sample Series")
        self.dict_series = pd.Series({'A': 100, 'B': 200, 'C': 300, 'D': 400}, name="Dictionary Series")

    def demonstrate_creation(self):
        """Demonstrate creating Series objects"""
        print("\nSeries created from a list:")
        print(self.list_series)

        print("\nSeries created from a dictionary:")
        print(self.dict_series)

    def demonstrate_access(self):
        """Demonstrate accessing Series elements"""
        print("\nUsing .loc (label-based):")
        print(self.dict_series.loc['A'])  # Access by label
        print(self.dict_series.loc['A':'C'])  # Slice by labels

        print("\nUsing .iloc (position-based):")
        print(self.dict_series.iloc[0])  # Access by position
        print(self.dict_series.iloc[0:2])  # Slice by positions


class DataFrameExplorer:

    def __init__(self, file_path):
        """Initialize the DataFrameExplorer with a DataFrame loaded from file"""
        # Set display options to show all columns without truncation
        pd.set_option('display.max_columns', None)
        pd.set_option('display.width', 1000)
        pd.set_option('display.expand_frame_repr', False)  # Prevents wrapping to multiple lines

        try:
            self.df = pd.read_csv(file_path)
            print(f"\nSuccessfully loaded dataset from {file_path}")
        except FileNotFoundError:
            print(f"\nFile not found: {file_path}")
            raise

    def display_head(self, n=5):
        """Display the first n rows of the DataFrame"""
        print(f"\nFirst {n} rows of the DataFrame:")
        print(self.df.head(n))

    def get_basic_info(self):
        """Get basic information about the DataFrame"""
        print("\nDataFrame Information:")
        print("\nDataFrame shape (rows, columns):", self.df.shape)
        print("\nDataFrame columns:", self.df.columns.tolist())
        print("\nDataFrame data types:")
        print(self.df.dtypes)

        print("\nBasic statistics for numerical columns:")
        # Using the describe method with include='all' to include all columns
        # and transpose for better readability
        desc_stats = self.df.describe()
        print(desc_stats)


class DataAnalyzer:

    def __init__(self, dataframe):
        """Initialize the DataAnalyzer with a DataFrame"""
        self.df = dataframe

    def compare_means_max_min(self, target_column, filter_column):
        """
        Compare the mean of target_column between groups with max and min values of filter_column
        """
        # Check if columns exist
        if target_column not in self.df.columns or filter_column not in self.df.columns:
            print(f"Error: One or both columns not found in DataFrame.")
            print(f"Available columns: {self.df.columns.tolist()}")
            return None

        # Find max and min values of filter column
        max_value = self.df[filter_column].max()
        min_value = self.df[filter_column].min()

        # Filter groups
        max_group = self.df[self.df[filter_column] == max_value]
        min_group = self.df[self.df[filter_column] == min_value]

        # Calculate means
        max_group_mean = max_group[target_column].mean()
        min_group_mean = min_group[target_column].mean()

        print(f"\nAnalysis of {target_column} based on {filter_column}:")
        print(f"Maximum {filter_column}: {max_value}")
        print(f"Minimum {filter_column}: {min_value}")
        print(f"Mean {target_column} for max {filter_column} group: {max_group_mean:.2f}")
        print(f"Mean {target_column} for min {filter_column} group: {min_group_mean:.2f}")

        # Calculate and return ratio
        if min_group_mean > 0:
            ratio = max_group_mean / min_group_mean
            print(f"Ratio (max group mean / min group mean): {ratio:.2f}")
            return ratio
        else:
            print(f"Cannot calculate ratio - division by zero")
            return None

    def mean_below_average(self, target_column, filter_column):
        """
        Calculate mean of target_column for records where filter_column is below its average
        """
        # Check if columns exist
        if target_column not in self.df.columns or filter_column not in self.df.columns:
            print(f"Error: One or both columns not found in DataFrame.")
            print(f"Available columns: {self.df.columns.tolist()}")
            return None

        # Calculate average of filter column
        filter_avg = self.df[filter_column].mean()

        # Filter records below average
        below_avg = self.df[self.df[filter_column] < filter_avg]

        # Calculate mean of target column for filtered records
        result = below_avg[target_column].mean()

        print(f"\nAnalysis of {target_column} for records with below-average {filter_column}:")
        print(f"Average {filter_column}: {filter_avg:.2f}")
        print(f"Number of records with below-average {filter_column}: {len(below_avg)}")
        print(f"Mean {target_column} for these records: {result:.2f}")

        return result

    def analyze_student_habits(self):
        """
        Perform specific analyses on student habits dataset
        """
        print("\nANALYSIS OF STUDENT HABITS AND PERFORMANCE")
        print("=" * 60)

        # Specific analyses based on the student_habits_performance.csv columns
        # Example 1: Compare exam scores between students with max and min study hours
        study_col = 'study_hours_per_day' if 'study_hours_per_day' in self.df.columns else None
        exam_col = 'exam_score' if 'exam_score' in self.df.columns else None

        if study_col and exam_col:
            print("\nExample 1: How much higher is the average exam score of students with the highest"
                  "study hours compared to those with the lowest study hours?")
            self.compare_means_max_min(exam_col, study_col)

        # Example 2: Find average mental health rating for students with below-average social media usage
        social_col = 'social_media_usage' if 'social_media_usage' in self.df.columns else None
        mental_col = 'mental_health_rating' if 'mental_health_rating' in self.df.columns else None

        if social_col and mental_col:
            print("\nExample 2: What is the average mental health rating of students whose")
            print("social media usage is below average?")
            self.mean_below_average(mental_col, social_col)

        # Find numeric columns for more general analyses if specific columns not found
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()

        if not (study_col and exam_col) and len(numeric_cols) >= 2:
            print("\nExample 1 (using available columns):")
            self.compare_means_max_min(numeric_cols[0], numeric_cols[1])

        if not (social_col and mental_col) and len(numeric_cols) >= 2:
            print("\nExample 2 (using available columns):")
            self.mean_below_average(numeric_cols[1], numeric_cols[0])


def task6():
    print("PANDAS LIBRARY EXPLORATION WITH STUDENT HABITS DATASET")
    print("=" * 60)

    # Part a: Series Exploration
    print("\nPART A: PANDAS LIBRARY AND BASIC STRUCTURES")
    print("-" * 60)

    print("1. Successfully imported pandas library")

    series_explorer = SeriesExplorer()
    print("\n2-3. Series Structure Demonstration:")
    series_explorer.demonstrate_creation()

    print("\n4. Accessing Series Elements:")
    series_explorer.demonstrate_access()

    # Part b: DataFrame Exploration and Analysis
    print("\n5. DataFrame Creation and Basic Operations:")

    try:
        # Change the filename to match your actual file
        df_explorer = DataFrameExplorer('task6/student_habits_performance.csv')
        df_explorer.display_head()

        print("\nPART B: BASIC OPERATIONS AND STATISTICAL ANALYSIS")
        print("-" * 60)

        df_explorer.get_basic_info()

        # Perform data analysis
        analyzer = DataAnalyzer(df_explorer.df)
        analyzer.analyze_student_habits()

    except FileNotFoundError:
        print("Program cannot continue without the dataset.")

    print("\nAnalysis complete!")
