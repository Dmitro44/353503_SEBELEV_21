import os.path
import re
import zipfile
from datetime import datetime


class TextAnalyzer:
    def __init__(self, input_file: str):
        self.text = ""
        self.input_file = input_file
        self.output_file = "task2/output.txt"
        self.zip_file = "task2/output_zip.zip"
        self.results = {}

    @staticmethod
    def is_vowel(char):
        """Checks if a character is a vowel (Russian and English alphabets)."""
        return char.lower() in "аеёиоуыэюяaeiou"

    @staticmethod
    def is_consonant(char):
        """Checks if a character is a consonant (Russian and English alphabets)."""
        return char.lower() in "бвгджзйклмнпрстфхцчшщъьbcdfghjklmnpqrstvwxyz"

    def read_from_file(self, filename=None):
        """Reads text from the file"""
        if filename is not None:
            self.input_file = filename

        try:
            with open(self.input_file, "r", encoding='utf-8') as file:
                self.text = file.read()
                return True
        except FileNotFoundError:
            print(f"File {self.input_file} not found")
            return False
        except Exception as e:
            print(f"Error reading file: {e}")
            return False

    def find_dates(self):
        """Finds all dates in format 2007 (4-digit numbers) in the text."""
        return re.findall(r'\b\d{4}\b', self.text)

    def get_line_to_analyze(self, lines):
        """Prompts user to select a line number for analysis."""
        line_number = None
        line_to_analyze = None

        while line_number is None:
            try:
                print(f"There are {len(lines)} lines in file")
                line_number = int(input("Enter line number to analyze (starts with 1): "))

                if line_number < 1 or line_number > len(lines):
                    print(f"Error: line number should be from 1 to {len(lines)}")
                    line_number = None
                else:
                    line_to_analyze = lines[line_number - 1]
            except ValueError:
                print("Error: enter correct number")

        print(f"\nChoosed line: {line_to_analyze}")
        return line_to_analyze, line_number

    def extract_words(self, text):
        """Extracts all words from the text."""
        return re.findall(r'\b[А-Яа-яA-Za-z]+\b', text)

    def find_pattern_words(self, words):
        """Finds words with consonant as third from end and vowel as second from end."""
        pattern_words = []
        for word in words:
            if len(word) > 3:
                third_from_end = word[-3]
                penultimate = word[-2]
                if self.is_consonant(third_from_end) and self.is_vowel(penultimate):
                    pattern_words.append(word)
        return pattern_words

    def find_longest_word(self, words):
        """Finds the longest word and its index."""
        if words:
            longest_word = max(words, key=len)
            longest_word_index = words.index(longest_word) + 1  # +1 для порядкового номера с 1
            return longest_word, longest_word_index
        return "", 0

    def get_odd_words(self, words):
        """Gets words with odd ordinal positions."""
        return [words[i] for i in range(len(words)) if i % 2 == 0]

    def split_into_sentences(self):
        """Splits text into sentences."""
        sentences = re.split(r'(?<=[.!?])\s+|(?<=[.!?])$', self.text)
        sentences = [s.strip() for s in sentences if s.strip()]
        return sentences

    def count_sentence_types(self, sentences):
        """Counts the number of different types of sentences."""
        declarative = len([s for s in sentences if s.endswith('.')])
        interrogative = len([s for s in sentences if s.endswith('?')])
        imperative = len([s for s in sentences if s.endswith('!')])
        return declarative, interrogative, imperative

    def calculate_avg_sentence_length(self, sentences, total_sentences):
        """Calculates average sentence length in words."""
        words_in_sentences = [self.extract_words(s) for s in sentences]
        words_count = [len(words_in_sentence) for words_in_sentence in words_in_sentences]

        if total_sentences > 0:
            return sum(words_count) / total_sentences
        return 0

    def calculate_avg_word_length(self, words, total_words):
        """Calculates average word length in characters."""
        if total_words > 0:
            total_char_count = sum(len(word) for word in words)
            return total_char_count / total_words
        return 0

    def find_emoticons(self):
        """Finds emoticons in the text."""
        emoticons = re.findall(r'[;:]-*(?:\(+|\)+|\[+|]+)', self.text)
        return emoticons

    def analyze_text(self):
        """Analyzes text, combining results from other methods."""

        # Поиск дат
        self.results['dates'] = self.find_dates()

        # Разбиение на строки и выбор строки для анализа
        lines = self.text.splitlines()
        line_to_analyze, line_number = self.get_line_to_analyze(lines)

        # Анализ слов в выбранной строке
        words_in_line = self.extract_words(line_to_analyze)
        self.results["line_total_words"] = len(words_in_line)
        self.results["pattern_words"] = self.find_pattern_words(words_in_line)

        # Анализ всех слов в тексте
        all_words = self.extract_words(self.text)
        self.results["total_words"] = len(all_words)

        # Поиск самого длинного слова
        longest_word, longest_word_index = self.find_longest_word(all_words)
        self.results["longest_word"] = longest_word
        self.results["longest_word_index"] = longest_word_index

        # Выделение нечетных слов
        self.results["odd_words"] = self.get_odd_words(all_words)

        # Анализ предложений
        sentences = self.split_into_sentences()
        self.results["total_sentences"] = len(sentences)

        # Типы предложений
        declarative, interrogative, imperative = self.count_sentence_types(sentences)
        self.results["declarative_sentences"] = declarative
        self.results["interrogative_sentences"] = interrogative
        self.results["imperative"] = imperative

        # Средние значения
        self.results["avg_sentence_length"] = self.calculate_avg_sentence_length(
            sentences, self.results["total_sentences"])
        self.results["avg_word_length"] = self.calculate_avg_word_length(
            all_words, self.results["total_words"])

        # Поиск смайликов
        emoticons = self.find_emoticons()
        self.results["emoticons"] = emoticons
        self.results["emoticons_count"] = len(emoticons)

        # Информация о проанализированной строке
        self.results["analyzed_line"] = line_to_analyze
        self.results["line_number"] = line_number

        return self.results

    def save_results_to_file(self):
        """Saves analysis results to a file."""
        if not self.results:
            print("No analysis results to save.")
            return False

        try:
            with open(self.output_file, 'w', encoding='utf-8') as f:
                f.write("===== TEXT ANALYSIS RESULTS =====\n\n")

                f.write(f"Analyzed line (#{self.results['line_number']}):\n")
                f.write(f"{self.results['analyzed_line']}\n\n")

                f.write("1. Found dates (format 2007):\n")
                for date in self.results['dates']:
                    f.write(f"   - {date}\n")

                f.write(f"\n2. Selected line analysis:\n")
                f.write(f"   - Total words in line: {self.results['line_total_words']}\n")

                f.write(f"\n3. Words with consonant at 3rd from end and vowel at penultimate position:\n")
                for word in self.results['pattern_words']:
                    f.write(f"   - {word}\n")

                f.write(f"\n4. Longest word and its position in line:\n")
                f.write(f"   - Word: '{self.results['longest_word']}'\n")
                f.write(f"   - Position: {self.results['longest_word_index']}\n")

                f.write("\n5. Odd-positioned words in line:\n")
                for word in self.results['odd_words']:
                    f.write(f"   - {word}\n")

                f.write("\n===== GENERAL TEXT STATISTICS =====\n")
                f.write(f"\n6. Sentence statistics:\n")
                f.write(f"   - Total sentences: {self.results['total_sentences']}\n")
                f.write(f"   - Declarative sentences: {self.results['declarative_sentences']}\n")
                f.write(f"   - Interrogative sentences: {self.results['interrogative_sentences']}\n")
                f.write(f"   - Imperative sentences: {self.results['imperative']}\n")

                f.write(f"\n7. Average values:\n")
                f.write(f"   - Average sentence length: {self.results['avg_sentence_length']:.2f} words\n")
                f.write(f"   - Average word length: {self.results['avg_word_length']:.2f} characters\n")

                f.write(f"\n8. Emoticons:\n")
                f.write(f"   - Number of emoticons: {self.results['emoticons_count']}\n")
                for emoticon in self.results['emoticons']:
                    f.write(f"   - {emoticon}\n")

            return True
        except Exception as e:
            print(f"Error saving results: {e}")
            return False

    def create_zip(self):
        """Creates a ZIP archive with the specified file"""
        try:
            with zipfile.ZipFile(self.zip_file, 'w') as zipf:
                zipf.write(self.output_file, os.path.basename(self.output_file))

            with zipfile.ZipFile(self.zip_file, 'r') as zipf:
                info = zipf.getinfo(os.path.basename(self.output_file))
                return {
                    'filename': info.filename,
                    'compressed_size': info.compress_size,
                    'original_size': info.file_size,
                    'compression_ratio': 100 - (info.compress_size / info.file_size * 100) if info.file_size > 0 else 0,
                    "date_time": datetime(*info.date_time).strftime('%Y-%m-%d %H:%M:%S')
                }
        except Exception as e:
            print(f"Error creating ZIP file: {e}")
            return None

    def display_results(self, zip_info):
        """Displays analysis results and archive information."""
        print("\n===== ANALYSIS RESULTS =====")

        print("\nFound dates:")
        for date in self.results['dates']:
            print(f"- {date}")

        print(
            f"\nWords with consonant at 3rd from end and vowel at penultimate position in line #{self.results['line_number']}:")
        for word in self.results['pattern_words']:
            print(f"- {word}")

        print(f"\nTotal words in line #{self.results['line_number']}: {self.results['line_total_words']}")

        print(f"\nLongest word: '{self.results['longest_word']}', position: {self.results['longest_word_index']}")

        print("\nOdd-positioned words:")
        for word in self.results['odd_words']:
            print(f"- {word}")

        print("\n===== ANALYSIS COMPLETED =====")
        print(f"Results saved to file: {self.output_file}")
        print(f"Results file archived to: {self.zip_file}")

        if zip_info:
            print("\nInformation about file in archive:")
            print(f"- File name: {zip_info['filename']}")
            print(f"- Original size: {zip_info['original_size']} bytes")
            print(f"- Compressed size: {zip_info['compressed_size']} bytes")
            print(f"- Compression ratio: {zip_info['compression_ratio']:.2f}%")
            print(f"- Archive date: {zip_info['date_time']}")


def task2():
    analyzer = TextAnalyzer("task2/input.txt")

    if not analyzer.read_from_file():
        return

    analyzer.analyze_text()

    if not analyzer.save_results_to_file():
        return

    zip_info = analyzer.create_zip()
    analyzer.display_results(zip_info)
