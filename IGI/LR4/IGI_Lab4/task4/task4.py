import json
import math
from abc import ABC, abstractmethod
from matplotlib import patches, pyplot as plt


class AbstractShape(ABC):

    def __init__(self, color):
        self.fig_color = ShapeColor()
        self.fig_color.color = color

    @abstractmethod
    def calc_area(self):
        """Calculates the area of shape"""
        pass

    @abstractmethod
    def get_name(self):
        """Returns the name of shape"""
        pass

    @abstractmethod
    def draw(self, ax):
        """Draws shape"""
        pass


class ShapeColor:

    def __init__(self):
        self._color = ""

    def getColor(self):
        """Returns the color of shape"""
        return self._color

    def setColor(self, value):
        """Sets the color of shape"""
        allowed_colors = ['red', 'green', 'blue', 'yellow', 'black',
                          'purple', 'orange', 'cyan', 'magenta', 'brown']

        if isinstance(value, str):
            if value.lower() in allowed_colors or value.startswith("#"):
                self._color = value.lower()
            else:
                print(f"Warning: Color '{value}' may not be recognised")
                print(f"Recommended colors: {', '.join(allowed_colors)}")
        else:
            raise ValueError("Color should be a string")

    def delColor(self):
        """Deletes the color of shape"""
        del self._color

    color = property(getColor, setColor, delColor, "Figure color property")


class SerializableMixin:

    def to_dict(self):
        result = {
            'type': self.__class__.__name__,
            'area': self.calc_area(),
            'name': self.get_name()
        }

        if hasattr(self, 'fig_color') and hasattr(self.fig_color, 'color'):
            result['color'] = self.fig_color.color

        # Add all public attributes (those not starting with _)
        for attr in dir(self):
            # Skip methods, private attributes, and already included attributes
            if (not attr.startswith('_') and
                    not callable(getattr(self, attr)) and
                    attr not in ['fig_color', 'figure_name']):
                result[attr] = getattr(self, attr)

        return result

    def to_json(self, indent=2):
        """Convert shape to a JSON string"""
        return json.dumps(self.to_dict(), indent=indent)

    def save_json(self, filename):
        """Save the shape data to a JSON file"""
        with open(filename, 'w') as f:
            f.write(self.to_json())
        return filename

    @classmethod
    def from_dict(cls, data):
        """Creates a shape instance from dictionary data"""
        raise NotImplementedError("Subclasses should implement this method")


class Parallelogram(AbstractShape, SerializableMixin):
    figure_name = "Parallelogram"

    def __init__(self, a, b, angle, color):

        if a <= 0 or b <= 0:
            raise ValueError("Sides should be positive numbers")
        if angle <= 0 or angle >= 180:
            raise ValueError("Angle should be from 0 to 180 degrees")

        self.a = a
        self.b = b
        self.angle = angle
        super().__init__(color)

    def calc_area(self):
        angle_radians = math.radians(self.angle)
        return self.a * self.b * math.sin(angle_radians)

    def get_name(self):
        return self.figure_name

    def draw(self, ax):
        # Координаты вершин параллелограмма
        angle_rad = math.radians(self.angle)

        # Рассчитываем высоту для масштабирования
        height = self.b * math.sin(angle_rad)

        # Создаем точки для параллелограмма
        x = [0, self.a, self.a + self.b * math.cos(angle_rad), self.b * math.cos(angle_rad)]
        y = [0, 0, height, height]

        # Рисуем параллелограмм
        polygon = patches.Polygon(xy=list(zip(x, y)), closed=True,
                                  fill=True, color=self.fig_color.color, alpha=0.7)
        ax.add_patch(polygon)

        # Устанавливаем границы отображения
        margin = max(self.a, self.b) * 0.2  # Добавляем отступ 20%
        ax.set_xlim(-margin, self.a + self.b * math.cos(angle_rad) + margin)
        ax.set_ylim(-margin, height + margin)

        # Добавляем метки на точках
        ax.text(0, 0, "A", fontsize=12, ha='right', va='top')
        ax.text(self.a, 0, "B", fontsize=12, ha='left', va='top')
        ax.text(self.a + self.b * math.cos(angle_rad), height, "C",
                fontsize=12, ha='left', va='bottom')
        ax.text(self.b * math.cos(angle_rad), height, "D",
                fontsize=12, ha='right', va='bottom')

        # Рисуем оси
        ax.set_xlabel("X")
        ax.set_ylabel("Y")
        ax.grid(True, linestyle='--', alpha=0.7)

        # Делаем оси равными для лучшего восприятия
        ax.set_aspect('equal')

    def __str__(self):
        """Returns string with description of parallelogram"""
        return "{color} {name} with {a:.2f} and {b:.2f} sides, {angle} angle and {area} area".format(
            color=self.fig_color.color.capitalize(),
            name=self.get_name(),
            a=self.a,
            b=self.b,
            angle=self.angle,
            area=self.calc_area()
        )

    @classmethod
    def from_dict(cls, data):
        """Create parallelogram from dictionary data"""
        if data.get('type') != 'Parallelogram':
            raise ValueError(f"Cannot create Parallelogram from {data.get('type')} data")

        a = data.get('a')
        b = data.get('b')
        angle = data.get('angle')
        color = data.get('color')

        if None in (a, b, angle):
            raise ValueError("Missing required parameters in dict")

        return cls(a, b, angle, color)


