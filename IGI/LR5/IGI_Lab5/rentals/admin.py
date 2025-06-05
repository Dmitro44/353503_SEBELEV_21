from django.contrib import admin

from rentals.models import RentalPenalty, Rental, PenaltyType, PromoCode


class RentalPenaltyInline(admin.TabularInline):
    model = RentalPenalty
    extra = 0


@admin.register(Rental)
class RentalAdmin(admin.ModelAdmin):
    list_display = ('user', 'vehicle', 'rental_date', 'expected_return_date',
                    'actual_return_date', 'total_amount', 'is_active')
    list_filter = ('is_active', 'rental_date')
    search_fields = ('user__last_name', 'user__first_name', 'vehicle__license_plate')
    inlines = [RentalPenaltyInline]
    readonly_fields = ('rental_amount', 'total_amount')

@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_percentage', 'valid_from', 'valid_to',
                    'current_uses', 'max_uses', 'is_active', 'is_valid')
    list_filter = ('is_active', 'valid_from', 'valid_to')
    search_fields = ('code', 'description')
    readonly_fields = ('current_uses', 'is_valid')
    date_hierarchy = 'valid_from'


@admin.register(PenaltyType)
class PenaltyTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'amount')
    search_fields = ('name',)


@admin.register(RentalPenalty)
class RenalPenaltyAdmin(admin.ModelAdmin):
    list_display = ('rental', 'penalty_type', 'date_applied')
    list_filter = ('date_applied',)
    search_fields = ('rental__user__last_name', 'penalty_type__name')
