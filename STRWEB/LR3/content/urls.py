from django.urls import path
from . import views

urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('about/', views.AboutView.as_view(), name='about'),
    path('contacts/', views.ContactsView.as_view(), name='contacts'),
    path('glossary/', views.GlossaryView.as_view(), name='glossary'),
    path('privacy-policy/', views.PrivacyPolicyView.as_view(), name='privacy_policy'),
    path('vacancies/', views.VacancyListView.as_view(), name='vacancy_list'),
    path('news/', views.NewsListView.as_view(), name='news_list'),
    path('news/<int:pk>/', views.NewsDetailView.as_view(), name='news_detail'),
    path('news/create/', views.ArticleCreateView.as_view(), name='article_create'),
    path('news/<int:pk>/edit/', views.ArticleUpdateView.as_view(), name='article_edit'),
    path('news/<int:pk>/delete/', views.ArticleDeleteView.as_view(), name='article_delete'),
    path('reviews/', views.ReviewListView.as_view(), name='review_list'),
    path('reviews/add/', views.ReviewCreateView.as_view(), name='review_add'),
    path('staff/reviews/', views.ReviewManagementView.as_view(), name='review_management'),
    path('staff/review/<int:pk>/approve', views.ReviewApproveView.as_view(), name='review_approve'),
    path('slider-settings/', views.SliderSettingsView.as_view(), name='slider_settings'),
    path('employee-contacts/', views.EmployeeContactsTableView.as_view(), name='employee_contacts_table'),
]