from django import forms
from django.db import models
from django.utils import timezone
from .models import Rental, PenaltyType, PromoCode
from vehicles.models import Vehicle
from users.models import User

class RentalCreateForm(forms.ModelForm):
    """Form for creating a new rental"""
    
    class Meta:
        model = Rental
        fields = ['vehicle', 'rental_days', 'promo_code']
        widgets = {
            'rental_days': forms.NumberInput(attrs={'min': 1, 'class': 'form-control'}),
            'vehicle': forms.Select(attrs={'class': 'form-control'}),
            'promo_code': forms.Select(attrs={'class': 'form-control'}),
        }
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        # Only show available vehicles
        self.fields['vehicle'].queryset = Vehicle.objects.filter(is_available=True)
        
        # Only show valid promo codes
        today = timezone.now().date()
        self.fields['promo_code'].queryset = PromoCode.objects.filter(
            is_active=True,
            valid_from__lte=today,
            valid_to__gte=today,
            current_uses__lt=models.F('max_uses')
        )
        
        # Add an empty choice for no promo code
        self.fields['promo_code'].empty_label = "Нет промокода"
        
        # Add Bootstrap classes
        for field_name, field in self.fields.items():
            if 'class' not in field.widget.attrs:
                field.widget.attrs['class'] = 'form-control'
    
    def clean_vehicle(self):
        vehicle = self.cleaned_data.get('vehicle')
        if vehicle and not vehicle.is_available:
            raise forms.ValidationError("Этот автомобиль недоступен для проката")
        return vehicle
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.user = self.user
        instance.status = 'active'
        instance.rental_date = timezone.now().date()
        
        # Calculate expected return date
        rental_days = self.cleaned_data.get('rental_days', 1)
        instance.expected_return_date = instance.rental_date + timezone.timedelta(days=rental_days)
        
        if commit:
            instance.save()
            
            # Set vehicle as unavailable
            vehicle = instance.vehicle
            vehicle.is_available = False
            vehicle.save()
            
        return instance


class RentalReturnForm(forms.ModelForm):
    """Form for returning a rental with optional penalties"""
    
    penalty_types = forms.ModelMultipleChoiceField(
        queryset=PenaltyType.objects.all(),
        required=False,
        widget=forms.CheckboxSelectMultiple(attrs={'class': 'list-unstyled'}),
        label='Штрафы'
    )
    
    penalty_notes = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 3, 'class': 'form-control'}),
        required=False,
        label='Примечания к штрафам'
    )
    
    class Meta:
        model = Rental
        fields = ['actual_return_date', 'condition_notes']
        widgets = {
            'actual_return_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'condition_notes': forms.Textarea(attrs={'rows': 3, 'class': 'form-control'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['actual_return_date'].initial = timezone.now().date()
        
        # Add Bootstrap classes
        for field_name, field in self.fields.items():
            if 'class' not in field.widget.attrs:
                field.widget.attrs['class'] = 'form-control'
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.status = 'returned'
        
        if commit:
            instance.save()
            
            # Add penalties if any
            penalty_types = self.cleaned_data.get('penalty_types', [])
            penalty_notes = self.cleaned_data.get('penalty_notes', '')
            
            for penalty_type in penalty_types:
                instance.penalties.create(
                    penalty_type=penalty_type,
                    notes=penalty_notes
                )
            
            # Set vehicle as available
            vehicle = instance.vehicle
            vehicle.is_available = True
            vehicle.save()
            
            # Recalculate total amount
            instance.save()
            
        return instance


class PromoCodeForm(forms.ModelForm):
    class Meta:
        model = PromoCode
        fields = ['code', 'description', 'discount_percentage', 'valid_from', 'valid_to', 'is_active', 'max_uses']
        widgets = {
            'valid_from': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'valid_to': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'code': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'rows': 3, 'class': 'form-control'}),
            'discount_percentage': forms.NumberInput(attrs={'class': 'form-control', 'min': 0, 'max': 100}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'max_uses': forms.NumberInput(attrs={'class': 'form-control', 'min': 1}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Установите сегодняшнюю дату как значение по умолчанию для valid_from
        if not kwargs.get('instance'):
            self.fields['valid_from'].initial = timezone.now().date()
            # Установите дату месяц вперед как значение по умолчанию для valid_to
            self.fields['valid_to'].initial = (timezone.now() + timezone.timedelta(days=30)).date()