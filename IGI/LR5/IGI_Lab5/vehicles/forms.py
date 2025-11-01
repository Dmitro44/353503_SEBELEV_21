from django import forms
from vehicles.models import Vehicle


class VehicleForm(forms.ModelForm):
    class Meta:
        model = Vehicle
        fields = [
            'license_plate',
            'car_model',
            'year',
            'car_price',
            'daily_rental_price',
            'is_available',
            'car_park',
            'image'
        ]

        widgets = {
            'license_plate': forms.TextInput(attrs={'class': 'form-control'}),
            'year': forms.NumberInput(attrs={'class': 'form-control'}),
            'image': forms.ClearableFileInput(attrs={'class': 'form-control'}),
            'car_price': forms.NumberInput(attrs={'class': 'form-control'}),
            'daily_rental_price': forms.NumberInput(attrs={'class': 'form-control'}),
        }

        labels = {
            'license_plate': 'Гос. номер',
            'car_model': 'Модель автомобиля',
            'year': 'Год выпуска',
            'car_price': 'Стоимость автомобиля',
            'daily_rental_price': 'Стоимость проката в день',
            'is_available': 'Доступен для проката',
            'car_park': 'Автопарк',
            'image': 'Изображение автомобиля',
        }

        help_texts = {
            'license_plate': 'Введите государственный номер автомобиля',
            'year': 'Год выпуска автомобиля',
            'is_available': 'Отметьте, если автомобиль доступен для проката',
            'image': 'Загрузите изображение автомобиля (рекомендуемый размер: 800x600)',
        }