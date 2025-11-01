"""
Module for sequence initialization methods.
Contains functions to initialize sequences through different methods.
"""


def init_from_generator(generator_func, *args):
    """
    Create a sequence using a generator function.

    Args:
        generator_func: The generator function to use
        *args: Arguments to pass to the generator function

    Returns:
        The newly created sequence as a list from the generator
    """
    return list(generator_func(*args))


def init_from_user_input():
    """
    Create a sequence from user input.

    Returns:
        The newly created sequence
    """
    try:
        user_input = input("Enter numbers separated by spaces: ")
        return [float(x) for x in user_input.split()]
    except ValueError:
        print("Error! Please enter valid numbers.")
        return init_from_user_input()  # Recursively try again


def sequence_with_positives_between_negatives(neg_start, pos_middle, neg_end, count):
    """
    Generate a sequence with guaranteed negative numbers at certain positions
    and positive numbers between them using a true generator.

    Args:
        neg_start: Value for the first negative number
        pos_middle: Positive value to use for numbers between negatives
        neg_end: Value for the second negative number
        count: Total number of elements in the sequence

    Yields:
        Elements of the sequence with negative numbers at positions 0 and count-1,
        and positive numbers in between.
    """
    if count < 3:
        # If count is less than 3, we can't have 2 negatives with positives in between
        yield -abs(neg_start)
        if count > 1:
            yield -abs(neg_end)
        return

    # First element is negative
    yield -abs(neg_start)

    # Middle elements are positive
    for i in range(1, count - 1):
        # Can add some variety with different positive values if desired
        yield abs(pos_middle) * (i + 1) / count

    # Last element is negative
    yield -abs(neg_end)
