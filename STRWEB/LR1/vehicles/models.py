from django.db import models


class BodyType(models.Model):
    name = models.CharField(max_length=50, verbose_name='Тип кузова')
    description = models.TextField(blank=True, verbose_name='Описание')

    class Meta:
        verbose_name = 'Тип кузова'
        verbose_name_plural = 'Типы кузова'

    def __str__(self):
        return self.name


class CarModel(models.Model):
    brand = models.CharField(max_length=100, verbose_name='Марка')
    model = models.CharField(max_length=100, verbose_name='Модель')
    body_type = models.ForeignKey(BodyType, on_delete=models.CASCADE, related_name='car_models', verbose_name='Тип кузова')

    class Meta:
        verbose_name = 'Модель автомобиля'
        verbose_name_plural = 'Модели автомобиля'

    def __str__(self):
        return f"{self.brand} {self.model}"


class CarPark(models.Model):
    name = models.CharField(max_length=100, verbose_name='Название парка')
    address = models.CharField(verbose_name='Адрес')

    class Meta:
        verbose_name = 'Автопарк'
        verbose_name_plural = 'Автопарки'

    def __str__(self):
        return self.name


class Vehicle(models.Model):
    license_plate = models.CharField(max_length=20, unique=True, verbose_name='Гос. номер')
    car_model = models.ForeignKey(CarModel, on_delete=models.CASCADE, related_name='vehicles', verbose_name='Модель')
    year = models.PositiveIntegerField(verbose_name='Год выпуска')
    car_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='Стоимость автомобиля')
    daily_rental_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Суточная стоимость проката')
    car_park = models.ForeignKey(CarPark, on_delete=models.CASCADE, related_name='vehicles', verbose_name='Автопарк')
    is_available = models.BooleanField(default=True, verbose_name='Доступен для проката')
    image = models.ImageField(upload_to='vehicles/', blank=True, null=True, verbose_name='Изображение автомобиля')

    class Meta:
        verbose_name = 'Автомобиль'
        verbose_name_plural = 'Автомобили'

    def __str__(self):
        return f"{self.car_model} ({self.license_plate})"
