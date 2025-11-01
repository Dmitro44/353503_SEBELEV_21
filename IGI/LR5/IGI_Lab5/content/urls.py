from django.urls import path
from . import views

urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('about/', views.AboutView.as_view(), name='about'),
    path('contacts/', views.ContactsView.as_view(), name='contacts'),
    path('news/', views.NewsListView.as_view(), name='news_list'),
    path('news/<int:pk>/', views.NewsDetailView.as_view(), name='news_detail'),
    path('news/create/', views.ArticleCreateView.as_view(), name='article_create'),
    path('news/<int:pk>/edit/', views.ArticleUpdateView.as_view(), name='article_edit'),
    path('news/<int:pk>/delete/', views.ArticleDeleteView.as_view(), name='article_delete'),
    path('reviews/', views.ReviewListView.as_view(), name='review_list'),
    path('reviews/add/', views.ReviewCreateView.as_view(), name='review_add'),
    path('staff/reviews/', views.ReviewManagementView.as_view(), name='review_management'),
    path('staff/review/<int:pk>/approve', views.ReviewApproveView.as_view(), name='review_approve')
]