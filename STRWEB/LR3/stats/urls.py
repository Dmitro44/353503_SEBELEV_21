from django.urls import path

from stats import views

urlpatterns = [
    path('dashboard/', views.StatisticsDashboardView.as_view(), name='statistics_dashboard'),
]