def validate_float_input(prompt, min_value=0):
    """Checking the input of a floating-point number"""
    while True:
        try:
            value = float(input(prompt))
            if value <= min_value:
                print(f"Error: value should be greater than {min_value}")
                continue
            return value
        except ValueError:
            print("Error: enter correct number")


def validate_angle_input(prompt):
    """Checking the angle input in degrees"""
    while True:
        try:
            value = float(input(prompt))
            if value <= 0 or value >= 180:
                print("Error: angle should be from 0 to 180 degrees")
                continue
            return value
        except ValueError:
            print("Error: enter correct number")


def validate_color_input(prompt):
    """Checking the color input"""
    allowed_colors = ['red', 'green', 'blue', 'yellow', 'black',
                      'purple', 'orange', 'cyan', 'magenta', 'brown']

    print(f"Allowed colors: {', '.join(allowed_colors)} or any other acceptable CSS format.")

    while True:
        color = input(prompt).strip().lower()
        if not color:
            print("Error: color can't be empty")
            continue
        return color


def task4():
    a = validate_float_input("Enter length of first side (a): ", 0)
    b = validate_float_input("Enter length of second side (b): ", 0)
    angle = validate_angle_input("Enter angle between sides in degrees (0 < angle < 180): ")
    color = validate_color_input("Enter color of parallelogram: ")

    try:
        parallelogram = Parallelogram(a, b, angle, color)

        # Выводим информацию о фигуре
        print("\nInfo about shape:")
        print(parallelogram)

        json_filename = f"task4/parallelogram_{a}_{b}_{angle}.json"
        parallelogram.save_json(json_filename)
        print(f"Shape data saved to file: {json_filename}")

        print("\nJSON representation of the shape:")
        print(parallelogram.to_json())

        print("\nDeserialization testing...")
        with open(json_filename, 'r') as f:
            loaded_data = json.load(f)
        p_loaded = Parallelogram.from_dict(loaded_data)
        print(f"Uploaded shape: {p_loaded}")
        print(f"Does it match the original: {p_loaded.calc_area() == parallelogram.calc_area()}")

        # Отображаем фигуру
        fig, ax = plt.subplots(figsize=(8, 6))
        parallelogram.draw(ax)

        # Сохраняем изображение в файл
        filename = f"task4/parallelogram_{a}_{b}_{angle}.png"
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        print(f"Image saved in file: {filename}")

    except ValueError as e:
        print(f"Error: {e}")
