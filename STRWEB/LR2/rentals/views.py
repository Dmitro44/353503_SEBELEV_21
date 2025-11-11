import logging
import json

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse_lazy
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views import View
from django.views.generic import ListView, CreateView, DetailView, UpdateView
from rest_framework import permissions

from authentication.decorators import staff_required
from rentals.forms import RentalCreateForm, RentalReturnForm, PromoCodeForm
from rentals.models import Rental, RentalPenalty, PromoCode, Cart, CartItem
from vehicles.models import Vehicle

logger = logging.getLogger("rentals")


class IsRentalClientOrStaff(permissions.BasePermission):
    """
    Custom permission to only allow clients who made the rental or staff to view or edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Check if user is staff
        if hasattr(request.user, "role") and request.user.role.is_staff:
            return True

        # Check if user is the client who made the rental
        return obj.client.user == request.user


class RentalListView(View):
    """View for listing user's rentals"""

    template_name = "rentals/rental_list.html"

    @method_decorator(login_required)
    def get(self, request):
        if hasattr(request.user, "has_role") and request.user.has_role("staff"):
            rentals = Rental.objects.select_related("vehicle", "promo_code").order_by(
                "-created_at"
            )
        else:
            rentals = (
                Rental.objects.select_related("vehicle", "promo_code")
                .filter(user=request.user)
                .order_by("-created_at")
            )

        # Filter by status if provided
        status_filter = request.GET.get("status")
        if status_filter:
            rentals = rentals.filter(status=status_filter)

        context = {
            "rentals": rentals,
            "status_filter": status_filter,
            "status_choices": Rental.STATUS_CHOICES,
        }

        logger.info(f"User {request.user.username} viewed their rentals list")
        return render(request, self.template_name, context)


class RentalDetailView(View):
    """View for showing rental details"""

    template_name = "rentals/rental_detail.html"

    @method_decorator(login_required)
    def get(self, request, pk):
        # Define the base queryset with optimizations
        queryset = Rental.objects.select_related(
            "user", "vehicle__car_model__body_type", "vehicle__car_park", "promo_code"
        ).prefetch_related("penalties__penalty_type")

        # Get rental for the current user or staff
        if request.user.has_role("staff") or request.user.has_role("admin"):
            rental = get_object_or_404(queryset, pk=pk)
        else:
            rental = get_object_or_404(queryset, pk=pk, user=request.user)

        next_url = request.GET.get("next", "")

        context = {
            "rental": rental,
            "penalties": rental.penalties.all(),  # This will now use the prefetched data
            "next_url": next_url,
        }

        logger.info(f"User {request.user.username} viewed rental {rental.pk}")
        return render(request, self.template_name, context)


class RentalCreateView(View):
    """View for creating a new rental"""

    template_name = "rentals/rental_form.html"

    def _get_json_context_data(self, form):
        """Helper method to get JSON data for vehicle prices and promo codes."""
        vehicle_prices = {}
        for vehicle in form.fields["vehicle"].queryset:
            try:
                vehicle_prices[str(vehicle.id)] = float(vehicle.daily_rental_price)
            except (AttributeError, ValueError):
                vehicle_prices[str(vehicle.id)] = 0

        promo_codes = {}
        if "promo_code" in form.fields:
            for promo_choice in form.fields["promo_code"].choices:
                promo_id = promo_choice[0]
                if promo_id:  # Skip empty option
                    try:
                        if hasattr(promo_id, "value"):
                            promo_id_value = int(promo_id.value)
                        else:
                            promo_id_value = int(promo_id)

                        promo = PromoCode.objects.get(id=promo_id_value)
                        promo_codes[str(promo_id_value)] = float(
                            promo.discount_percentage
                        )
                    except (PromoCode.DoesNotExist, ValueError, TypeError):
                        pass

        return {
            "vehicle_prices_json": json.dumps(vehicle_prices),
            "promo_percentages_json": json.dumps(promo_codes),
        }

    @method_decorator(login_required)
    def get(self, request, vehicle_id=None):
        initial = {}
        if vehicle_id:
            vehicle = get_object_or_404(Vehicle, pk=vehicle_id, is_available=True)
            initial["vehicle"] = vehicle

        form = RentalCreateForm(user=request.user, initial=initial)
        context = {
            "form": form,
            "is_update": False,
        }
        context.update(self._get_json_context_data(form))

        return render(request, self.template_name, context)

    @transaction.atomic
    def post(self, request, vehicle_id=None):
        form = RentalCreateForm(request.POST, user=request.user)

        if form.is_valid():
            cart, _ = Cart.objects.get_or_create(user=request.user)
            vehicle = form.cleaned_data["vehicle"]
            rental_days = form.cleaned_data["rental_days"]
            promo_code = form.cleaned_data.get("promo_code")

            cart_item, created = CartItem.objects.update_or_create(
                cart=cart,
                vehicle=vehicle,
                defaults={
                    "rental_days": rental_days,
                    "promo_code": promo_code,
                },
            )

            if created:
                messages.success(
                    request, f"'{vehicle.car_model}' был добавлен в вашу корзину."
                )
            else:
                messages.success(
                    request, f"'{vehicle.car_model}' в вашей корзине был обновлен."
                )

            return redirect("cart")

        # If form is invalid, re-render with the necessary context
        context = {
            "form": form,
            "is_update": False,
        }
        context.update(self._get_json_context_data(form))

        return render(request, self.template_name, context)


