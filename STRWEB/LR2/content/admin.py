from django.contrib import admin
from .models import Article, CompanyInfo, Review, Partner, Contact, GlossaryEntry, Vacancy, Banner, CertificateDetail

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

class CertificateDetailInline(admin.TabularInline):
    model = CertificateDetail
    extra = 1
    fields = ('text', 'detail_type', 'order')

@admin.register(CompanyInfo)
class CompanyInfoAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'email')
    search_fields = ('name', 'description')
    inlines = [CertificateDetailInline]
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'description', 'logo', 'video_url')
        }),
        ('Контактная информация', {
            'fields': ('address', 'phone', 'email', 'working_hours')
        }),
        ('Дополнительная информация', {
            'fields': ('history', 'requisites', 'certificate_issue_date', 'certificate_expiry_date')
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

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('get_full_name', 'position', 'email', 'phone', 'order', 'is_main_contact')
    list_filter = ('department', 'is_main_contact')
    search_fields = ('first_name', 'last_name', 'position', 'email')
    list_editable = ('order', 'is_main_contact')

@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ('name', 'website_url', 'created_at')
    search_fields = ('name',)

@admin.register(GlossaryEntry)
class GlossaryEntryAdmin(admin.ModelAdmin):
    list_display = ('question', 'created_at')
    search_fields = ('question', 'answer')

@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ('title', 'published_at', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('title', 'description', 'requirements')

@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'order')
    list_editable = ('is_active', 'order')
    search_fields = ('title', 'subtitle')