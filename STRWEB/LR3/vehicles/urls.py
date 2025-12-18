from django.urls import path
from . import views

urlpatterns = [
    path('api/', views.VehicleListAPI.as_view(), name='vehicle_list_api'),
    path('', views.VehicleView.as_view(), name='vehicle_list'),
    path('<int:pk>/', views.VehicleDetailView.as_view(), name='vehicle_detail'),
    path('create/', views.VehicleCreateView.as_view(), name='vehicle_create'),
    path('<int:pk>/update/', views.VehicleUpdateView.as_view(), name='vehicle_update'),
    path('<int:pk>/delete/', views.VehicleDeleteView.as_view(), name='vehicle_delete'),
]
