from django.contrib import admin
from .models import Article, CompanyInfo, Review

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at', 'published', 'published_at')
    list_filter = ('published',)
    search_fields = ('title', 'content')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'content', 'summary', 'image')
        }),
        ('Публикация', {
            'fields': ('published', 'published_at', 'created_at', 'updated_at')
        }),
    )


@admin.register(CompanyInfo)
class CompanyInfoAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'email')
    search_fields = ('name', 'description')
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'description', 'logo')
        }),
        ('Контактная информация', {
            'fields': ('address', 'phone', 'email', 'working_hours')
        }),
    )
    
    def has_add_permission(self, request):
        # Ограничиваем создание более одной записи
        return CompanyInfo.objects.count() == 0


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'rating', 'created_at', 'approved')
    list_filter = ('rating', 'approved')
    search_fields = ('user__username', 'text')
    readonly_fields = ('created_at',)
    actions = ['approve_reviews']
    
    def approve_reviews(self, request, queryset):
        queryset.update(approved=True)
    approve_reviews.short_description = "Одобрить выбранные отзывы"