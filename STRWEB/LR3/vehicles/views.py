import logging

from django.db.models import Q
from django.shortcuts import render, get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View # Добавлен импорт View
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import VehicleSerializer
from .models import Vehicle, CarModel, BodyType, CarPark
from .forms import VehicleForm
from authentication.decorators import staff_required
from django.contrib import messages

logger = logging.getLogger("vehicles")

class VehicleListAPI(APIView):
    def get(self, request):
        vehicles = Vehicle.objects.all()
        serializer = VehicleSerializer(vehicles, many=True)
        return Response(serializer.data)

class VehicleView(APIView):
    template_name = "carrental/vehicle_list.html"

    def get(self, request):
        brands = CarModel.objects.values_list("brand", flat=True).distinct()
        body_types = BodyType.objects.all()
        car_parks = CarPark.objects.all()
        years = (
            Vehicle.objects.values_list("year", flat=True).distinct().order_by("-year")
        )

        context = {
            "brands": brands,
            "body_types": body_types,
            "car_parks": car_parks,
            "years": years,
        }

        return render(request, self.template_name, context)


class VehicleDetailView(View):
    template_name = "carrental/vehicle_detail.html"

    def get(self, request, pk):
        vehicle = get_object_or_404(Vehicle, pk=pk)

        form = None
        if request.user.is_authenticated:
            form = VehicleForm(instance=vehicle)

        context = {"vehicle": vehicle, "form": form}

        return render(request, self.template_name, context)


class VehicleUpdateView(View):
    template_name = "carrental/vehicle_form.html"

    @method_decorator(staff_required)
    def get(self, request, pk):
        vehicle = get_object_or_404(Vehicle, pk=pk)

        form = VehicleForm(instance=vehicle)

        context = {"form": form, "vehicle": vehicle, "is_update": True}

        return render(request, self.template_name, context)

    @method_decorator(staff_required)
    def post(self, request, pk):
        vehicle = get_object_or_404(Vehicle, pk=pk)

        form = VehicleForm(request.POST, request.FILES, instance=vehicle)

        if form.is_valid():
            form.save()
            messages.success(
                request,
                f"Автомобиль {vehicle.car_model.brand} {vehicle.car_model.model} успешно обновлен!",
            )
            return redirect("vehicle_detail", pk=pk)

        context = {"form": form, "vehicle": vehicle, "is_update": True}

        return render(request, self.template_name, context)


class VehicleDeleteView(View):
    template_name = "carrental/vehicle_confirm_delete.html"

    @method_decorator(staff_required)
    def get(self, request, pk):
        vehicle = get_object_or_404(Vehicle, pk=pk)

        context = {"vehicle": vehicle}

        return render(request, self.template_name, context)

    @method_decorator(staff_required)
    def post(self, request, pk):
        vehicle = get_object_or_404(Vehicle, pk=pk)

        brand = vehicle.car_model.brand
        model = vehicle.car_model.model

        vehicle.delete()

        messages.success(request, f"Автомобиль {brand} {model} успешно удален!")
        return redirect("vehicle_list")


class VehicleCreateView(View):
    template_name = "carrental/vehicle_form.html"

    @method_decorator(staff_required)
    def get(self, request):
        form = VehicleForm()

        context = {"form": form, "is_update": False}

        return render(request, self.template_name, context)

    @method_decorator(staff_required)
    def post(self, request):
        form = VehicleForm(request.POST, request.FILES)

        if form.is_valid():
            vehicle = form.save()
            messages.success(
                request,
                f"Автомобиль {vehicle.car_model.brand} {vehicle.car_model.model} успешно создан!",
            )
            return redirect("vehicle_detail", pk=vehicle.pk)

        context = {"form": form, "is_update": False}

        return render(request, self.template_name, context)
