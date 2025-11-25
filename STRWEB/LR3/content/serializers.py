from rest_framework import serializers
from .models import Contact

class ContactSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = Contact
        fields = [
            'id', 
            'first_name', 
            'last_name',
            'full_name',
            'position', 
            'department', 
            'email', 
            'phone', 
            'photo_url',
            'bio', 
        ]

    def get_photo_url(self, obj):
        if obj.photo:
            return obj.photo.url
        return None
