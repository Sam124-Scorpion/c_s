from django.urls import path

from .views import (
    AdminCakeImageDeleteView,
    AdminCakeImagePrimaryView,
    CategoryListView,
    CakeListView,
    CakeDetailView,
    AdminCakeListCreateView,
    AdminCategoryCreateView,
    AdminCategoryUpdateView,
    AdminCakeImageCreateView,
    AdminCakeUpdateView,
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('cakes/', CakeListView.as_view(), name='cake-list'),
    path('cakes/<int:pk>/', CakeDetailView.as_view(), name='cake-detail'),

    #admin categories views
    path('admin/categories/', AdminCategoryCreateView.as_view(), name='admin-category-list'),
    path('admin/categories/<int:pk>/', AdminCategoryUpdateView.as_view(), name='admin-category-detail'),

    #admin cakes views
    path('admin/cakes/', AdminCakeListCreateView.as_view(), name='admin-cake-list'),
    path('admin/cakes/<int:pk>/', AdminCakeUpdateView.as_view(), name='admin-cake-detail'),


    #admin cake images views
    path('admin/cakes/<int:pk>/images/', AdminCakeImageCreateView.as_view(), name='admin-cake-image-list'),
    path('admin/cakes/<int:pk>/images/<int:image_pk>/primary', AdminCakeImagePrimaryView.as_view(), name='admin-cake-image-primary'),
    path('admin/cakes/<int:pk>/images/<int:image_pk>/delete/', AdminCakeImageDeleteView.as_view(), name='admin-cake-image-delete'),


]
