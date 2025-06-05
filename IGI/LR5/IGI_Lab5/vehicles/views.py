import logging

from django.db.models import Q
from django.shortcuts import render, redirect, get_object_or_404
from django.utils.decorators import method_decorator
from rest_framework.views import View

from vehicles.forms import VehicleForm
from vehicles.models import Vehicle, CarModel, BodyType, CarPark

from authentication.decorators import staff_required

from django.contrib import messages

logger = logging.getLogger('vehicles')

class VehicleView(View):
    template_name = 'carrental/vehicle_list.html'

    def get(self, request):
        vehicles = Vehicle.objects.all()

        brand = request.GET.get('brand')
        if brand:
            vehicles = vehicles.filter(car_model__brand=brand)

        body_type = request.GET.get('body_type')
        if body_type:
            vehicles = vehicles.filter(car_model__body_type=body_type)

        year = request.GET.get('year')
        if year:
            vehicles = vehicles.filter(year=year)

        is_available = request.GET.get('is_available')
        if is_available is not None and is_available != '':
            is_available = is_available.lower() == "true"
            vehicles = vehicles.filter(is_available=is_available)

        car_park = request.GET.get('car_park')
        if car_park:
            vehicles = vehicles.filter(car_park=car_park)

        search = request.GET.get('search')
        if search:
            vehicles = vehicles.filter(
                Q(license_plate__icontains=search) |
                Q(car_model__brand__icontains=search) |
                Q(car_model__body_type__name__icontains=search)
            )

        ordering = request.GET.get('ordering')
        if ordering and ordering in ['daily_rental_price', '-daily_rental_price',
                                     'year', '-year',
                                     'car_price', '-car_price']:
            vehicles = vehicles.order_by(ordering)
        else:
            vehicles = vehicles.order_by('daily_rental_price')

        brands = CarModel.objects.values_list('brand', flat=True).distinct()
        body_types = BodyType.objects.all()
        car_parks = CarPark.objects.all()
        years = Vehicle.objects.values_list('year', flat=True).distinct().order_by('-year')

        form = VehicleForm()

        context = {
            'vehicles': vehicles,
            'brands': brands,
            'body_types': body_types,
            'car_parks': car_parks,
            'years': years,
            'form': form,
            'selected_brand': brand,
            'selected_body_type': body_type,
            'selected_year': year,
            'selected_is_available': is_available,
            'selected_car_park': car_park,
            'search_query': search,
            'current_ordering': ordering or 'daily_rental_price'
        }

        return render(request, self.template_name, context)

    @method_decorator(staff_required)
    def post(self, request):
        form = VehicleForm(request.POST)

        if form.is_valid():
            vehicle = form.save()
            messages.success(request, f'Автомобиль {vehicle.car_model.brand} {vehicle.car_model.model} успешно добавлен!')
            return redirect('vehicle_list')

        vehicles = Vehicle.objects.all().order_by('daily_rental_price')
        brands = CarModel.objects.values_list('brand', flat=True).distinct()
        body_types = BodyType.objects.all()
        car_parks = CarPark.objects.all()
        years = Vehicle.objects.values_list('year', flat=True).distinct().order_by('-year')

        context = {
            'vehicles': vehicles,
            'brands': brands,
            'body_types': body_types,
            'car_parks': car_parks,
            'years': years,
            'form': form,
            'form_errors': form.errors
        }

        return render(request, self.template_name, context)

class VehicleDetailView(View):
    template_name = 'carrental/vehicle_detail.html'

    def get(self, request, pk):
        vehicle = get_object_or_404(Vehicle, pk=pk)

        form = None
        if request.user.is_authenticated:
            form = VehicleForm(instance=vehicle)

        context = {
            'vehicle': vehicle,
            'form': form
        }

        return render(request, self.template_name, context)

class VehicleUpdateView(View):
    template_name = 'carrental/vehicle_form.html'

    @method_decorator(staff_required)
    def get(self, request, pk):
        vehicle = get_object_or_404(Vehicle, pk=pk)

        form = VehicleForm(instance=vehicle)

        context = {
            'form': form,
            'vehicle': vehicle,
            'is_update': True
        }

        return render(request, self.template_name, context)

    @method_decorator(staff_required)
    def post(self, request, pk):
        vehicle = get_object_or_404(Vehicle, pk=pk)

        form = VehicleForm(request.POST, request.FILES, instance=vehicle)

        if form.is_valid():
            form.save()
            messages.success(request, f'Автомобиль {vehicle.car_model.brand} {vehicle.car_model.model} успешно обновлен!')
            return redirect('vehicle_detail', pk=pk)

        context = {
            'form': form,
            'vehicle': vehicle,
            'is_update': True
        }

        return render(request, self.template_name, context)

class VehicleDeleteView(View):
    template_name = 'carrental/vehicle_confirm_delete.html'

    @method_decorator(staff_required)
    def get(self, request, pk):
        vehicle = get_object_or_404(Vehicle, pk=pk)

        context = {
            'vehicle': vehicle
        }

        return render(request, self.template_name, context)

    @method_decorator(staff_required)
    def post(self, request, pk):
        vehicle = get_object_or_404(Vehicle, pk=pk)

        brand = vehicle.car_model.brand
        model = vehicle.car_model.model

        vehicle.delete()

        messages.success(request, f'Автомобиль {brand} {model} успешно удален!')
        return redirect('vehicle_list')

class VehicleCreateView(View):
    template_name = 'carrental/vehicle_form.html'

    @method_decorator(staff_required)
    def get(self, request):
        form = VehicleForm()

        context = {
            'form': form,
            'is_update': False
        }

        return render(request, self.template_name, context)

    @method_decorator(staff_required)
    def post(self, request):
        form = VehicleForm(request.POST, request.FILES)

        if form.is_valid():
            vehicle = form.save()
            messages.success(request, f'Автомобиль {vehicle.car_model.brand} {vehicle.car_model.model} успешно создан!')
            return redirect('vehicle_detail', pk=vehicle.pk)

        context = {
            'form': form,
            'is_update': False
        }

        return render(request, self.template_name, context)