@method_decorator(staff_required, name="dispatch")
class RentalConfirmationView(View):
    @transaction.atomic
    def post(self, request, pk):
        rental = get_object_or_404(Rental, pk=pk)
        action = request.POST.get("action")

        if rental.status != "pending":
            messages.error(
                request,
                "Эта заявка уже обработана или не находится в статусе ожидания.",
            )
            return redirect("staff_rental_list")

        if action == "approve":
            rental.status = "active"
            # Делаем автомобиль недоступным при подтверждении аренды
            vehicle = rental.vehicle
            vehicle.is_available = False
            vehicle.save()

            rental.save()
            messages.success(
                request,
                f"Заявка на аренду #{rental.pk} подтверждена. Автомобиль {rental.vehicle} помечен как недоступный.",
            )
            logger.info(
                f"Staff {request.user.username} approved rental {rental.pk} for vehicle {rental.vehicle}"
            )

        elif action == "reject":
            rental.status = "cancelled"
            rental.save()
            messages.error(request, f"Заявка на аренду #{rental.pk} отклонена.")
            logger.info(
                f"Staff {request.user.username} rejected rental {rental.pk} for vehicle {rental.vehicle}"
            )

        else:
            messages.error(request, "Неизвестное действие.")

        return redirect("staff_rental_list")


class RentalReturnView(View):
    """View for returning a rental with optional penalties"""

    template_name = "rentals/rental_return_form.html"

    @method_decorator(staff_required)
    def get(self, request, pk):
        rental = get_object_or_404(Rental, pk=pk)

        # Check if rental is already returned
        if rental.status == "returned":
            messages.error(request, "Этот прокат уже возвращен.")
            return redirect("rental_detail", pk=pk)

        form = RentalReturnForm(instance=rental)

        context = {"form": form, "rental": rental}

        return render(request, self.template_name, context)

    @transaction.atomic
    def post(self, request, pk):
        rental = get_object_or_404(Rental, pk=pk)

        # Check if rental is already returned
        if rental.status == "returned":
            messages.error(request, "Этот прокат уже возвращен.")
            return redirect("rental_detail", pk=pk)

        form = RentalReturnForm(request.POST, instance=rental)

        if form.is_valid():
            rental = form.save(commit=False)
            penalties = form.cleaned_data.get("penalty_types", [])
            total_penalty = 0
            for penalty in penalties:
                RentalPenalty.objects.create(rental=rental, penalty_type=penalty)
                total_penalty += penalty.amount
            rental.total_amount += total_penalty
            rental.actual_return_date = timezone.now().date()
            rental.save()

            vehicle = rental.vehicle
            vehicle.is_available = True
            vehicle.save()

            # Log penalties if any
            penalty_names = ", ".join([p.name for p in penalties])
            logger.info(f"Penalties applied to rental {rental.pk}: {penalty_names}")
            if penalties:
                messages.warning(request, f"Штрафы применены: {penalty_names}")

            messages.success(request, f"Автомобиль {rental.vehicle} успешно возвращен!")
            logger.info(
                f"Staff {request.user.username} processed return of rental {rental.pk}"
            )

            return redirect("rental_detail", pk=rental.pk)

        context = {"form": form, "rental": rental}

        return render(request, self.template_name, context)


