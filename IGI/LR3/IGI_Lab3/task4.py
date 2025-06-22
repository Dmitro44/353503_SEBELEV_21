"""
Module for text analysis functions.
Contains functions to analyze text content in different ways.
"""


def calculate_words_in_quotation(text):
    """
    Count the number of words contained within quotation marks (« and »).

    Args:
        text: The input text to analyze

    Returns:
        Total number of words found within all quotation marks
    """
    end_index = 0
    count = 0

    while True:
        start_index = text.find("«", end_index)
        if start_index == -1:
            break

        end_index = text.find("»", start_index)
        if end_index == -1:
            break

        words = text[start_index + 1: end_index].split()
        count += len(words)

    return count


def get_phrases_between_commas(text):
    """
    Extract phrases separated by commas and return them in alphabetical order.

    Args:
        text: The input text to split by commas

    Returns:
        A sorted list of phrases with whitespace stripped
    """
    phrases = [phrase.strip() for phrase in text.split(",")]

    return sorted(phrases)


def get_num_of_letter_rep(text):
    """
    Count the frequency of each letter in the provided text.
    Non-alphabetic characters are ignored.

    Args:
        text: The input text to analyze

    Returns:
        A dictionary mapping each letter to its frequency count
    """
    dict_of_letters = dict()

    for letter in text:
        if letter.isalpha():
            if letter in dict_of_letters:
                dict_of_letters[letter] += 1
            else:
                dict_of_letters[letter] = 1
        else:
            continue

    return dict_of_letters


def task4():
    """
    Demonstrate the text analysis functions with an example text.

    Prints:
    - Word count in quotation marks
    - Letter frequency analysis
    - Comma-separated phrases in alphabetical order
    """
    text = ("«So she was considering in her own mind, as well as she could, for the hot day made her feel "
            "very sleepy and stupid, whether the pleasure of making a daisy-chain would be worth the trouble "
            "of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.»")

    print(f"Number of words in quotation: {calculate_words_in_quotation(text)}")

    letter_counts = get_num_of_letter_rep(text)

    print("\nLetter frequencies:")
    for letter, count in sorted(letter_counts.items()):
        print(f"{letter}: {count}")

    print("\nPhrases in alphabet order:")
    for phrase in get_phrases_between_commas(text):
        print(phrase)