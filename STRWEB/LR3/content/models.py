from django.db import models
from django.utils import timezone
from users.models import User

class Article(models.Model):
    """Model for news articles"""
    title = models.CharField(max_length=200, verbose_name='Заголовок')
    content = models.TextField(verbose_name='Содержание')
    summary = models.CharField(max_length=255, verbose_name='Краткое содержание')
    image = models.ImageField(upload_to='articles/', blank=True, null=True, verbose_name='Изображение')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    published = models.BooleanField(default=False, verbose_name='Опубликовано')
    published_at = models.DateTimeField(blank=True, null=True, verbose_name='Дата публикации')
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Автор", related_name='articles')
    
    class Meta:
        verbose_name = 'Статья'
        verbose_name_plural = 'Статьи'
        ordering = ['-published_at', '-created_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if self.published and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)


class CompanyInfo(models.Model):
    """Model for company information"""
    name = models.CharField(max_length=100, verbose_name='Название компании')
    description = models.TextField(verbose_name='Описание')
    address = models.CharField(max_length=255, verbose_name='Адрес')
    phone = models.CharField(max_length=20, verbose_name='Телефон')
    email = models.EmailField(verbose_name='Email')
    logo = models.ImageField(upload_to='company/', blank=True, null=True, verbose_name='Логотип')
    working_hours = models.CharField(max_length=100, verbose_name='Часы работы')
    video_url = models.URLField(blank=True, null=True, verbose_name='Видео о компании')
    history = models.TextField(blank=True, null=True, verbose_name='История компании')
    requisites = models.TextField(blank=True, null=True, verbose_name='Реквизиты')
    certificate_issue_date = models.DateField(blank=True, null=True, verbose_name='Дата выдачи сертификата')
    certificate_expiry_date = models.DateField(blank=True, null=True, verbose_name='Дата окончания сертификата')
    
    class Meta:
        verbose_name = 'Информация о компании'
        verbose_name_plural = 'Информация о компании'
    
    def __str__(self):
        return self.name


class CertificateDetail(models.Model):
    """Model for certificate details"""
    DETAIL_TYPE_CHOICES = (
        ('text', 'Текст'),
        ('inn', 'ИНН'),
        ('reg', 'Регистрационный номер'),
    )
    company = models.ForeignKey(CompanyInfo, on_delete=models.CASCADE, related_name='certificate_details', verbose_name='Компания')
    text = models.CharField(max_length=255, verbose_name='Текст детали')
    order = models.PositiveIntegerField(default=0, verbose_name='Порядок')
    detail_type = models.CharField(max_length=10, choices=DETAIL_TYPE_CHOICES, default='text', verbose_name='Тип детали')

    class Meta:
        verbose_name = 'Деталь сертификата'
        verbose_name_plural = 'Детали сертификата'
        ordering = ['order']

    def __str__(self):
        return self.text


class Review(models.Model):
    """Model for customer reviews"""
    RATING_CHOICES = (
        (1, '1 - Очень плохо'),
        (2, '2 - Плохо'),
        (3, '3 - Нормально'),
        (4, '4 - Хорошо'),
        (5, '5 - Отлично')
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews', verbose_name='Пользователь')
    text = models.TextField(verbose_name='Текст отзыва')
    rating = models.IntegerField(choices=RATING_CHOICES, verbose_name='Оценка')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    approved = models.BooleanField(default=False, verbose_name='Одобрен')
    
    class Meta:
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'Отзыв от {self.user} - {self.rating}/5'

class Contact(models.Model):
    """Model for company contact persons"""
    first_name = models.CharField(max_length=100, verbose_name='Имя')
    last_name = models.CharField(max_length=100, verbose_name='Фамилия')
    position = models.CharField(max_length=100, verbose_name='Должность')
    department = models.CharField(max_length=100, verbose_name='Отдел')
    email = models.EmailField(verbose_name='Email')
    phone = models.CharField(max_length=20, verbose_name='Телефон')
    photo = models.ImageField(upload_to='contacts/', blank=True, null=True, verbose_name='Фотография')
    bio = models.TextField(blank=True, null=True, verbose_name='Биография')
    is_main_contact = models.BooleanField(default=False, verbose_name='Основной контакт')
    order = models.PositiveIntegerField(default=0, verbose_name='Порядок отображения')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')

    class Meta:
        verbose_name = 'Контактное лицо'
        verbose_name_plural = 'Контактные лица'
        ordering = ['order', 'last_name', 'first_name']

    def __str__(self):
        return f"{self.last_name} {self.first_name} - {self.position}"

    def get_full_name(self):
        return f"{self.last_name} {self.first_name}"

    def save(self, *args, **kwargs):
        if not self.pk:
            max_order = Contact.objects.aggregate(models.Max('order'))['order__max']
            self.order = (max_order or 0) + 1
        super().save(*args, **kwargs)

class Partner(models.Model):
    """Model for partner companies"""
    name = models.CharField(max_length=100, verbose_name='Название компании')
    logo = models.ImageField(upload_to='partners/', verbose_name='Логотип')
    website_url = models.URLField(verbose_name='Сайт компании')
    description = models.TextField(verbose_name='Описание', blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата добавления')

    class Meta:
        verbose_name = 'Партнер'
        verbose_name_plural = 'Партнеры'
        ordering = ['name']

    def __str__(self):
        return self.name

class GlossaryEntry(models.Model):
    """Model for glossary entries (FAQ)"""
    question = models.CharField(max_length=255, verbose_name='Вопрос')
    answer = models.TextField(verbose_name='Ответ')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата добавления')

    class Meta:
        verbose_name = 'Запись в словаре'
        verbose_name_plural = 'Записи в словаре'
        ordering = ['-created_at']

    def __str__(self):
        return self.question

class Vacancy(models.Model):
    """Model for job vacancies"""
    title = models.CharField(max_length=200, verbose_name='Название вакансии')
    description = models.TextField(verbose_name='Описание')
    requirements = models.TextField(verbose_name='Требования')
    published_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата публикации')
    is_active = models.BooleanField(default=True, verbose_name='Активна')

    class Meta:
        verbose_name = 'Вакансия'
        verbose_name_plural = 'Вакансии'
        ordering = ['-published_at']

    def __str__(self):
        return self.title

class Banner(models.Model):
    """Model for banners on the home page"""
    title = models.CharField(max_length=100, verbose_name='Заголовок')
    subtitle = models.CharField(max_length=200, blank=True, null=True, verbose_name='Подзаголовок')
    image = models.ImageField(upload_to='banners/', verbose_name='Изображение')
    link = models.URLField(verbose_name='Ссылка', blank=True)
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    order = models.PositiveIntegerField(default=0, verbose_name='Порядок')

    class Meta:
        verbose_name = 'Баннер'
        verbose_name_plural = 'Баннеры'
        ordering = ['order']

    def __str__(self):
        return self.title


class Slider(models.Model):
    """Model for slider settings"""
    name = models.CharField(max_length=100, verbose_name='Название слайдера', default='Main Slider')
    autoplay = models.BooleanField(default=True, verbose_name='Автоматическая прокрутка')
    autoplay_speed = models.PositiveIntegerField(default=3000, verbose_name='Скорость автоматической прокрутки (в мс)')
    arrows = models.BooleanField(default=True, verbose_name='Показывать стрелки')
    dots = models.BooleanField(default=True, verbose_name='Показывать точки')

    class Meta:
        verbose_name = 'Настройки слайдера'
        verbose_name_plural = 'Настройки слайдеров'

    def __str__(self):
        return self.name