class StaffRentalListView(View):
    """View for staff to list all rentals"""

    template_name = "rentals/staff_rental_list.html"

    @method_decorator(staff_required)
    def get(self, request):
        rentals = (
            Rental.objects.select_related("user", "vehicle")
            .all()
            .order_by("-created_at")
        )

        # Filter by status if provided
        status_filter = request.GET.get("status")
        if status_filter:
            rentals = rentals.filter(status=status_filter)

        # Filter by user if provided
        user_filter = request.GET.get("user")
        if user_filter:
            rentals = rentals.filter(user__username__icontains=user_filter)

        context = {
            "rentals": rentals,
            "status_filter": status_filter,
            "user_filter": user_filter,
            "status_choices": Rental.STATUS_CHOICES,
        }

        logger.info(f"Staff {request.user.username} viewed all rentals list")
        return render(request, self.template_name, context)


class PromoCodeListView(ListView):
    model = PromoCode
    template_name = "content/promocode_list.html"
    context_object_name = "promocodes"

    def get_queryset(self):
        # Get active promocodes
        active_promocodes = PromoCode.objects.filter(
            is_active=True, valid_to__gt=timezone.now()
        )
        # Get expired promocodes
        expired_promocodes = PromoCode.objects.filter(
            is_active=False
        ) | PromoCode.objects.filter(valid_to__lte=timezone.now())

        logger.info(
            f"PromoCode list displayed with {active_promocodes.count()} active and {expired_promocodes.count()} expired codes"
        )

        # Return both as a dictionary
        return {"active": active_promocodes, "expired": expired_promocodes}


@method_decorator(staff_required, name="dispatch")
class PromoCodeCreateView(CreateView):
    model = PromoCode
    form_class = PromoCodeForm
    template_name = "content/promocode_form.html"
    success_url = reverse_lazy("promocode_list")

    def form_valid(self, form):
        messages.success(
            self.request, f'Промокод "{form.instance.code}" успешно создан!'
        )
        logger.info(
            f"Staff {self.request.user.username} created promo code: {form.instance.code}"
        )
        return super().form_valid(form)


@method_decorator(staff_required, name="dispatch")
class PromoCodeDetailView(DetailView):
    model = PromoCode
    template_name = "content/promocode_detail.html"
    context_object_name = "promocode"

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        logger.info(f"Staff {self.request.user.username} viewed promo code: {obj.code}")
        return obj


@method_decorator(staff_required, name="dispatch")
class PromoCodeUpdateView(UpdateView):
    model = PromoCode
    form_class = PromoCodeForm
    template_name = "content/promocode_form.html"
    success_url = reverse_lazy("promocode_list")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["is_update"] = True
        return context

    def form_valid(self, form):
        messages.success(
            self.request, f'Промокод "{form.instance.code}" успешно обновлен!'
        )
        logger.info(
            f"Staff {self.request.user.username} updated promo code: {form.instance.code}"
        )
        return super().form_valid(form)


class AddToCartView(View):
    @method_decorator(login_required)
    def post(self, request, vehicle_id):
        vehicle = get_object_or_404(Vehicle, pk=vehicle_id)
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, vehicle=vehicle)

        if not created:
            cart_item.quantity += 1
            cart_item.save()
            messages.success(
                request, f"Еще один '{vehicle.car_model}' добавлен в вашу корзину."
            )
        else:
            messages.success(
                request, f"'{vehicle.car_model}' был добавлен в вашу корзину."
            )

        return redirect("vehicle_detail", pk=vehicle_id)


