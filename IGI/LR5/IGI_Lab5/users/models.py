from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    ROLE_CHOICES = (
        ('staff', 'Сотрудник'),
        ('client', 'Клиент'),
        ('admin', 'Администратор')
    )

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='client',
        verbose_name='Роль'
    )

    email = models.EmailField(unique=True, verbose_name='Электронная почта')

    last_name = models.CharField(max_length=100, verbose_name='Фамилия')
    first_name = models.CharField(max_length=100, verbose_name='Имя')
    middle_name = models.CharField(max_length=100, verbose_name='Отчество')

    date_of_birth = models.DateField(null=True, blank=True, verbose_name='Дата рождения')

    phone_regex = RegexValidator(
        regex=r'^\+37529\d{7}',
        message="Номер телефона должен быть в формате: '+37529XXXXXXX'."
    )

    phone = models.CharField(
        validators=[phone_regex],
        max_length=13,
        verbose_name='Телефон'
    )

    address = models.CharField(verbose_name='Адрес проживания')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return f"{self.last_name} {self.first_name} {self.middle_name}"

    def has_role(self, role):
        return self.role == role
