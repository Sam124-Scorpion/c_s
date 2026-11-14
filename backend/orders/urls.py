from django.urls import path

from .views import AdminOrderListView, AdminOrderUpdateView, CustomerOrderListCreateView

urlpatterns = [
    path('', CustomerOrderListCreateView.as_view(), name='customer-orders'),
    path('admin/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/<int:pk>/', AdminOrderUpdateView.as_view(), name='admin-order-update'),
]
