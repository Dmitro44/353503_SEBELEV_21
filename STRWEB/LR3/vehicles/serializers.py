from rest_framework import serializers
from .models import Vehicle, CarModel, BodyType, CarPark

class BodyTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyType
        fields = '__all__'

class CarModelSerializer(serializers.ModelSerializer):
    body_type = BodyTypeSerializer()
    class Meta:
        model = CarModel
        fields = '__all__'

class CarParkSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarPark
        fields = '__all__'

class VehicleSerializer(serializers.ModelSerializer):
    car_model = CarModelSerializer()
    car_park = CarParkSerializer()

    class Meta:
        model = Vehicle
        fields = '__all__'
