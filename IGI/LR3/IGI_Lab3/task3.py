"""
Module for processing and analyzing text strings.
Contains functions for counting characters between specific markers.
"""


def count_chars_between_markers(text):
    """
    Count characters between specified markers in a text string.
    
    Args:
        text: The input text to analyze
        
    Returns:
        Total number of characters between all pairs of start and end markers
    """
    count = 0
    end_index = 0

    while True:
        start_index = text.find("f", end_index)
        if start_index == -1:
            break

        end_index = text.find("y", start_index)
        if end_index == -1:
            break

        # Count characters between markers (excluding the markers themselves)
        count += end_index - start_index - 1

    return count


def task3():
    """
    Process a user-provided string to count characters between 'f' and 'y'.
    
    Prompts the user for input and displays the result of counting
    characters between 'f' and 'y' markers.
    """
    line = input("Enter string to process: ")
    result = count_chars_between_markers(line)
    print(f"Count of characters in string between 'f' and 'y': {result}")