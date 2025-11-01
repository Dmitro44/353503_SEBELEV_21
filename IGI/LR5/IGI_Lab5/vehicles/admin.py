from django.contrib import admin

from vehicles.models import CarModel, Vehicle, CarPark, BodyType


@admin.register(BodyType)
class BodyTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    list_filter = ('name', 'description')
    search_fields = ('name', 'description')

@admin.register(CarModel)
class CarModelAdmin(admin.ModelAdmin):
    list_display = ('brand', 'model', 'body_type')
    list_filter = ('body_type', 'brand')
    search_fields = ('brand', 'model')

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('license_plate', 'car_model', 'year', 'is_available', 'daily_rental_price')
    list_filter = ('is_available', 'car_model__brand', 'car_model__body_type', 'year')
    search_fields = ('license_plate', 'car_model__brand', 'car_model__model')

@admin.register(CarPark)
class CarParkAdmin(admin.ModelAdmin):
    list_display = ('name', 'address')
    search_fields = ('name', 'address')
