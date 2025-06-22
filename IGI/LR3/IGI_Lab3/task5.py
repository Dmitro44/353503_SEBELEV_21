import task5_sequence_init as seq_init


def logging_decorator(func):
    """
    Decorator that logs function calls, its arguments, and the result.
    """
    def wrapper(*args, **kwargs):
        args_repr = [repr(a) for a in args]
        kwargs_repr = [f"{k}={v!r}" for k, v in kwargs.items()]
        signature = ", ".join(args_repr + kwargs_repr)

        print(f"\n[LOG] Вызов функции {func.__name__}({signature})")
        result = func(*args, **kwargs)
        print(f"[LOG] Функция {func.__name__} вернула {result!r}")

        return result
    return wrapper


@logging_decorator
def find_max_abs(nums):
    """
    Finds the element with the maximum absolute value in the list.

    Args:
        nums (list): List of numbers

    Returns:
        float or int: The element with the maximum absolute value
        None: If the list is empty
    """
    return max(abs(x) for x in nums)


@logging_decorator
def get_sum_between_neg(nums):
    """
    Calculates the sum of elements between the first and second negative numbers in the list.

    Args:
        nums (list): List of numbers

    Returns:
        float or int: Sum of elements between the first and second negative elements
        None: If the list contains fewer than two negative numbers
    """
    start_index = -1
    end_index = -1

    for i, num in enumerate(nums):
        if num < 0:
            if start_index == -1:
                start_index = i
            elif end_index == -1:
                end_index = i
                break

    if start_index == -1 or end_index == -1:
        return None

    return sum(nums[start_index + 1: end_index])


def task5():
    sequence = []

    while True:
        print("\n=== SEQUENCE OPERATIONS MENU ===")
        print("1. Initialize sequence with positives between negatives")
        print("2. Initialize from user input")
        print("3. Find element with maximum absolute value")
        print("4. Find sum between first two negative elements")
        print("5. Display current sequence")
        print("0. Exit")

        choice = input("\nEnter your choice: ")

        if choice == '1':
            try:
                neg_start = float(input("Enter first negative value (will be made negative): "))
                pos_middle = float(input("Enter positive value for middle elements (will be made positive): "))
                neg_end = float(input("Enter second negative value (will be made negative): "))
                count = int(input("Enter count (minimum 3 for proper testing): "))
                sequence = seq_init.init_from_generator(
                    seq_init.sequence_with_positives_between_negatives,
                    neg_start, pos_middle, neg_end, max(3, count)
                )
                print(f"Sequence initialized: {sequence}")
            except ValueError:
                print("Invalid input. Please enter valid numbers.")

        elif choice == '2':
            sequence = seq_init.init_from_user_input()
            print(f"Sequence initialized: {sequence}")

        elif choice == '3':
            if sequence:
                result = find_max_abs(sequence)
                print(f"Element with maximum absolute value: {result}")
            else:
                print("Sequence is empty! Please initialize it first.")

        elif choice == '4':
            if sequence:
                result = get_sum_between_neg(sequence)
                if result is not None:
                    print(f"Sum between first two negative elements: {result}")
                else:
                    print("There are fewer than 2 negative elements in the sequence")
            else:
                print("Sequence is empty! Please initialize it first.")

        elif choice == '5':
            if sequence:
                print(f"Current sequence: {sequence}")
            else:
                print("Sequence is empty! Please initialize it first.")

        elif choice == '0':
            print("Exiting program.")
            break

        else:
            print("Invalid choice. Please try again.")

