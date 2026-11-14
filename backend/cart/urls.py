from django.urls import path
from .views import CartView, AddToCartView , UpdateCartItemView , RemoveCartItemView

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/add/', AddToCartView.as_view(), name='add-to-cart'),
    path('cart/items/<int:item_id>/', UpdateCartItemView.as_view(), name='update-cart-item'),
    path('cart/items/<int:item_id>/remove/', RemoveCartItemView.as_view(), name='remove-cart-item'),
]