class CartView(View):
    template_name = "rentals/cart.html"

    @method_decorator(login_required)
    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart_items = cart.items.all()
        total_cart_price = 0

        for item in cart_items:
            base_price = item.vehicle.daily_rental_price * item.rental_days
            discount = 0
            if item.promo_code and item.promo_code.is_valid:
                discount = base_price * (item.promo_code.discount_percentage / 100)
            item.total_price = base_price - discount
            total_cart_price += item.total_price

        context = {
            "cart": cart,
            "cart_items": cart_items,
            "total_cart_price": total_cart_price,
        }
        return render(request, self.template_name, context)


class UpdateCartItemView(View):
    @method_decorator(login_required)
    def post(self, request, item_id):
        cart_item = get_object_or_404(CartItem, pk=item_id, cart__user=request.user)
        rental_days = int(request.POST.get("rental_days", 1))
        if rental_days > 0:
            cart_item.rental_days = rental_days
            cart_item.save()
            messages.success(request, "Количество дней аренды обновлено.")
        else:
            messages.error(request, "Количество дней должно быть больше нуля.")
        return redirect("cart")


class RemoveFromCartView(View):
    @method_decorator(login_required)
    def post(self, request, item_id):
        cart_item = get_object_or_404(CartItem, pk=item_id, cart__user=request.user)
        cart_item.delete()
        messages.success(request, "Товар удален из корзины.")
        return redirect("cart")


class PaymentView(View):
    template_name = "rentals/payment.html"

    @method_decorator(login_required)
    def get(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart_items = cart.items.all()
        if not cart_items:
            messages.error(request, "Ваша корзина пуста.")
            return redirect("cart")

        total_cart_price = 0
        for item in cart_items:
            base_price = item.vehicle.daily_rental_price * item.rental_days
            discount = 0
            if item.promo_code and item.promo_code.is_valid:
                discount = base_price * (item.promo_code.discount_percentage / 100)
            item.total_price = base_price - discount
            total_cart_price += item.total_price

        context = {
            "cart_items": cart_items,
            "total_cart_price": total_cart_price,
        }
        return render(request, self.template_name, context)

    @method_decorator(login_required)
    @transaction.atomic
    def post(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart_items = cart.items.all()

        if not cart_items:
            messages.error(request, "Ваша корзина пуста.")
            return redirect("cart")

        for item in cart_items:
            base_amount = item.vehicle.daily_rental_price * item.rental_days
            discount_amount = 0
            if item.promo_code and item.promo_code.is_valid:
                discount_amount = base_amount * (
                    item.promo_code.discount_percentage / 100
                )
                item.promo_code.current_uses += 1
                item.promo_code.save()

            rental = Rental.objects.create(
                vehicle=item.vehicle,
                user=request.user,
                rental_days=item.rental_days,
                promo_code=item.promo_code,
                rental_amount=base_amount,
                discount_amount=discount_amount,
                total_amount=base_amount - discount_amount,
                status="pending",
            )
            item.vehicle.is_available = False
            item.vehicle.save()

        cart.items.all().delete()

        messages.success(
            request, "Оплата прошла успешно! Ваши заказы на аренду созданы."
        )
        return redirect("payment_success")


class PaymentSuccessView(View):
    template_name = "rentals/payment_success.html"

    @method_decorator(login_required)
    def get(self, request):
        return render(request, self.template_name)


class UpdateCartItemView(View):
    @method_decorator(login_required)
    def post(self, request, item_id):
        cart_item = get_object_or_404(CartItem, pk=item_id, cart__user=request.user)
        quantity = int(request.POST.get("quantity", 1))
        if quantity > 0:
            cart_item.quantity = quantity
            cart_item.save()
            messages.success(request, "Количество обновлено.")
        else:
            messages.error(request, "Количество должно быть больше нуля.")
        return redirect("cart")


class RemoveFromCartView(View):
    @method_decorator(login_required)
    def post(self, request, item_id):
        cart_item = get_object_or_404(CartItem, pk=item_id, cart__user=request.user)
        cart_item.delete()
        messages.success(request, "Товар удален из корзины.")
        return redirect("cart")

