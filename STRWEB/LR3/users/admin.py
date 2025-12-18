from django.contrib import admin

from users.models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('last_name', 'first_name', 'role', 'created_at')
    list_filter = ('role',)
    search_fields = ('last_name', 'email')
    date_hierarchy = 'created_at'