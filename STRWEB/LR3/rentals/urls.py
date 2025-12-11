from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

urlpatterns = [
    # Web views
    path('', views.RentalListView.as_view(), name='rental_list'),
    path('cart/', views.CartView.as_view(), name='cart'),
    path('cart/update/<int:item_id>/', views.UpdateCartItemView.as_view(), name='update_cart_item'),
    path('cart/remove/<int:item_id>/', views.RemoveFromCartView.as_view(), name='remove_from_cart'),
    path('payment/', views.PaymentView.as_view(), name='payment'),
    path('payment/success/', views.PaymentSuccessView.as_view(), name='payment_success'),
    path('<int:pk>/', views.RentalDetailView.as_view(), name='rental_detail'),
    path('create/', views.RentalCreateView.as_view(), name='rental_create'),
    path('create/<int:vehicle_id>/', views.RentalCreateView.as_view(), name='rental_create_for_vehicle'),
    path('<int:pk>/return/', views.RentalReturnView.as_view(), name='rental_return'),
    path('staff/', views.StaffRentalListView.as_view(), name='staff_rental_list'),
    path('<int:pk>/confirm/', views.RentalConfirmationView.as_view(), name='rental_confirm'),

    path('promocodes/', views.PromoCodeListView.as_view(), name='promocode_list'),
    path('promocodes/create/', views.PromoCodeCreateView.as_view(), name='promocode_create'),
    path('promocodes/<int:pk>/', views.PromoCodeDetailView.as_view(), name='promocode_detail'),
    path('promocodes/<int:pk>/edit/', views.PromoCodeUpdateView.as_view(), name='promocode_edit'),
]
