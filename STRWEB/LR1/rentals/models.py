from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from vehicles.models import Vehicle
from users.models import User


class PromoCode(models.Model):
    code = models.CharField(max_length=20, unique=True, verbose_name="Код")
    description = models.TextField(blank=True, verbose_name="Описание")
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Процент скидки",
    )
    valid_from = models.DateField(default=timezone.now, verbose_name="Действует с")
    valid_to = models.DateField(verbose_name="Действует до")
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    max_uses = models.PositiveIntegerField(
        default=1, verbose_name="Максимальное количество использований"
    )
    current_uses = models.PositiveIntegerField(
        default=0, verbose_name="Текущее количество использований"
    )

    class Meta:
        verbose_name = "Промокод"
        verbose_name_plural = "Промокоды"

    def __str__(self):
        return f"{self.code} ({self.discount_percentage}%)"

    @property
    def is_valid(self):
        today = timezone.now().date()
        return (
            self.is_active
            and self.valid_from <= today <= self.valid_to
            and self.current_uses < self.max_uses
        )


class PenaltyType(models.Model):
    name = models.CharField(max_length=100, verbose_name="Наименование штрафа")
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Сумма штрафа",
    )
    description = models.TextField(blank=True, verbose_name="Описание")

    class Meta:
        verbose_name = "Тип штрафа"
        verbose_name_plural = "Типы штрафов"

    def __str__(self):
        return f"{self.name} ({self.amount})"


class Rental(models.Model):
    STATUS_CHOICES = (
        ("pending", "Ожидает подтверждения"),
        ("active", "Активен"),
        ("returned", "Возвращен"),
        ("cancelled", "Отменен"),
        ("overdue", "Просрочен"),
    )

    objects = models.Manager()

    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.PROTECT,
        related_name="rentals",
        verbose_name="Автомобиль",
    )
    user = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="rentals", verbose_name="Клиент"
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending", verbose_name="Статус"
    )
    rental_date = models.DateField(default=timezone.now, verbose_name="Дата выдачи")
    rental_days = models.PositiveIntegerField(
        validators=[MinValueValidator(1)], verbose_name="Количество дней"
    )
    expected_return_date = models.DateField(verbose_name="Ожидаемая дата возврата")
    actual_return_date = models.DateField(
        null=True, blank=True, verbose_name="Фактическая дата возврата"
    )
    rental_amount = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Сумма проката"
    )

    promo_code = models.ForeignKey(
        PromoCode,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="rentals",
        verbose_name="Промокод",
    )

    discount_amount = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Сумма скидки"
    )

    total_amount = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Итоговая сумма"
    )
    condition_notes = models.TextField(
        blank=True, verbose_name="Примечания о состоянии автомобиля"
    )
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Прокат"
        verbose_name_plural = "Прокаты"
        ordering = ["-rental_date"]

    def save(self, *args, **kwargs):
        # Calculate expected return date if not provided
        if not self.expected_return_date:
            self.expected_return_date = timezone.now() + timezone.timedelta(
                days=self.rental_days
            )

        # Calculate rental amount
        self.rental_amount = self.vehicle.daily_rental_price * self.rental_days

        # Calculate total amount
        self.total_amount = self.rental_amount - self.discount_amount

        # Add penalty amounts if any
        if self.pk:
            for penalty in self.penalties.all():
                self.total_amount += penalty.penalty_type.amount

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Прокат {self.vehicle} для {self.user} от {self.rental_date}"


class RentalPenalty(models.Model):
    rental = models.ForeignKey(
        Rental,
        on_delete=models.CASCADE,
        related_name="penalties",
        verbose_name="Прокат",
    )
    penalty_type = models.ForeignKey(
        PenaltyType,
        on_delete=models.PROTECT,
        related_name="rental_penalties",
        verbose_name="Тип штрафа",
    )
    date_applied = models.DateField(
        default=timezone.now, verbose_name="Дата применения"
    )
    notes = models.TextField(blank=True, verbose_name="Примечания")

    objects = models.Manager()

    class Meta:
        verbose_name = "Штраф по прокату"
        verbose_name_plural = "Штрафы по прокатам"

    def __str__(self):
        return f"Штраф {self.penalty_type} для проката {self.rental}"

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart for {self.user.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    rental_days = models.PositiveIntegerField(default=1)
    promo_code = models.ForeignKey(PromoCode, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"1 of {self.vehicle.car_model} for {self.rental_days} days in cart for {self.cart.user.username}"
